import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../middleware/auth';

const router: Router = Router();
const userController = new UserController();

// Rate limiting: 100 requests per 15 minutes per IP
const userLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting to all user routes
router.use(userLimiter);

// All user routes require authentication
router.use(authMiddleware);

// Sync user from Auth0 (create/update user profile)
// Called automatically when user logs in
router.post('/sync', userController.syncUser);

// Get current user profile with stats
router.get('/profile', userController.getProfile);

// Update user profile (firstName, lastName, phone)
router.put('/profile', userController.updateProfile);

// Update user preferences (occasions, colors, moods)
router.put('/preferences', userController.updatePreferences);

// Get user statistics
router.get('/stats', userController.getUserStats);

// Delete user account (destructive operation)
router.delete('/profile', userController.deleteAccount);

export default router;
