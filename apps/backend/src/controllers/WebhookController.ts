import { Request, Response } from 'express';
import { PaymentService } from '../services/PaymentService';

export class WebhookController {
  private paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();
  }

  handleStripeWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
      const sig = req.headers['stripe-signature'] as string;
      const payload = req.body;
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

      await this.paymentService.handleWebhook(payload, sig, endpointSecret);

      res.status(200).json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(400).json({
        error: 'Webhook signature verification failed',
      });
    }
  };
}