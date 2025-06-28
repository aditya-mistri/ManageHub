import passport from 'passport';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Admin from '@/models/Admin';
import { AuthenticatedRequest, JWTPayload, IAdmin } from '@/types';

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

const generateToken = (user: IAdmin): string => {
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

export const googleAuth = passport.authenticate('google', { 
  scope: ['profile', 'email'],
  prompt: 'select_account'
});

export const googleAuthCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user as IAdmin;
    const admin = await Admin.findByIdAndUpdate(
      user._id, 
      { 
        lastLogin: new Date(),
        status: 'active' 
      },
      { new: true }
    );

    if (!admin) {
      res.redirect(`${CLIENT_URL}/login?error=auth_failed`);
      return;
    }

    const token = generateToken(admin);
    res.redirect(`${CLIENT_URL}/dashboard?token=${token}`);
  } catch (err) {
    console.error('Token Generation Error:', err);
    res.redirect(`${CLIENT_URL}/login?error=auth_failed`);
  }
};

export const getCurrentUser = (req: Request, res: Response): void => {
  const authenticatedReq = req as AuthenticatedRequest;
  res.json({
    success: true,
    user: {
      id: authenticatedReq.user._id,
      googleId: authenticatedReq.user.googleId,
      name: authenticatedReq.user.name,
      email: authenticatedReq.user.email,
      avatar: authenticatedReq.user.avatar,
      role: authenticatedReq.user.role || 'admin',
      lastLogin: authenticatedReq.user.lastLogin,
      createdAt: authenticatedReq.user.createdAt
    }
  });
};

export const verifyToken = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.body;

  if (!token) {
    res.status(400).json({ success: false, message: 'No token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!, {
      issuer: 'AdminPortal',
      audience: CLIENT_URL
    }) as JWTPayload;
    
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      res.status(403).json({ success: false, message: 'Invalid token' });
      return;
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
    
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ success: false, message: 'Token expired' });
      return;
    }
    
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

export const logout = (req: Request, res: Response): void => {
  req.logout(function(err) {
    if (err) { 
      console.error('Logout error:', err);
      res.status(500).json({ success: false, msg: 'Logout failed' });
      return;
    }
    res.json({ success: true, msg: 'Admin logged out' });
  });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;
  try {
    const existing = await Admin.findOne({ email });
    if (existing) {
      res.status(400).json({ msg: 'Email already in use' });
      return;
    }

    const admin = new Admin({ name, email, password });
    await admin.save();

    const token = generateToken(admin);
    res.json({ success: true, token });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

export const loginWithEmail = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin || !admin.password) {
      res.status(400).json({ msg: 'Invalid credentials' });
      return;
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      res.status(400).json({ msg: 'Invalid credentials' });
      return;
    }

    admin.lastLogin = new Date();
    await admin.save();

    const token = generateToken(admin);
    res.json({ success: true, token });
  } catch (err) {
    console.error('Email login error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};