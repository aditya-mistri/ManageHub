const User = require('../models/User');
const Order = require('../models/order');
const Admin = require('../models/admin');
const Campaign = require('../models/Campaign');
const Segment = require('../models/Segment');
const { QUEUES, ROUTING_KEYS } = require('../config/rabbitmq');

// Start RabbitMQ consumers
async function startConsumers(channel) {
  try {
    // Customer queue
    await channel.consume(QUEUES.CUSTOMER, async (message) => {
      try {
        if (message) {
          const routingKey = message.fields.routingKey;
          if (routingKey === ROUTING_KEYS.CUSTOMER_CREATE) {
            await processCustomerCreate(message);
          } else if (routingKey === ROUTING_KEYS.CUSTOMER_UPDATE) {
            await processCustomerUpdate(message);
          }
          channel.ack(message);
        }
      } catch (error) {
        console.error('❌ Error in customer consumer:', error);
        channel.nack(message, false, false);
      }
    });

    // Order queue
    await channel.consume(QUEUES.ORDER, async (message) => {
      try {
        if (message) {
          const routingKey = message.fields.routingKey;
          if (routingKey === ROUTING_KEYS.ORDER_CREATE) {
            await processOrderCreate(message);
          } else if (routingKey === ROUTING_KEYS.ORDER_UPDATE) {
            await processOrderUpdate(message);
          }
          channel.ack(message);
        }
      } catch (error) {
        console.error('❌ Error in order consumer:', error);
        channel.nack(message, false, false);
      }
    });

    // Campaign queue
    await channel.consume(QUEUES.CAMPAIGN, async (message) => {
      try {
        if (message) {
          const routingKey = message.fields.routingKey;
          if (routingKey === ROUTING_KEYS.CAMPAIGN_CREATE) {
            await processCampaignCreate(message);
          }
          channel.ack(message);
        }
      } catch (error) {
        console. error('❌ Error in campaign consumer:', error);
        channel.nack(message, false, false);
      }
    });

    console.log('📡 RabbitMQ consumers started');
  } catch (error) {
    console.error('❌ Error starting consumers:', error);
    throw error;
  }
}

// --- Processors ---

async function processCustomerCreate(message) {
  try {
    const { name, email, phone, status, assignedAdmin } = JSON.parse(message.content.toString());
    if (!name || !email || !assignedAdmin) throw new Error('Missing required customer fields');

    const newUser = new User({ name, email, phone, status: status || 'new', assignedAdmin });
    await newUser.save();

    await Admin.findByIdAndUpdate(assignedAdmin, {
      $addToSet: { assignedUsers: newUser._id }
    });

    console.log(`✅ Customer created: ${newUser.email}`);
    return true;
  } catch (error) {
    if (error.code === 11000) {
      console.warn('⚠️ Duplicate customer for this admin:', error.keyValue);
      return true;
    }
    console.error('❌ Error processing customer create:', error);
    throw error;
  }
}

async function processCustomerUpdate(message) {
  try {
    const { id, name, email, phone, status, assignedAdmin } = JSON.parse(message.content.toString());
    if (!id || !assignedAdmin) throw new Error('Missing required fields for update');

    const user = await User.findOne({ _id: id, assignedAdmin });
    if (!user) throw new Error('Customer not found or not authorized');

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (status) user.status = status;

    await user.save();
    console.log(`✅ Customer updated: ${user.email}`);
    return true;
  } catch (error) {
    console.error('❌ Error processing customer update:', error);
    throw error;
  }
}

async function processOrderCreate(message) {
  try {
    const orderData = JSON.parse(message.content.toString());
    if (!orderData.user) throw new Error('Missing user ID in order data');

    const newOrder = new Order(orderData);
    await newOrder.save();

    console.log(`✅ Order created: ${newOrder.orderNumber}`);

    const userUpdate = await User.findByIdAndUpdate(
      orderData.user,
      {
        $inc: {
          orderCount: 1,
          totalSpend: orderData.totalAmount
        },
        $set: {
          lastOrderDate: newOrder.createdAt
        }
      },
      { new: true }
    );

    if (!userUpdate) {
      console.warn(`⚠️ User not found for order: ${newOrder._id}`);
    } else {
      console.log(`🔄 User updated after order: ${userUpdate.email}`);
    }

    return true;
  } catch (error) {
    console.error('❌ Error processing order create:', error);
    throw error;
  }
}

