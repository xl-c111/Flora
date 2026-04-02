```text
👩‍💻 [ Customer (Frontend) ]
│
│ clicks "Pay" 💳
▼
🖥️ [ Backend API ]
- 📝 Create order in DB (status: pending)
- 🔗 Call Stripe API to create PaymentIntent/CheckoutSession
  │
  ▼
☁️ [ Stripe Server (can't reach backend directly, must go through Stripe-CLI) ]
- 💳 Handle card + payment method
- ⚙️ Process transaction
- 📢 Generate event (e.g., payment_intent.succeeded)
  │
  │ (Webhook event)
  ▼
📦 [ Stripe CLI Container ]
- 🌉 Acts as a tunnel
- 📡 Forwards event from Stripe server
       to your local backend (/webhook)
  │
  ▼
🛠️ [ Backend Webhook Handler ]
- ✅ Verify event signature
- 🔄 Update order in DB (status: paid/failed)
- 📧 Trigger email / 🔔 notifications
  │
  ▼
🗄️ [ Database ]
- 🆕 Order status updated
  │
  ▼
👩‍💻 [ Customer (Frontend) ]
- 🔀 Redirected to success/fail page
- 🎉 Sees confirmation
```