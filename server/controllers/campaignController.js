const Campaign = require('../models/Campaign');
const User = require('../models/User');
const { publishMessage, ROUTING_KEYS } = require('../config/rabbitmq');
const { validationResult } = require('express-validator');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Helper function to convert segment rules to MongoDB query
const buildQueryFromRules = (segments) => {
  if (!Array.isArray(segments)) {
    throw new Error('Invalid segments data: expected an array');
  }

  const orQueries = segments.map((group) => {
    const groupOperator = group.operator === 'OR' ? '$or' : '$and';
    
    const ruleQueries = group.rules.map((rule) => {
      const { field, operator: op, value } = rule;
      
      let convertedValue = value;
      if (!isNaN(value) && value !== '') {
        convertedValue = Number(value);
      } else if (value.toLowerCase() === 'true') {
        convertedValue = true;
      } else if (value.toLowerCase() === 'false') {
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

    return { [groupOperator]: ruleQueries };
  });

  return { $or: orQueries };
};

exports.previewAudience = async (req, res) => {
  try {
    const { segments } = req.body;

    if (!Array.isArray(segments)) {
      return res.status(400).json({ message: 'Invalid or missing segments' });
    }

    const mongoQuery = buildQueryFromRules(segments);

    const adminId = req.user.id;

    const combinedQuery = {
      assignedAdmin: adminId,
      ...mongoQuery
    };

    const audienceSize = await User.countDocuments(combinedQuery);
    const audienceUserIds = await User.find(combinedQuery)
      .select('_id email name status totalSpend lastOrderDate')
      .lean();

    res.json({ size: audienceSize, userIds: audienceUserIds });
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
    const query = buildQueryFromRules(segments);
    const matchedUsers = await User.find(query).select('_id');
    const audienceSize = matchedUsers.length;
    const audienceUserIds = matchedUsers.map((u) => u._id);

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
    }).populate('users', 'name email status');

    if (!campaign) {
      return res.status(404).json({ msg: 'Campaign not found or unauthorized' });
    }

    res.json(campaign);
  } catch (err) {
    console.error('Error fetching campaign:', err);
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

    const { name = 'Unnamed Campaign' } = campaign;
    const stats = campaign.stats || {};
    const audienceSize = stats.audienceSize || campaign.audienceSize || 0;
    const sent = stats.sent || 0;
    const failed = stats.failed || 0;
    
    let formattedRules = 'No targeting rules specified';
    
    if (campaign.segments && Array.isArray(campaign.segments)) {
      formattedRules = campaign.segments.map((group, i) => {
        if (group && group.rules && Array.isArray(group.rules)) {
          const rules = group.rules.map(r => {
            if (r && r.field && r.operator && r.value !== undefined) {
              return `${r.field} ${r.operator} ${r.value}`;
            }
            return 'incomplete rule';
          }).join(` ${group.operator || 'AND'} `);
          return `Group ${i + 1}: ${rules}`;
        }
        return `Group ${i + 1}: Invalid rules structure`;
      }).join('\n');
    }

    let deliveryRate = audienceSize > 0 ? Math.round((sent / audienceSize) * 100) : 0;
    let failureRate = (sent + failed) > 0 ? Math.round((failed / (sent + failed)) * 100) : 0;
    
    let fallbackInsight = `Your campaign "${name}" reached ${audienceSize} users with a ${deliveryRate}% delivery rate. `;
    if (failureRate > 10) {
      fallbackInsight += `Consider reviewing your audience selection as ${failureRate}% of messages failed to deliver.`;
    } else {
      fallbackInsight += `Message delivery was successful with only ${failureRate}% failure rate.`;
    }

    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

      const prompt = `
A campaign named "${name}" was created targeting ${audienceSize} users using the following rules:
${formattedRules}

Out of these, ${sent} messages were delivered and ${failed} failed.

Generate a short human-readable insight (1-2 sentences) like:
"Your campaign reached 1,284 users. 1,140 messages were delivered. Customers with > ₹10K spend had a 95% delivery rate."
Do not repeat the exact numbers from input. Rephrase naturally.
`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const insight = response.text().trim();
      
      res.json({ insight: insight || fallbackInsight });
    } catch (apiError) {
      console.error('Gemini API error:', apiError.message);
      res.json({ insight: fallbackInsight });
    }
  } catch (err) {
    console.error('Insight generation failed:', err.message);
    res.status(500).json({ msg: 'Failed to generate campaign insight' });
  }
};