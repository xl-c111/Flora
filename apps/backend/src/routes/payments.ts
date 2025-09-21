import { Router } from "express";
import { PaymentController } from "../controllers/PaymentController";
import { authMiddleware } from "../middleware/auth";
// import { adminMiddleware } from "../middleware/admin";

const router = Router();
const paymentController = new PaymentController();

// Protected routes (require authentication)
router.post("/intent", authMiddleware, paymentController.createPaymentIntent);
router.post("/confirm", authMiddleware, paymentController.confirmPayment);
router.get("/methods", authMiddleware, paymentController.getPaymentMethods);
router.post("/customer", authMiddleware, paymentController.createCustomer);
router.get("/:id", authMiddleware, paymentController.getPayment);

// Admin routes (require admin privileges)
// router.post("/:id/refund", authMiddleware, adminMiddleware, paymentController.refundPayment);


export default router;