const Campaign = require('../models/Campaign');
const User = require('../models/User');
const { publishMessage, ROUTING_KEYS } = require('../config/rabbitmq');
const { validationResult } = require('express-validator');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const mongoose = require('mongoose');
const { isValidObjectId } = mongoose;
const togetherGenerateInsight  = require('../utils/llm');

const buildAggregationFromRules = (segments) => {
  if (!Array.isArray(segments)) {
    throw new Error('Invalid segments data: expected an array');
  }

  const orConditions = segments.map((group) => {
    const groupOperator = group.operator === 'OR' ? '$or' : '$and';
    
    const ruleConditions = group.rules.map((rule) => {
      const { field, operator: op, value } = rule;
      
      let convertedValue = value;
      // Type conversion handling
      if (!isNaN(value) && value !== '') {
        convertedValue = Number(value);
      } else if (typeof value === 'string' && value.toLowerCase() === 'true') {
        convertedValue = true;
      } else if (typeof value === 'string' && value.toLowerCase() === 'false') {
        convertedValue = false;
      }

      switch (op) {
        case '>': return { [field]: { $gt: convertedValue } };
        case '<': return { [field]: { $lt: convertedValue } };
        case '>=': return { [field]: { $gte: convertedValue } };
        case '<=': return { [field]: { $lte: convertedValue } };
        case '==': return { [field]: convertedValue };
        case '!=': return { [field]: { $ne: convertedValue } };
        default: throw new Error(`Unsupported operator: ${op}`);
      }
    });

    return { [groupOperator]: ruleConditions };
  });

  // Debug the actual MongoDB query being generated
  // console.log('MongoDB query conditions:', JSON.stringify(orConditions, null, 2));

  // Combine all segment groups with $or
  return [{ $match: { $or: orConditions } }];
};

exports.previewAudience = async (req, res) => {
  try {
    // console.log('Previewing audience for segments:', JSON.stringify(req.body, null, 2));
    const { segments } = req.body;

    if (!Array.isArray(segments)) {
      return res.status(400).json({ message: 'Invalid or missing segments' });
    }


    const adminId = typeof req.user.id === 'string' ? 
      mongoose.Types.ObjectId(req.user.id) : req.user.id;


    // Get total user count before applying any filters (for debugging)
    const totalUsers = await User.countDocuments({ assignedAdmin: adminId });
    
    // console.log(`Total users before filtering: ${totalUsers}`);

    // First, build the pipeline with ONLY admin filter
    const baseMatchPipeline = [
      { $match: { assignedAdmin: adminId } }
    ];
    
    // Verify admin filter first
    const usersWithAdmin = await User.aggregate([
      ...baseMatchPipeline,
      { $count: "total" }
    ]);
    // console.log('Users with matching admin ID:', usersWithAdmin.length > 0 ? usersWithAdmin[0].total : 0);
    
    // Now build the full pipeline
    const segmentPipeline = buildAggregationFromRules(segments);
    const fullPipeline = [
      ...baseMatchPipeline,
      ...segmentPipeline
    ];
    
    // console.log('Full aggregation pipeline:', JSON.stringify(fullPipeline, null, 2));
    

    // Execute both pipelines in parallel
    const [countResult, audienceUsers] = await Promise.all([
      User.aggregate([
        ...fullPipeline,
        { $count: "total" }
      ]),
      User.aggregate([
        ...fullPipeline,
        { $project: { _id: 1, email: 1, name: 1, orderCount: 1,  status: 1, totalSpend: 1, lastOrderDate: 1 } }
      ])
    ]);

    // console.log('Count result:', countResult);

    const audienceSize = countResult.length > 0 ? countResult[0].total : 0;
    // console.log('Audience', audienceUsers);

    // If we found no users, test variations of the query
    if (audienceSize === 0) {
      // console.log('No users found. Testing segment rules individually...');
      
      // Test each segment individually
      for (const segment of segments) {
        for (const rule of segment.rules) {
          const testQuery = { [rule.field]: { [`$${rule.operator === '==' ? 'eq' : rule.operator}`]: rule.value } };
          // console.log(`Testing rule ${rule.field} ${rule.operator} ${rule.value}:`, testQuery);
          const count = await User.countDocuments({ assignedAdmin: adminId, ...testQuery });
          // console.log(`Rule match count: ${count}`);
        }
      }
      
      // Check for field existence
      if (segments.length > 0 && segments[0].rules.length > 0) {
        const field = segments[0].rules[0].field;
        const fieldExists = await User.aggregate([
          { $match: { assignedAdmin: adminId } },
          { $project: { hasField: { $cond: { if: { $ifNull: [`$${field}`, false] }, then: true, else: false } } } },
          { $match: { hasField: true } },
          { $count: "total" }
        ]);
        // console.log(`Users with field ${field}:`, fieldExists.length > 0 ? fieldExists[0].total : 0);
      }
    }

    res.json({ size: audienceSize, audience: audienceUsers });
  } catch (err) {
    console.error('Error in audience preview:', err);
    res.status(500).json({ message: 'Failed to preview audience' });
  }
};

