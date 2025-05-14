const mongoose = require('mongoose');

const CampaignSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    // message: {
    //   type: String,
    //   required: true,
    // },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,  
    },
    segments: {  // Changed from 'rules' to match with consumer code
      type: Array, 
      required: true,
    },
    audienceSize: {
      type: Number,
      required: true,
    },
    audienceUserIds: [ // Changed from 'users' to match consumer code
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    scheduledAt: {
      type: Date,
      default: Date.now
    },
    stats: {
      sent: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
      audienceSize: { type: Number, default: 0 },
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Campaign', CampaignSchema);