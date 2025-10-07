import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../middleware/auth';

const router: Router = Router();
const userController = new UserController();

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
