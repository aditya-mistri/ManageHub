const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');

module.exports = {
  // Ensure user is authenticated using JWT
  ensureAuth: async (req, res, next) => {
    // Get token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find admin by ID from token
      const admin = await Admin.findById(decoded.id).select('-password');
      
      if (!admin) {
        return res.status(401).json({ msg: 'Admin not found' });
      }

      // Attach user to request object
      req.user = admin;
      next();
    } catch (err) {
      console.error('Token verification error:', err);
      
      // Handle specific JWT errors
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ msg: 'Token expired' });
      }
      
      res.status(401).json({ msg: 'Token is not valid' });
    }
  },

  // Ensure user is an admin
  ensureAdmin: (req, res, next) => {
    
    // Check if user is authenticated and has admin role
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Forbidden - Admin access required' });
    }
    next();
  }
};