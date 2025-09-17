import { Request, Response } from 'express';
import { OrderService } from '../services/OrderService';
import { ApiResponse } from '../types/api';

export class OrderController {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService();
  }

  // Create new order (guest or user)
  createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id; // Optional for guest checkout
      const orderData = req.body;

      const order = await this.orderService.createOrder({
        ...orderData,
        userId,
      });

      const response: ApiResponse = {
        success: true,
        data: order,
        message: 'Order created successfully',
      };
      res.status(201).json(response);
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create order',
      });
    }
  };

  // Get order by ID
  getOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const order = await this.orderService.getOrderById(id, userId);
      if (!order) {
        res.status(404).json({ success: false, error: 'Order not found' });
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: order,
      };
      res.json(response);
    } catch (error) {
      console.error('Get order error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get order',
      });
    }
  };

  // Get user orders
  getUserOrders = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const orders = await this.orderService.getUserOrders(userId);

      const response: ApiResponse = {
        success: true,
        data: orders,
      };
      res.json(response);
    } catch (error) {
      console.error('Get user orders error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get orders',
      });
    }
  };

  // Confirm order payment
  confirmOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { paymentIntentId } = req.body;

      const order = await this.orderService.confirmOrder(id, paymentIntentId);

      const response: ApiResponse = {
        success: true,
        data: order,
        message: 'Order confirmed successfully',
      };
      res.json(response);
    } catch (error) {
      console.error('Confirm order error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to confirm order',
      });
    }
  };

  // Update order status (admin)
  updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const order = await this.orderService.updateOrderStatus(id, status);

      const response: ApiResponse = {
        success: true,
        data: order,
        message: 'Order status updated successfully',
      };
      res.json(response);
    } catch (error) {
      console.error('Update order status error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update order status',
      });
    }
  };
}
