// server/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
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
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
    orderCount: {
      type: Number,
      default: 0
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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campaign',
      },
    ],
    // New fields for authentication
    googleId: {
      type: String,
      unique: true,
      sparse: true // Allows multiple null values
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    lastLogin: {
      type: Date
    }
  },
  { timestamps: true }
);

// Prevent duplicate users for same admin
UserSchema.index({ email: 1, assignedAdmin: 1 }, { unique: true });

// Method to update user profile
UserSchema.methods.updateProfile = function(profileData) {
  // Allowed fields to update
  const updateFields = [
    'name', 'phone', 'location', 'age', 
    'gender', 'preferences'
  ];

  updateFields.forEach(field => {
    if (profileData[field] !== undefined) {
      this[field] = profileData[field];
    }
  });

  return this.save();
};

// Static method to find or create user
UserSchema.statics.findOrCreateUser = async function(userData, assignedAdminId) {
  try {
    // Try to find existing user
    let user = await this.findOne({ 
      email: userData.email, 
      assignedAdmin: assignedAdminId 
    });

    if (!user) {
      // Create new user if not exists
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
    throw new Error(`Error finding or creating user: ${error.message}`);
  }
};

module.exports = mongoose.model('User', UserSchema);