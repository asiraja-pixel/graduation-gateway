import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    accountType: 'student' | 'staff' | 'admin';
    department?: string;
    name?: string;
    registrationNumber?: string;
    program?: string;
    nationality?: string;
    gender?: string;
    phoneNumber?: string;
    address?: string;
    startYear?: string;
    endYear?: string;
    signature?: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as AuthRequest['user'];
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};
