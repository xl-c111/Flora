import { Router } from 'express';
import { SubscriptionController } from '../controllers/SubscriptionController';
import { authMiddleware } from '../middleware/auth';
import { validateSubscription } from '../middleware/validation/subscriptionValidation';

const router: Router = Router();
const subscriptionController = new SubscriptionController();

// All subscription routes require authentication
router.use(authMiddleware);

// Create new subscription
router.post(
  '/',
  validateSubscription,
  subscriptionController.createSubscription
);

// NEW: Create subscription with Stripe payment setup (safe addition)
router.post(
  '/with-payment',
  validateSubscription,
  subscriptionController.createSubscriptionWithPayment
);

// Create subscription from product (convenience endpoint for frontend)
router.post(
  '/from-product',
  subscriptionController.createSubscriptionFromProduct
);

// Get user's subscriptions
router.get('/', subscriptionController.getUserSubscriptions);

// Get specific subscription
router.get('/:id', subscriptionController.getSubscription);

// Update subscription
router.put('/:id', subscriptionController.updateSubscription);

// Pause subscription
router.post('/:id/pause', subscriptionController.pauseSubscription);

// Resume subscription
router.post('/:id/resume', subscriptionController.resumeSubscription);

// Cancel subscription
router.delete('/:id', subscriptionController.cancelSubscription);

// Create spontaneous delivery
router.post(
  '/:id/spontaneous',
  subscriptionController.createSpontaneousDelivery
);

// Admin routes (uncomment when admin middleware is ready)
// router.get("/admin/stats", adminMiddleware, subscriptionController.getSubscriptionStats);

export default router;