exports.createCampaign = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, segments, scheduledAt } = req.body;
  
  try {
    // Build and execute aggregation pipeline to get matched users
    const pipeline = buildAggregationFromRules(segments);
    
    const audienceUsers = await User.aggregate([
      ...pipeline,
      { $project: { _id: 1 } }
    ]);
    // console.log('Audience users:', audienceUsers);

    const audienceSize = audienceUsers.length;
    const audienceUserIds = audienceUsers.map((u) => u._id);

    if (audienceSize === 0) {
      return res.status(400).json({ 
        msg: 'Campaign cannot be created: No users match the selected criteria' 
      });
    }

    const campaign = new Campaign({
      name,
      createdBy: req.user.id,
      segments,
      audienceSize,
      audienceUserIds,
      scheduledAt: scheduledAt || undefined,
      stats: {
        sent: 0,
        failed: 0,
        audienceSize
      }
    });

    // await campaign.save();
    const campaignId = campaign._id;
    
    await publishMessage(
      req.app.get('rabbitMQChannel'),
      ROUTING_KEYS.CAMPAIGN_CREATE,
      {
        campaignId: campaignId,
        name: campaign.name,
        rules: campaign.segments,        
        audienceSize: audienceSize,      
        userIds: audienceUserIds,        
        audienceUserIds: audienceUserIds,
        scheduledAt: campaign.scheduledAt,
        createdBy: campaign.createdBy,
        stats: campaign.stats            
      }
    );

    res.status(201).json({
      msg: 'Campaign created and queued',
      campaign,
    });
  } catch (err) {
    console.error('Error creating campaign:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getAllCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ createdBy: req.user.id })
      .select('-__v')
      .sort({ createdAt: -1 });

    res.json(campaigns);
  } catch (err) {
    console.error('Error fetching campaigns:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    }).populate('audienceUserIds', 'name email status');

    if (!campaign) {
      return res.status(404).json({ msg: 'Campaign not found or unauthorized' });
    }

    res.json(campaign);
  } catch (err) {
    console.error('Error fetching campaign:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!campaign) {
      return res.status(404).json({ msg: 'Campaign not found or unauthorized' });
    }

    await Campaign.deleteOne({ _id: req.params.id });
    
    res.json({ msg: 'Campaign deleted successfully' });
  } catch (err) {
    console.error('Error deleting campaign:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.updateCampaign = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, segments, scheduledAt } = req.body;
  
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!campaign) {
      return res.status(404).json({ msg: 'Campaign not found or unauthorized' });
    }

    // Only update if campaign hasn't been sent yet
    if (campaign.stats && campaign.stats.sent > 0) {
      return res.status(400).json({ msg: 'Cannot update a campaign that has already been sent' });
    }

    // If segments changed, recalculate audience
    let audienceSize = campaign.audienceSize;
    let audienceUserIds = campaign.audienceUserIds;
    
    if (segments && segments.length > 0 && JSON.stringify(segments) !== JSON.stringify(campaign.segments)) {
      const pipeline = buildAggregationFromRules(segments);
      
      const audienceUsers = await User.aggregate([
        ...pipeline,
        { $project: { _id: 1 } }
      ]);

      audienceSize = audienceUsers.length;
      audienceUserIds = audienceUsers.map((u) => u._id);

      if (audienceSize === 0) {
        return res.status(400).json({ 
          msg: 'Campaign cannot be updated: No users match the selected criteria' 
        });
      }
    }

    campaign.name = name || campaign.name;
    campaign.segments = segments || campaign.segments;
    campaign.scheduledAt = scheduledAt || campaign.scheduledAt;
    campaign.audienceSize = audienceSize;
    campaign.audienceUserIds = audienceUserIds;
    campaign.stats = {
      ...campaign.stats,
      audienceSize
    };

    await campaign.save();

    res.json({
      msg: 'Campaign updated successfully',
      campaign,
    });
  } catch (err) {
    console.error('Error updating campaign:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.generateCampaignInsight = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!campaign) {
      return res.status(404).json({ msg: 'Campaign not found or unauthorized' });
    }

    console.log('Generating insight for campaign:', campaign._id);
    console.log('Campaign details:', campaign);


    const { name = 'Unnamed Campaign' } = campaign;
    const stats = campaign.stats || {};
    const audienceSize = stats.audienceSize || campaign.audienceSize || 0;
    const sent = stats.sent || 0;
    const failed = stats.failed || 0;

    let formattedRules = 'No targeting rules specified';

    if (campaign.segments && Array.isArray(campaign.segments)) {
      formattedRules = campaign.segments.map((group, i) => {
        if (group?.rules?.length) {
          const rules = group.rules.map(r => {
            if (r?.field && r?.operator && r?.value !== undefined) {
              return `${r.field} ${r.operator} ${r.value}`;
            }
            return 'incomplete rule';
          }).join(` ${group.operator || 'AND'} `);
          return `Group ${i + 1}: ${rules}`;
        }
        return `Group ${i + 1}: Invalid rules structure`;
      }).join('\n');
    }

    const deliveryRate = audienceSize > 0 ? Math.round((sent / audienceSize) * 100) : 0;
    const failureRate = (sent + failed) > 0 ? Math.round((failed / (sent + failed)) * 100) : 0;

    let fallbackInsight = `Your campaign "${name}" reached ${audienceSize} users with a ${deliveryRate}% delivery rate. `;
    fallbackInsight += failureRate > 10
      ? `Consider reviewing your audience selection as ${failureRate}% of messages failed to deliver.`
      : `Message delivery was successful with only ${failureRate}% failure rate.`;

    const prompt = `
A campaign named "${name}" was created targeting ${audienceSize} users using the following rules:
${formattedRules}

Out of these, ${sent} messages were delivered and ${failed} failed.

Generate a short human-readable insight (4-5 sentences) like:
"Your campaign reached 1,284 users. 1,140 messages were delivered. Customers with > ₹10K spend had a 95% delivery rate."
Do not repeat the exact numbers from input. Rephrase naturally.
`;

    const insight = await togetherGenerateInsight(prompt);

    res.json({ insight: insight || fallbackInsight });
  } catch (err) {
    console.error('Insight generation failed:', err.message);
    res.status(500).json({ msg: 'Failed to generate campaign insight' });
  }
};

exports.pauseCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!campaign) {
      return res.status(404).json({ msg: 'Campaign not found or unauthorized' });
    }

    // Only pause if campaign is scheduled and not yet sent
    if (campaign.stats && campaign.stats.sent > 0) {
      return res.status(400).json({ msg: 'Cannot pause a campaign that has already been sent' });
    }

    campaign.status = 'paused';
    await campaign.save();
    
    // Publish message to pause campaign processing
    await publishMessage(
      req.app.get('rabbitMQChannel'),
      ROUTING_KEYS.CAMPAIGN_PAUSE,
      {
        campaignId: campaign._id
      }
    );

    res.json({ 
      msg: 'Campaign paused successfully',
      campaign
    });
  } catch (err) {
    console.error('Error pausing campaign:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.resumeCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
      status: 'paused'
    });

    if (!campaign) {
      return res.status(404).json({ msg: 'Campaign not found, unauthorized, or not in paused state' });
    }

    campaign.status = 'active';
    await campaign.save();
    
    // Publish message to resume campaign processing
    await publishMessage(
      req.app.get('rabbitMQChannel'),
      ROUTING_KEYS.CAMPAIGN_RESUME,
      {
        campaignId: campaign._id,
        name: campaign.name,
        rules: campaign.segments,
        audienceSize: campaign.audienceSize,
        audienceUserIds: campaign.audienceUserIds,
        scheduledAt: campaign.scheduledAt,
        createdBy: campaign.createdBy,
        stats: campaign.stats
      }
    );

    res.json({ 
      msg: 'Campaign resumed successfully',
      campaign
    });
  } catch (err) {
    console.error('Error resuming campaign:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Advanced analytics endpoint
exports.getCampaignAnalytics = async (req, res) => {
  try {
    const campaignId = req.params.id;
    
    // Verify campaign ownership
    const campaign = await Campaign.findOne({
      _id: campaignId,
      createdBy: req.user.id
    });
    
    if (!campaign) {
      return res.status(404).json({ msg: 'Campaign not found or unauthorized' });
    }
    
    // Use aggregation to get detailed analytics
    const analyticsData = await User.aggregate([
      // Match users who were in this campaign
      { $match: { _id: { $in: campaign.audienceUserIds } } },
      // Group by user segments
      { $group: {
        _id: "$status",
        count: { $sum: 1 },
        avgSpend: { $avg: "$totalSpend" },
        totalSpend: { $sum: "$totalSpend" },
        users: { $push: { id: "$_id", name: "$name", email: "$email" } }
      }},
      // Add additional stats
      { $addFields: {
        segment: "$_id",
        deliveryRate: {
          $cond: [
            { $eq: ["$_id", "active"] },
            { $multiply: [{ $divide: [95, 100] }, 100] }, // Placeholder 95% for active users
            { $multiply: [{ $divide: [70, 100] }, 100] }  // Placeholder 70% for other users
          ]
        }
      }},
      // Final project to format output
      { $project: {
        _id: 0,
        segment: 1,
        count: 1,
        avgSpend: 1,
        totalSpend: 1,
        deliveryRate: 1,
        topUsers: { $slice: ["$users", 5] }
      }}
    ]);
    
    res.json({
      campaign: {
        id: campaign._id,
        name: campaign.name,
        audienceSize: campaign.audienceSize,
        stats: campaign.stats
      },
      segmentAnalytics: analyticsData
    });
  } catch (err) {
    console.error('Error generating campaign analytics:', err);
    res.status(500).json({ msg: 'Failed to generate analytics' });
  }
};