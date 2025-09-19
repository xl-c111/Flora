import { Router } from "express";
import { OrderController } from "../controllers/OrderController";
import { authMiddleware } from "../middleware/auth";
// import { adminMiddleware } from "../middleware/admin";
import { validateOrder } from "../middleware/validation/orderValidation";

const router = Router();
const orderController = new OrderController();

// Public routes (guest checkout)
router.post("/", validateOrder, orderController.createOrder);

// Protected routes (require authentication)
router.get("/user", authMiddleware, orderController.getUserOrders);
router.get("/:id", orderController.getOrder); // Guest or user can fetch order details
router.post("/:id/confirm", orderController.confirmOrder);
router.post("/:id/cancel", authMiddleware, orderController.cancelOrder);

// Order tracking
router.get("/:id/tracking", orderController.getOrderTracking);

// Admin routes
// router.get("/admin", authMiddleware, adminMiddleware, orderController.getAllOrders);
// router.patch("/:id/status", authMiddleware, adminMiddleware, orderController.updateOrderStatus);
// router.get("/stats", authMiddleware, adminMiddleware, orderController.getOrderStats);

export default router;
