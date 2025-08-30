import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { IUser, User } from '../models/User';

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Access token required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      res.status(401).json({ message: 'Invalid token' });
      return;
    }

    (req as any).user = user;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid token' });
    return;
  }
};

export const generateToken = (userId: string): string => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '7d' }
  );
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
      if (decoded && decoded.userId) {
        const user = await User.findById(decoded.userId).select('-password -otp -otpExpiry');
        if (user) {
          (req as any).user = user;
        }
      }
    }
    next();
  } catch (error) {
    // Continue without authentication for optional routes
    next();
  }
};
