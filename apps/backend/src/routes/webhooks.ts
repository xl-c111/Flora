import express, { Router } from "express";
import dotenv from "dotenv";
import { PaymentService } from "../services/PaymentService";

dotenv.config();

const router: Router = express.Router();
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Enhanced webhook endpoint using PaymentService
router.post("/stripe", express.raw({ type: "application/json" }), async (req, res) => {
  try {
    const paymentService = new PaymentService();

    await paymentService.handleWebhook(
      req.body,
      req.headers["stripe-signature"] as string,
      endpointSecret
    );

    res.json({ received: true });
  } catch (err: any) {
    console.error("❌ Webhook error:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

export default router;
