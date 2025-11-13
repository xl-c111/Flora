import { Response } from "express";
import { OrderService, CreateOrderData } from "../services/OrderService";
import { ApiResponse } from "../types/api";
import { OrderStatus, PurchaseType } from "@prisma/client";
import { AuthRequest } from "../middleware/auth";

export class OrderController {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService();
  }

  // Create new order (guest or user)
  createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id; // Optional for guest checkout

      console.log('💳 Backend received billingAddress:', req.body.billingAddress);
      console.log('📦 Backend received shippingAddress:', req.body.shippingAddress);

      const orderData: CreateOrderData = {
        ...req.body,
        userId,
      };

      console.log('💾 OrderData being passed to service:', {
        hasBillingAddress: !!orderData.billingAddress,
        hasShippingAddress: !!orderData.shippingAddress,
        billingFirstName: orderData.billingAddress?.firstName,
      });

      const order = await this.orderService.createOrder(orderData);

      const response: ApiResponse = {
        success: true,
        data: order,
        message: "Order created successfully",
      };
      res.status(201).json(response);
    } catch (error) {
      console.error("Create order error:", error);

      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes("not available") || error.message.includes("out of stock")) {
          res.status(400).json({
            success: false,
            error: error.message,
          });
          return;
        }
      }

      res.status(500).json({
        success: false,
        error: "Failed to create order",
      });
    }
  };

  // Get order by ID
  getOrder = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const order = await this.orderService.getOrderById(id, userId);
      if (!order) {
        res.status(404).json({
          success: false,
          error: "Order not found",
        });
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: order,
      };
      res.json(response);
    } catch (error) {
      console.error("Get order error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get order",
      });
    }
  };

  // Get user orders with pagination
  getUserOrders = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: "Unauthorized",
        });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.orderService.getUserOrders(userId, page, limit);

      const response: ApiResponse = {
        success: true,
        data: result.orders,
        meta: {
          currentPage: page,
          totalPages: result.totalPages,
          totalItems: result.total,
          itemsPerPage: limit,
        },
      };
      res.json(response);
    } catch (error) {
      console.error("Get user orders error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get orders",
      });
    }
  };

  // Get all orders (admin only)
  getAllOrders = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as OrderStatus;
      const purchaseType = req.query.purchaseType as PurchaseType;

      const result = await this.orderService.getAllOrders(page, limit, status, purchaseType);

      const response: ApiResponse = {
        success: true,
        data: result.orders,
        meta: {
          currentPage: page,
          totalPages: result.totalPages,
          totalItems: result.total,
          itemsPerPage: limit,
        },
      };
      res.json(response);
    } catch (error) {
      console.error("Get all orders error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get orders",
      });
    }
  };

  // Confirm order payment
  confirmOrder = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { paymentIntentId } = req.body;

      console.log(`🔍 Confirm order request - OrderID: ${id}, PaymentIntentID: ${paymentIntentId}`);

      if (!paymentIntentId) {
        res.status(400).json({
          success: false,
          error: "Payment intent ID is required",
        });
        return;
      }

      const order = await this.orderService.confirmOrder(id, paymentIntentId);

      const response: ApiResponse = {
        success: true,
        data: order,
        message: "Order confirmed successfully",
      };
      res.json(response);
    } catch (error) {
      console.error("❌ Confirm order error:", error);

      // Return the actual error message to help debug
      const errorMessage = error instanceof Error ? error.message : "Failed to confirm order";
      console.error(`Error details: ${errorMessage}`);

      res.status(500).json({
        success: false,
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined,
      });
    }
  };

  // Update order status (admin)
  updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Validate status
      if (!Object.values(OrderStatus).includes(status)) {
        res.status(400).json({
          success: false,
          error: "Invalid order status",
        });
        return;
      }

      const order = await this.orderService.updateOrderStatus(id, status);

      const response: ApiResponse = {
        success: true,
        data: order,
        message: "Order status updated successfully",
      };
      res.json(response);
    } catch (error) {
      console.error("Update order status error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update order status",
      });
    }
  };

  // Get order tracking information
  getOrderTracking = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const tracking = await this.orderService.getOrderTracking(id);
      if (!tracking) {
        res.status(404).json({
          success: false,
          error: "Tracking information not found",
        });
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: tracking,
      };
      res.json(response);
    } catch (error) {
      console.error("Get order tracking error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get tracking information",
      });
    }
  };

  // Cancel order (user or admin)
  cancelOrder = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      // Check if user can cancel this order
      const order = await this.orderService.getOrderById(id, userId);
      if (!order) {
        res.status(404).json({
          success: false,
          error: "Order not found",
        });
        return;
      }

      // Only allow cancellation for certain statuses
      const cancellableStatuses: OrderStatus[] = [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PREPARING];
      if (!cancellableStatuses.includes(order.status)) {
        res.status(400).json({
          success: false,
          error: "Order cannot be cancelled at this stage",
        });
        return;
      }

      const updatedOrder = await this.orderService.updateOrderStatus(id, OrderStatus.CANCELLED);

      const response: ApiResponse = {
        success: true,
        data: updatedOrder,
        message: "Order cancelled successfully",
      };
      res.json(response);
    } catch (error) {
      console.error("Cancel order error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to cancel order",
      });
    }
  };

  // Get order statistics (admin)
  getOrderStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;

      // This would be implemented based on specific business requirements
      // For now, returning a basic structure
      const stats = {
        totalOrders: 0,
        totalRevenue: 0,
        ordersByStatus: {},
        ordersByType: {},
        topProducts: [],
      };

      const response: ApiResponse = {
        success: true,
        data: stats,
      };
      res.json(response);
    } catch (error) {
      console.error("Get order stats error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get order statistics",
      });
    }
  };
}
