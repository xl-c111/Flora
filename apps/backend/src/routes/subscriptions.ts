import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { SubscriptionController } from '../controllers/SubscriptionController';
import { authMiddleware } from '../middleware/auth';
import { validateSubscription } from '../middleware/validation/subscriptionValidation';

const router: Router = Router();
const subscriptionController = new SubscriptionController();

// Rate limiting: 100 requests per 15 minutes per IP
const subscriptionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all subscription routes
router.use(subscriptionLimiter);

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
