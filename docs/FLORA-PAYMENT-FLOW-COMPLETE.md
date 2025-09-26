# 🌸 Flora Marketplace - Complete Payment Flow Documentation

## 📋 **Table of Contents**
1. [Overview](#overview)
2. [Architecture Components](#architecture-components)
3. [Complete Payment Flow](#complete-payment-flow)
4. [Database Schema](#database-schema)
5. [Container Communication](#container-communication)
6. [Error Handling & Recovery](#error-handling--recovery)
7. [Testing the Flow](#testing-the-flow)

---

## 🏗️ **Overview**

Flora Marketplace implements a robust payment system that supports both **guest checkout** and **registered user** purchases. The flow integrates multiple containers working together to provide a seamless payment experience with automatic email confirmations.

### **Core Flow:**
```
Frontend → Backend → Database → Stripe Server → Webhook → stripe-cli → Backend → Email
```

---

## 🏛️ **Architecture Components**

### **Container Architecture:**
```
┌─────────────────────────────────────────────────────────────────┐
│                        Docker Network                           │
├─────────────────┬─────────────────┬─────────────────┬───────────┤
│   Frontend      │    Backend      │    Database     │ Stripe-CLI│
│   Container     │    Container    │    Container    │ Container │
│                 │                 │                 │           │
│ - React App     │ - Express API   │ - PostgreSQL    │ - Webhook │
│ - Stripe.js     │ - PaymentService│ - Prisma ORM    │ Forwarder │
│ - Checkout UI   │ - OrderService  │ - User/Order    │ - Real-time│
│                 │ - EmailService  │   Tables        │ Events    │
└─────────────────┴─────────────────┴─────────────────┴───────────┘
```

### **Key Services:**
- **OrderController**: Handles order creation and management
- **PaymentController**: Manages payment intents and confirmations
- **PaymentService**: Interfaces with Stripe API
- **EmailService**: Sends professional order confirmations
- **OrderService**: Business logic for orders and tracking

---

## 💳 **Complete Payment Flow - Step by Step**

### **Phase 1: Frontend - Order Creation**

```mermaid
sequenceDiagram
    participant C as Customer
    participant F as Frontend
    participant B as Backend
    participant D as Database

    C->>F: 1. Add items to cart
    C->>F: 2. Enter shipping info
    C->>F: 3. Click "Proceed to Payment"
    F->>B: 4. POST /api/orders
    Note over F,B: Create order with PENDING status
    B->>D: 5. Insert order record
    D-->>B: 6. Return order ID
    B-->>F: 7. Order created successfully
```

**Step-by-Step Breakdown:**

1. **Customer Action**: Selects products and enters shipping information
2. **Frontend Processing**: Validates form data and prepares order payload
3. **API Call**: `POST /api/orders` with order details
   ```typescript
   // Request payload
   {
     purchaseType: "ONE_TIME",
     items: [
       { productId: "prod_123", quantity: 2, priceCents: 2999 }
     ],
     guestEmail: "customer@example.com",
     shippingAddress: {
       firstName: "John",
       lastName: "Doe",
       street1: "123 Main St",
       city: "New York",
       state: "NY",
       zipCode: "10001"
     },
     deliveryType: "STANDARD"
   }
   ```

4. **OrderController.createOrder()**: Processes the request
5. **OrderService.createOrder()**: Business logic execution:
   - Validates product availability and stock
   - Calculates subtotal, shipping, and tax
   - Generates unique order number (e.g., `FLR20240926001`)
   - Creates database transaction

6. **Database Operations**:
   ```sql
   -- Create order
   INSERT INTO "Order" (orderNumber, purchaseType, guestEmail, totalCents, status, ...)
   VALUES ('FLR20240926001', 'ONE_TIME', 'customer@example.com', 3499, 'PENDING', ...);

   -- Create order items
   INSERT INTO "OrderItem" (orderId, productId, quantity, priceCents)
   VALUES ('order_id', 'prod_123', 2, 2999);

   -- Update product stock
   UPDATE "Product" SET stockCount = stockCount - 2 WHERE id = 'prod_123';
   ```

7. **Response**: Order object with ID returned to frontend

---

### **Phase 2: Frontend - Payment Intent Creation**

```mermaid
sequenceDiagram
    participant F as Frontend
    participant B as Backend
    participant S as Stripe Server

    F->>B: 1. POST /api/payments/intent
    Note over F,B: { orderId, amount }
    B->>S: 2. Create Payment Intent
    Note over B,S: Stripe API call
    S-->>B: 3. Return client_secret
    B-->>F: 4. Payment intent created
    F->>F: 5. Initialize Stripe Elements
```

**Step-by-Step Breakdown:**

8. **Payment Intent Request**: `POST /api/payments/intent`
   ```typescript
   // Frontend request
   {
     orderId: "order_123",
     amount: 34.99  // In dollars
   }
   ```

9. **PaymentController.createPaymentIntent()**: Handles the request

10. **PaymentService.createPaymentIntent()**: Creates Stripe payment intent
    ```typescript
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: { orderId },
      automatic_payment_methods: { enabled: true }
    });
    ```

11. **Stripe Server**: Processes request and returns `client_secret`

12. **Response**: Frontend receives payment intent details
    ```typescript
    {
      success: true,
      data: {
        clientSecret: "pi_3ABC123_secret_XYZ",
        paymentIntentId: "pi_3ABC123"
      }
    }
    ```

13. **Frontend**: Initializes Stripe Elements with client secret

---

### **Phase 3: Frontend - Payment Processing**

```mermaid
sequenceDiagram
    participant C as Customer
    participant F as Frontend
    participant S as Stripe Server
    participant B as Backend

    C->>F: 1. Enter payment details
    C->>F: 2. Click "Pay Now"
    F->>S: 3. confirmPayment(clientSecret)
    S->>S: 4. Process payment
    S-->>F: 5. Payment result
    alt Payment Successful
        F->>B: 6. POST /api/orders/{id}/confirm
        B-->>F: 7. Order confirmed
        F->>C: 8. Show success page
    else Payment Failed
        F->>C: 9. Show error message
    end
```

**Step-by-Step Breakdown:**

14. **Customer Payment**: Enters card details in Stripe Elements
15. **Payment Submission**: Frontend calls `stripe.confirmPayment()`
16. **Stripe Processing**:
    - Validates card details
    - Processes payment with bank
    - Returns payment result

17. **Success Path**: If payment succeeds
    - Frontend receives `{status: 'succeeded'}`
    - Calls `POST /api/orders/{orderId}/confirm`
    - OrderController.confirmOrder() updates order status
    - Customer redirected to success page

18. **Failure Path**: If payment fails
    - Frontend receives error details
    - Shows appropriate error message to customer
    - Order remains in PENDING status

---

### **Phase 4: Stripe Webhook Processing**

```mermaid
sequenceDiagram
    participant S as Stripe Server
    participant SC as stripe-cli
    participant B as Backend
    participant D as Database
    participant E as Email Service

    S->>SC: 1. Send webhook event
    Note over S,SC: payment_intent.succeeded
    SC->>B: 2. Forward to /api/webhooks/stripe
    B->>B: 3. Verify webhook signature
    B->>B: 4. PaymentService.handleWebhook()
    B->>D: 5. Update order status to CONFIRMED
    B->>D: 6. Create/update payment record
    B->>E: 7. EmailService.sendOrderConfirmation()
    E->>E: 8. Send professional email
    B-->>SC: 9. Return 200 OK
```

**Step-by-Step Breakdown:**

19. **Stripe Event**: When payment succeeds, Stripe generates webhook event
    ```json
    {
      "id": "evt_123",
      "type": "payment_intent.succeeded",
      "data": {
        "object": {
          "id": "pi_3ABC123",
          "amount": 3499,
          "currency": "usd",
          "status": "succeeded",
          "metadata": { "orderId": "order_123" }
        }
      }
    }
    ```

20. **stripe-cli Container**: Receives webhook and forwards to backend
    ```bash
    # stripe-cli forwards webhook to:
    http://backend:3001/api/webhooks/stripe
    ```

21. **Webhook Route**: `POST /api/webhooks/stripe` (webhooks.ts)
    ```typescript
    router.post("/stripe", express.raw({ type: "application/json" }), async (req, res) => {
      await paymentService.handleWebhook(
        req.body,
        req.headers["stripe-signature"],
        endpointSecret
      );
      res.json({ received: true });
    });
    ```

22. **PaymentService.handleWebhook()**: Processes the event
    - Verifies webhook signature for security
    - Extracts orderId from metadata
    - Calls appropriate handler based on event type

23. **PaymentService.handlePaymentIntentSucceeded()**: Core success logic
    ```typescript
    private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
      const orderId = paymentIntent.metadata.orderId;

      // Update order status
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "CONFIRMED" }
      });

      // Create payment record
      await prisma.payment.upsert({
        where: { stripePaymentIntentId: paymentIntent.id },
        create: {
          orderId,
          amountCents: paymentIntent.amount,
          currency: paymentIntent.currency.toUpperCase(),
          stripePaymentIntentId: paymentIntent.id,
          status: "succeeded",
          paidAt: new Date()
        },
        update: {
          status: "succeeded",
          paidAt: new Date()
        }
      });

      // Send confirmation email
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { user: true }
      });

      await this.emailService.sendOrderConfirmation(order);
    }
    ```

---

### **Phase 5: Email Notification**

```mermaid
sequenceDiagram
    participant B as Backend
    participant E as EmailService
    participant G as Gmail SMTP
    participant C as Customer

    B->>E: 1. sendOrderConfirmation(order)
    E->>E: 2. Format professional email
    E->>G: 3. SMTP send via nodemailer
    Note over E,G: Authentication with App Password
    G->>C: 4. Deliver email to customer
    G-->>E: 5. Delivery confirmation
    E-->>B: 6. Email sent successfully
```

**Step-by-Step Breakdown:**

24. **Email Trigger**: PaymentService calls EmailService.sendOrderConfirmation()

25. **Email Formatting**: EmailService creates professional email
    ```typescript
    const mailOptions = {
      from: this.getProfessionalSender(), // "Flora Marketplace" <10430@holbertonstudents.com>
      to: customerEmail, // order.guestEmail || order.user.email
      subject: `Order Confirmation #${order.orderNumber}`,
      html: professionalHtmlTemplate
    };
    ```

26. **SMTP Configuration**: Uses your .env settings
    ```bash
    SMTP_HOST=smtp.gmail.com
    SMTP_PORT=587
    SMTP_USER=10430@holbertonstudents.com
    SMTP_PASS=jvzskcqdbogfpvpg  # Gmail App Password
    ```

27. **Email Content**: Professional order confirmation
    ```html
    <h1>Order Confirmation</h1>
    <p>Dear Customer,</p>
    <p>Thank you for your order! We've received your purchase...</p>

    <div>
      <h3>Order Details</h3>
      <p><strong>Order Number:</strong> #FLR20240926001</p>
      <p><strong>Total Amount:</strong> $34.99</p>
      <p><strong>Delivery Address:</strong><br/>
      John Doe<br/>123 Main St<br/>New York, NY 10001</p>
    </div>
    ```

28. **Email Delivery**: Gmail SMTP sends email to customer

29. **Customer Receives**: Professional Flora marketplace confirmation email

---

## 🗄️ **Database Schema**

### **Key Tables and Relationships:**

```sql
-- Orders table
CREATE TABLE "Order" (
  id                    TEXT PRIMARY KEY,
  orderNumber           TEXT UNIQUE NOT NULL,
  purchaseType          PurchaseType NOT NULL,
  userId                TEXT REFERENCES "User"(id),
  guestEmail            TEXT,
  guestPhone            TEXT,

  -- Pricing
  subtotalCents         INTEGER NOT NULL,
  shippingCents         INTEGER NOT NULL,
  taxCents              INTEGER NOT NULL,
  totalCents            INTEGER NOT NULL,

  -- Shipping address snapshot
  shippingFirstName     TEXT NOT NULL,
  shippingLastName      TEXT NOT NULL,
  shippingStreet1       TEXT NOT NULL,
  shippingStreet2       TEXT,
  shippingCity          TEXT NOT NULL,
  shippingState         TEXT NOT NULL,
  shippingZipCode       TEXT NOT NULL,

  -- Order management
  status                OrderStatus DEFAULT 'PENDING',
  deliveryType          DeliveryType NOT NULL,
  requestedDeliveryDate TIMESTAMP,
  actualDeliveryDate    TIMESTAMP,
  deliveryNotes         TEXT,

  createdAt             TIMESTAMP DEFAULT NOW(),
  updatedAt             TIMESTAMP DEFAULT NOW()
);

-- Order items
CREATE TABLE "OrderItem" (
  id         TEXT PRIMARY KEY,
  orderId    TEXT NOT NULL REFERENCES "Order"(id) ON DELETE CASCADE,
  productId  TEXT NOT NULL REFERENCES "Product"(id),
  quantity   INTEGER NOT NULL,
  priceCents INTEGER NOT NULL, -- Price snapshot at order time

  createdAt  TIMESTAMP DEFAULT NOW()
);

-- Payments table
CREATE TABLE "Payment" (
  id                      TEXT PRIMARY KEY,
  orderId                 TEXT NOT NULL REFERENCES "Order"(id),
  amountCents             INTEGER NOT NULL,
  currency                TEXT NOT NULL DEFAULT 'USD',

  -- Stripe integration
  stripePaymentIntentId   TEXT UNIQUE,
  stripeCustomerId        TEXT,

  status                  TEXT NOT NULL, -- 'pending', 'succeeded', 'failed'
  paidAt                  TIMESTAMP,

  createdAt               TIMESTAMP DEFAULT NOW(),
  updatedAt               TIMESTAMP DEFAULT NOW()
);
```

### **Data Flow During Payment:**

1. **Order Creation**: Insert into Order table with `status='PENDING'`
2. **Payment Intent**: No database changes (Stripe handles this)
3. **Payment Success**: Webhook updates:
   - Order: `status='CONFIRMED'`
   - Payment: Insert/update with Stripe details
   - Product: Decrement `stockCount`

---

## 🐳 **Container Communication**

### **Network Flow:**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   Port: 5173    │◄──►│   Port: 3001    │◄──►│   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       ▲
         │              ┌─────────────────┐
         └──────────────►│   stripe-cli    │
                         │   (webhook)     │
                         └─────────────────┘
                                  ▲
                         ┌─────────────────┐
                         │ Stripe Servers  │
                         │ (External API)  │
                         └─────────────────┘
```

### **Container Environment Variables:**

**Backend Container:**
```bash
# Database connection
DATABASE_URL=postgresql://flora_user:flora_password@postgres:5432/flora_db

# Stripe configuration
STRIPE_SECRET_KEY=sk_test_51S8ya1PtGaCvy8Fq...
STRIPE_WEBHOOK_SECRET=whsec_a8189d18db71f084...

# Email configuration
SMTP_HOST=smtp.gmail.com
SMTP_USER=10430@holbertonstudents.com
SMTP_PASS=jvzskcqdbogfpvpg
```

**stripe-cli Container:**
```bash
# Webhook forwarding
STRIPE_API_KEY=${STRIPE_SECRET_KEY}
# Forwards webhooks to: http://backend:3001/api/webhooks/stripe
```

---

## 🚨 **Error Handling & Recovery**

### **Common Failure Scenarios:**

#### **1. Payment Fails at Stripe**
```typescript
// Frontend handles failed payment
if (result.error) {
  setErrorMessage(result.error.message);
  // Order remains in PENDING status
  // Customer can retry payment
}
```

#### **2. Webhook Delivery Fails**
```typescript
// PaymentService has error handling
try {
  await this.emailService.sendOrderConfirmation(order);
} catch (emailError) {
  console.error("Failed to send email:", emailError);
  // Payment success is not rolled back
  // Email failure is logged but doesn't affect order
}
```

#### **3. Database Connection Issues**
```typescript
// Prisma handles retries automatically
// Transaction rollback on failure ensures data consistency
await prisma.$transaction(async (tx) => {
  // All operations succeed or all fail
});
```

#### **4. Email Service Down**
```typescript
// Email failures are non-blocking
// Order confirmation still completes
// Could implement retry queue in production
```

### **Recovery Mechanisms:**

1. **Order Status Tracking**: Orders maintain status for manual intervention
2. **Idempotent Webhooks**: Duplicate webhook events are handled safely
3. **Payment Records**: Stripe payment IDs prevent duplicate processing
4. **Email Retry**: Could be implemented with background job queue

---

## 🧪 **Testing the Flow**

### **1. End-to-End Test Script:**

```bash
# Start all containers
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# Test email system first
cd apps/backend
node -e "console.log('Testing email...'); /* email test code */"

# Test webhook forwarding
stripe listen --forward-to http://localhost:3001/api/webhooks/stripe
```

### **2. Manual Testing Steps:**

1. **Frontend**: Navigate to product page → Add to cart → Checkout
2. **Order Creation**: Verify order appears in database with PENDING status
3. **Payment**: Enter test card `4242424242424242` → Submit payment
4. **Webhook**: Check logs for webhook receipt and processing
5. **Database**: Verify order status changed to CONFIRMED
6. **Email**: Check customer inbox for order confirmation

### **3. Test Payment Cards:**

```
# Successful payments
4242424242424242  # Visa
4000056655665556  # Visa debit

# Failed payments
4000000000000002  # Card declined
4000000000009995  # Insufficient funds
```

### **4. Monitoring Logs:**

```bash
# Backend logs
docker logs flora-backend -f

# Stripe CLI logs
docker logs flora-stripe-cli -f

# Database logs
docker logs flora-postgres -f
```

---

## 🎯 **Demo Checklist**

### **Pre-Demo Setup:**
- [ ] All containers running
- [ ] Database seeded with products
- [ ] Email credentials configured
- [ ] stripe-cli listening for webhooks
- [ ] Test cards ready

### **Demo Flow:**
1. **Show Product Catalog** - Browse available flowers
2. **Add to Cart** - Select items and quantities
3. **Guest Checkout** - Enter shipping information
4. **Payment Processing** - Use test card for payment
5. **Success Confirmation** - Show order success page
6. **Email Demonstration** - Check email inbox for confirmation
7. **Admin View** - Show order status in backend/database

### **Key Points to Highlight:**
- Seamless guest checkout (no account required)
- Real-time payment processing with Stripe
- Automatic email confirmations with professional branding
- Container-based architecture for scalability
- Comprehensive error handling and logging

---

## 🔧 **Production Considerations**

### **Security:**
- Environment variables properly secured
- Webhook signature verification enabled
- Input validation on all endpoints
- Rate limiting on payment endpoints

### **Scalability:**
- Database connection pooling
- Redis for session management
- Background job queues for emails
- Load balancing for multiple backend instances

### **Monitoring:**
- Payment success/failure rates
- Email delivery rates
- Database performance metrics
- API response times

---

**🎉 Your Flora Marketplace payment flow is ready for demonstration!** This comprehensive system handles the complete customer journey from product selection to email confirmation, with robust error handling and professional email notifications.