import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import Admin from '@/models/Admin';
import { AuthenticatedRequest, JWTPayload } from '@/types';

export const ensureAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ msg: 'No token, authorization denied' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    const admin = await Admin.findById(decoded.id).select('-password');
    
    if (!admin) {
      res.status(401).json({ msg: 'Admin not found' });
      return;
    }

    (req as AuthenticatedRequest).user = admin;
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ msg: 'Token expired' });
      return;
    }
    
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

export const ensureAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authenticatedReq = req as AuthenticatedRequest;
  
  if (!authenticatedReq.user || authenticatedReq.user.role !== 'admin') {
    res.status(403).json({ msg: 'Forbidden - Admin access required' });
    return;
  }
  next();
};