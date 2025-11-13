# Stripe Flow on the Deployed Site

This is the quick reference for how Stripe operates once the Flora stack is live behind CloudFront.

---

## 1. Request Flow

1. **User clicks checkout** on `https://dzmu16crq41il.cloudfront.net`.
2. CloudFront forwards `/api/*` requests to the EC2 backend.
3. The backend (`apps/backend/src/services/PaymentService.ts`):
   - Creates or updates the order via Prisma.
   - Calls Stripe’s API with the secret key pulled from SSM/`.env`.
   - Returns the client secret to the frontend so Stripe Elements can render the card form.

---

## 2. Payment Confirmation

1. Stripe handles card entry and confirmation through Stripe Elements.
2. When the payment succeeds, Stripe emits webhook events (e.g., `payment_intent.succeeded`).
3. The webhook URL in the Stripe dashboard points to the CDN domain:  
   `https://dzmu16crq41il.cloudfront.net/api/stripe/webhook`.
4. CloudFront forwards that path to the EC2 backend, which:
   - Verifies the signature with `STRIPE_WEBHOOK_SECRET`.
   - Marks the order as `CONFIRMED`, records payment details, and triggers nodemailer to send email.

---

## 3. Local vs. Production Webhooks

| Environment | How events reach `/api/stripe/webhook` |
| ----------- | --------------------------------------- |
| **Local dev** | Stripe CLI tunnel forwards events from Stripe → CLI → `localhost:3001`. |
| **Deployment** | Stripe hits the CloudFront URL directly, which proxies to EC2. No CLI needed. |

---

## 4. Deployment Checklist for Stripe

- [ ] Backend deployed with updated `PaymentService` or webhook logic.
- [ ] `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` stored in SSM/`.env`.
- [ ] Stripe dashboard webhook endpoint set to the CloudFront URL.
- [ ] Webhook signing secret copied to AWS Parameter Store.
- [ ] Test payment run in production using Stripe test card (e.g., `4242 4242 4242 4242`) to confirm orders move from `PENDING` → `CONFIRMED`.

Keep this file handy when explaining the payment pipeline during interviews or troubleshooting live payments.

