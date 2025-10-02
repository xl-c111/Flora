import { Router } from "express";
import { PaymentController } from "../controllers/PaymentController";
import { authMiddleware, optionalAuth } from "../middleware/auth";
// import { adminMiddleware } from "../middleware/admin";

const router: Router = Router();
const paymentController = new PaymentController();

// Protected routes (require authentication)
router.post("/intent", optionalAuth, paymentController.createPaymentIntent); // Allow guest payments
router.post("/confirm", optionalAuth, paymentController.confirmPayment); // Allow guest confirmations
router.get("/methods", authMiddleware, paymentController.getPaymentMethods);
router.post("/customer", authMiddleware, paymentController.createCustomer);
router.get("/:id", optionalAuth, paymentController.getPayment); // Allow guest to check payment status

// Admin routes (require admin privileges)
// router.post("/:id/refund", authMiddleware, adminMiddleware, paymentController.refundPayment);


export default router;