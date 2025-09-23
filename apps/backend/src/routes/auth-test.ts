import express, { Router } from 'express';
import { authMiddleware, optionalAuth, AuthRequest } from '../middleware/auth';

const router: Router = express.Router();

// Test route for required auth
router.get('/protected', authMiddleware, (req: AuthRequest, res) => {
  res.json({
    message: '🔒 This is a protected route!',
    user: {
      id: req.user!.id,
      email: req.user!.email,
    },
    timestamp: new Date().toISOString(),
  });
});

// Test route for optional auth
router.get('/optional', optionalAuth, (req: AuthRequest, res) => {
  res.json({
    message: '🤔 This route works for everyone!',
    user: req.user || null,
    isAuthenticated: !!req.user,
    timestamp: new Date().toISOString(),
  });
});

// Public test route
router.get('/public', (req, res) => {
  res.json({
    message: '🌍 This is a public route - no auth needed!',
    timestamp: new Date().toISOString(),
  });
});

// Helper route to test token extraction
router.get('/verify-token', authMiddleware, (req: AuthRequest, res) => {
  res.json({
    message: '✅ Token is valid!',
    user: req.user,
    tokenInfo: {
      userId: req.user!.id,
      email: req.user!.email,
      message: 'This token was successfully verified by the backend',
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;