import bcrypt from 'bcryptjs';
import mongoose, { Schema } from 'mongoose';
import { IAdmin } from '@/types';

const AdminSchema = new Schema<IAdmin>({
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  role: {
    type: String,
    enum: ['admin'],
    default: 'admin',
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    select: false,
  },
  avatar: {
    type: String,
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  assignedUsers: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
});

// Hash password if it's modified
AdminSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Password verification
AdminSchema.methods.comparePassword = function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password || '');
};

export default mongoose.model<IAdmin>('Admin', AdminSchema);