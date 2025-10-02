import { Router } from "express";
import { OrderController } from "../controllers/OrderController";
import { authMiddleware, optionalAuth } from "../middleware/auth";
// import { adminMiddleware } from "../middleware/admin";
import { validateOrder } from "../middleware/validation/orderValidation";

const router: Router = Router();
const orderController = new OrderController();

// Public routes with optional auth (guest checkout with user context if logged in)
router.post("/", optionalAuth, validateOrder, orderController.createOrder);

// Protected routes (require authentication)
router.get("/user", authMiddleware, orderController.getUserOrders);
router.get("/:id", optionalAuth, orderController.getOrder); // Guest or user can fetch order details
router.post("/:id/confirm", optionalAuth, orderController.confirmOrder); // Allow guest confirmation
router.post("/:id/cancel", authMiddleware, orderController.cancelOrder);

// Order tracking (public but with optional auth for better UX)
router.get("/:id/tracking", optionalAuth, orderController.getOrderTracking);

// Admin routes
// router.get("/admin", authMiddleware, adminMiddleware, orderController.getAllOrders);
// router.patch("/:id/status", authMiddleware, adminMiddleware, orderController.updateOrderStatus);
// router.get("/stats", authMiddleware, adminMiddleware, orderController.getOrderStats);

export default router;
