const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const AdminSchema = new mongoose.Schema({
  googleId: {
    type: String,
    unique: true,
    sparse: true, // Ensures null values are skipped in uniqueness checks
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
    select: false, // Do not return password by default
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
      type: mongoose.Schema.Types.ObjectId,
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
AdminSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Admin', AdminSchema);
