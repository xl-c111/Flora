# Stripe PaymentIntent Logic Flow
```pgsql
┌──────────┐
│   User   │
└────┬─────┘
     │ clicks "Pay"
     ▼
┌────────────┐
│  Frontend  │
│ (React App)│
└────┬───────┘
     │
     │ 1. request payment intent
     ▼
┌────────────┐
│  Backend   │
│ (Node.js)  │
└────┬───────┘
     │
     │ 2. create PaymentIntent
     ▼
┌────────────────┐
│ Stripe Servers │
└────┬───────────┘
     │
     │ 3. return client_secret
     ▼
┌────────────┐
│  Backend   │
└────┬───────┘
     │
     │ 4. send client_secret
     ▼
┌────────────┐
│  Frontend  │
└────┬───────┘
     │
     │ 5. confirm payment using client_secret
     ▼
┌────────────────┐
│ Stripe Servers │
│ process payment│
└────┬───────────┘
     │
     │ 6. send webhook event
     ▼
┌────────────┐
│  Backend   │
│  /webhook  │
└────┬───────┘
     │
     │ verify webhook signature
     ▼
┌──────────────┐
│  Database    │
│ update order │
│ status=paid  │
└──────────────┘

```

## client_secrets vs webhook event
```nginx
client_secret → frontend completes payment

webhook → backend confirms payment
```

## Explain Stripe PaymentIntent flow in Flora
- The frontend first requests a PaymentIntent from my backend. The backend creates it using Stripe’s API and returns a client secret. The frontend then uses the client secret to securely confirm the payment with Stripe. Once the payment succeeds, Stripe sends a webhook event to my backend. I verify the webhook signature and update the order status in the database. This ensures the system only trusts Stripe’s backend confirmation.
