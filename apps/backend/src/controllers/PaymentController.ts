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

  // Stripe webhook handler
  handleStripeWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
      const sig = req.headers['stripe-signature'] as string;
      const payload = req.body;

      await this.paymentService.handleWebhook(payload, sig);

      res.status(200).json({ received: true });
    } catch (error) {
      console.error('Stripe webhook error:', error);
      res.status(400).json({
        success: false,
        error: 'Webhook signature verification failed',
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
