import mongoose, { Schema, Model } from 'mongoose';
import { IUser } from '@/types';

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    location: {
      type: String,
    },
    age: {
      type: Number,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    status: {
      type: String,
      enum: ['new', 'active', 'inactive'],
      default: 'new',
    },
    assignedAdmin: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
    orderCount: {
      type: Number,
      default: 0,
    },
    totalSpend: {
      type: Number,
      default: 0,
    },
    lastOrderDate: {
      type: Date,
    },
    tags: {
      type: [String],
      default: [],
    },
    preferences: {
      newsletter: { type: Boolean, default: true },
      preferredChannels: {
        type: [String],
        enum: ['email', 'sms', 'push'],
        default: ['email'],
      },
    },
    campaigns: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Campaign',
      },
    ],
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    lastLogin: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Prevent duplicate users for same admin
UserSchema.index({ email: 1, assignedAdmin: 1 }, { unique: true });

// Method to update user profile
UserSchema.methods.updateProfile = function(profileData: Partial<IUser>): Promise<IUser> {
  const updateFields = [
    'name', 'phone', 'location', 'age', 
    'gender', 'preferences'
  ];

  updateFields.forEach(field => {
    if (profileData[field as keyof IUser] !== undefined) {
      (this as any)[field] = profileData[field as keyof IUser];
    }
  });

  return this.save();
};

// Static method to find or create user
UserSchema.statics.findOrCreateUser = async function(
  userData: Partial<IUser>, 
  assignedAdminId: string
): Promise<IUser> {
  try {
    let user = await this.findOne({ 
      email: userData.email, 
      assignedAdmin: assignedAdminId 
    });

    if (!user) {
      user = new this({
        ...userData,
        assignedAdmin: assignedAdminId,
        status: 'new',
        role: 'user'
      });
      await user.save();
    }

    return user;
  } catch (error) {
    throw new Error(`Error finding or creating user: ${(error as Error).message}`);
  }
};

interface IUserModel extends Model<IUser> {
  findOrCreateUser(userData: Partial<IUser>, assignedAdminId: string): Promise<IUser>;
}

export default mongoose.model<IUser, IUserModel>('User', UserSchema);