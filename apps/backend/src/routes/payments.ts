import { Router } from "express";
import rateLimit from "express-rate-limit";
import { PaymentController } from "../controllers/PaymentController";
import { authMiddleware, optionalAuth } from "../middleware/auth";
// import { adminMiddleware } from "../middleware/admin";

const router: Router = Router();
const paymentController = new PaymentController();

// Rate limiting: 100 requests per 15 minutes per IP
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all payment routes
router.use(paymentLimiter);

// Protected routes (require authentication)
router.post("/intent", optionalAuth, paymentController.createPaymentIntent); // Allow guest payments
router.post("/confirm", optionalAuth, paymentController.confirmPayment); // Allow guest confirmations
router.get("/methods", authMiddleware, paymentController.getPaymentMethods);
router.post("/customer", authMiddleware, paymentController.createCustomer);
router.get("/:id", optionalAuth, paymentController.getPayment); // Allow guest to check payment status

// Admin routes (require admin privileges)
// router.post("/:id/refund", authMiddleware, adminMiddleware, paymentController.refundPayment);


export default router;
