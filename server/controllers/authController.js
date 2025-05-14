const passport = require('passport');
const Admin = require('../models/admin');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

// Client URL Configuration
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Generate JWT Token with more robust generation
const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  try {
    return jwt.sign(
      { 
        id: user._id, 
        email: user.email, 
        role: user.role || 'admin' 
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: '7d',
        issuer: 'AdminPortal',
        audience: CLIENT_URL
      }
    );
  } catch (error) {
    console.error('Token Generation Error:', error);
    throw new Error('Failed to generate authentication token');
  }
};

exports.googleAuth = passport.authenticate('google', { 
  scope: ['profile', 'email'],
  prompt: 'select_account'
});

exports.googleAuthCallback = async (req, res) => {
  try {
    const admin = await Admin.findByIdAndUpdate(
      req.user._id, 
      { 
        lastLogin: Date.now(),
        status: 'active' 
      },
      { new: true }
    );

    const token = generateToken(admin);
    res.redirect(`${CLIENT_URL}/dashboard?token=${token}`);
  } catch (err) {
    console.error('Token Generation Error:', err);
    res.redirect(`${CLIENT_URL}/login?error=auth_failed`);
  }
};

exports.getCurrentUser = (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      googleId: req.user.googleId,
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar,
      role: req.user.role || 'admin',
      lastLogin: req.user.lastLogin,
      createdAt: req.user.createdAt
    }
  });
};

exports.verifyToken = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'AdminPortal',
      audience: CLIENT_URL
    });
    
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(403).json({ success: false, message: 'Invalid token' });
    }

    res.json({ 
      success: true, 
      user: {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role || 'admin'
      }
    });
  } catch (err) {
    console.error('Token Verification Error:', err);
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired' });
    }
    
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

exports.logout = (req, res) => {
  req.logout(function(err) {
    if (err) { 
      console.error('Logout error:', err);
      return res.status(500).json({ success: false, msg: 'Logout failed' });
    }
    res.json({ success: true, msg: 'Admin logged out' });
  });
};


// Register
exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existing = await Admin.findOne({ email });
    if (existing) return res.status(400).json({ msg: 'Email already in use' });

    const admin = new Admin({ name, email, password });
    await admin.save();

    const token = generateToken(admin);
    res.json({ success: true, token });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Login
exports.loginWithEmail = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin || !admin.password) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    admin.lastLogin = new Date();
    await admin.save();

    const token = generateToken(admin);
    res.json({ success: true, token });
  } catch (err) {
    console.error('Email login error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};