async function processOrderUpdate(message) {
  try {
    const { id, ...updateData } = JSON.parse(message.content.toString());
    const order = await Order.findByIdAndUpdate(id, { $set: updateData }, { new: true });
    if (!order) throw new Error('Order not found');
    console.log(`✅ Order updated: ${order.orderNumber}`);
    return true;
  } catch (error) {
    console.error('❌ Error processing order update:', error);
    throw error;
  }
}


// Fix for processCampaignCreate function
async function processCampaignCreate(message) {
  try {
    // Parse the message content
    const messageData = JSON.parse(message.content.toString());
    console.log('📥 Received campaign create message:', JSON.stringify(messageData));
    
    // Extract all fields from the message with proper fallbacks
    const {
      campaignId,
      name,
      rules,
      audienceSize,
      audienceUserIds,
      userIds,          // This is the audience user IDs (duplicated field)
      scheduledAt,
      createdBy,
      stats            // Include stats if available
    } = messageData;

    console.log('📥 Processing campaign create with ID:', campaignId);
    
    if (!name || !rules || !(userIds || audienceUserIds) || !createdBy) {
      throw new Error('Missing required campaign fields');
    }

    // Check if campaign already exists
    const existingCampaign = campaignId ? await Campaign.findById(campaignId) : null;
    if (existingCampaign) {
      console.log(`⚠️ Campaign already exists: ${existingCampaign.name}`);
      return true;
    }

    // Use audienceUserIds from message, fallback to userIds if not present
    const finalAudienceUserIds = audienceUserIds || userIds;
    
    // Create a new campaign
    const campaign = new Campaign({
      _id: campaignId,              
      name: name,                   
      segments: rules,              
      audienceSize: audienceSize || finalAudienceUserIds.length, 
      audienceUserIds: finalAudienceUserIds, 
      createdBy: createdBy,         
      scheduledAt: scheduledAt,     
      stats: stats || {             
        sent: 0,
        failed: 0,
        audienceSize: audienceSize || finalAudienceUserIds.length
      }
    });

    // Save the campaign first to ensure it exists
    await campaign.save();
    console.log(`✅ Campaign saved: ${campaign.name} with audience size: ${campaign.audienceSize}`);

    // Now update all users in the audience with the campaign ID
    // and track successfully updated users
    let successCount = 0;
    let failedCount = 0;

    // Process users in batches to avoid memory issues with large audiences
    const BATCH_SIZE = 100;
    for (let i = 0; i < finalAudienceUserIds.length; i += BATCH_SIZE) {
      const userBatch = finalAudienceUserIds.slice(i, i + BATCH_SIZE);
      
      try {
        // Update users in the current batch
        const bulkUpdateResult = await User.updateMany(
          { _id: { $in: userBatch } },
          { $addToSet: { campaigns: campaignId } }
        );
        
        console.log(`Batch ${Math.floor(i/BATCH_SIZE) + 1} update result:`, bulkUpdateResult);
        
        // Track successfully updated users
        successCount += bulkUpdateResult.modifiedCount;
        
        // If some users weren't found/updated, count as failed
        if (bulkUpdateResult.matchedCount < userBatch.length) {
          failedCount += (userBatch.length - bulkUpdateResult.matchedCount);
        }
      } catch (batchError) {
        console.error(`❌ Error updating user batch ${Math.floor(i/BATCH_SIZE) + 1}:`, batchError);
        failedCount += userBatch.length;
      }
    }

    // Update campaign stats with the actual sent count
    await Campaign.findByIdAndUpdate(
      campaignId,
      { 
        $set: {
          'stats.sent': successCount,
          'stats.failed': failedCount
        }
      }
    );

    console.log(`✅ Campaign user updates complete: ${successCount} users updated, ${failedCount} failed`);
    return true;
  } catch (error) {
    console.error('❌ Error processing campaign create:', error);
    throw error;
  }
}




module.exports = {
  startConsumers
};
