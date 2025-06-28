import mongoose, { Schema } from 'mongoose';
import { ICampaign } from '@/types';

const CampaignSchema = new Schema<ICampaign>(
  {
    name: {
      type: String,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,  
    },
    segments: {
      type: Array, 
      required: true,
    },
    audienceSize: {
      type: Number,
      required: true,
    },
    audienceUserIds: [
      {
        type: Schema.Types.ObjectId,
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

export default mongoose.model<ICampaign>('Campaign', CampaignSchema);