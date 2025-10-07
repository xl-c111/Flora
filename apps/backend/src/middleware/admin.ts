import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export const adminMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // User should already be authenticated by authMiddleware
    if (!req.user || !req.user.email) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // For now, we'll check if the user email contains admin
    // In a real app, you'd check a role field in the database
    const isAdmin = req.user.email.includes('admin') ||
                   req.user.email.includes('@holberton') ||
                   req.user.email.includes('@flora.admin');

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Admin check failed'
    });
  }
};