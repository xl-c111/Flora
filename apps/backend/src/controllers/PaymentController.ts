import { Request, Response } from 'express';
import { PaymentService } from '../services/PaymentService';
import { ApiResponse } from '../types/api';

export class PaymentController {
  private paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();
  }

  // Create payment intent for order
  createPaymentIntent = async (req: Request, res: Response): Promise<void> => {
    try {
      const { orderId, amount } = req.body;

      const paymentIntent = await this.paymentService.createPaymentIntent({
        orderId,
        amount,
      });

      const response: ApiResponse = {
        success: true,
        data: {
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
        },
      };
      res.json(response);
    } catch (error) {
      console.error('Create payment intent error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create payment intent',
      });
    }
  };

  // Confirm payment
  confirmPayment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { paymentIntentId, orderId } = req.body;

      const payment = await this.paymentService.confirmPayment(
        paymentIntentId,
        orderId
      );

      const response: ApiResponse = {
        success: true,
        data: payment,
        message: 'Payment confirmed successfully',
      };
      res.json(response);
    } catch (error) {
      console.error('Confirm payment error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to confirm payment',
      });
    }
  };


  // Get payment details
  getPayment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const payment = await this.paymentService.getPaymentById(id);
      if (!payment) {
        res.status(404).json({ success: false, error: 'Payment not found' });
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: payment,
      };
      res.json(response);
    } catch (error) {
      console.error('Get payment error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get payment',
      });
    }
  };

  // Get payment methods for a customer
  getPaymentMethods = async (req: Request, res: Response): Promise<void> => {
    try {
      const { customerId } = req.query;

      if (!customerId || typeof customerId !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Customer ID is required',
        });
        return;
      }

      const paymentMethods = await this.paymentService.getPaymentMethods(customerId);

      const response: ApiResponse = {
        success: true,
        data: paymentMethods,
      };
      res.json(response);
    } catch (error) {
      console.error('Get payment methods error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get payment methods',
      });
    }
  };

  // Create customer
  createCustomer = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, name, phone, address } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          error: 'Email is required',
        });
        return;
      }

      const customer = await this.paymentService.createCustomer({
        email,
        name,
        phone,
        address,
      });

      const response: ApiResponse = {
        success: true,
        data: customer,
        message: 'Customer created successfully',
      };
      res.json(response);
    } catch (error) {
      console.error('Create customer error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create customer',
      });
    }
  };

  // Refund payment
  refundPayment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { amount, reason } = req.body;

      const refund = await this.paymentService.refundPayment(
        id,
        amount,
        reason
      );

      const response: ApiResponse = {
        success: true,
        data: refund,
        message: 'Payment refunded successfully',
      };
      res.json(response);
    } catch (error) {
      console.error('Refund payment error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to refund payment',
      });
    }
  };
}
