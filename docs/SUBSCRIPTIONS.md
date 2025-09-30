# Flora Subscription System - Complete Guide

This document explains Flora's subscription system architecture, workflow, and testing procedures for the development team.

## 📁 Backend File Architecture

### File Structure & Responsibilities
```
📁 apps/backend/
├── 📁 prisma/
│   └── schema.prisma                    # Database schema (Subscription, SubscriptionItem models)
├── 📁 src/
│   ├── 📁 config/
│   │   └── database.ts                  # Prisma client configuration
│   ├── 📁 services/
│   │   ├── SubscriptionService.ts       # Core subscription business logic
│   │   ├── OrderService.ts              # Order creation & payment integration
│   │   └── EmailService.ts              # Email notifications
│   ├── 📁 controllers/
│   │   └── SubscriptionController.ts    # HTTP request/response handling
│   ├── 📁 routes/
│   │   └── subscriptions.ts             # API endpoint definitions
│   └── 📁 middleware/
│       ├── auth.ts                      # JWT authentication
│       └── validation/
│           └── subscriptionValidation.ts # Request validation schemas
```

## 🔄 Complete Subscription Workflow

### Flow 1: Creating a Subscription

```
1. 🌐 Frontend Request
   └── POST /api/subscriptions/from-product
   └── Headers: Authorization Bearer JWT_TOKEN
   └── Body: { productId, subscriptionType, addressId, quantity?, deliveryType?, deliveryNotes? }

2. 🛡️ Authentication & Routing (subscriptions.ts:20-23)
   └── authMiddleware() validates JWT token → extracts userId
   └── Routes to SubscriptionController.createSubscriptionFromProduct()

3. 🎮 Controller Layer (SubscriptionController.ts:336-383)
   └── Validates required fields (productId, subscriptionType, addressId)
   └── Calls SubscriptionService.createSubscription() with userId + form data

4. 💼 Business Logic (SubscriptionService.ts:31-88)
   └── Security Check: Validates addressId belongs to userId
   └── Calculates nextDeliveryDate based on subscription type
   └── Database Transaction:
       ├── Creates Subscription record
       ├── Creates SubscriptionItem records (products in subscription)
       └── For RECURRING types: Creates first Order immediately
       └── For SPONTANEOUS types: Waits for user trigger

5. 🛒 Order Integration (SubscriptionService.ts:233-289)
   └── Builds OrderData from subscription info
   └── Calls OrderService.createOrder() (existing order system)
   └── Order flows through: Payment → Inventory → Email → Tracking
   └── Updates subscription.lastDeliveryDate

6. ✅ Response
   └── Returns full subscription with items, address, user details
```

### Flow 2: Recurring Deliveries (Background Processing)

```
1. ⏰ Scheduled Job (Daily Cron Job)
   └── Calls SubscriptionService.processSubscriptionDeliveries()

2. 🔍 Query Due Subscriptions (SubscriptionService.ts:205-224)
   └── SELECT subscriptions WHERE:
       ├── status = 'ACTIVE'
       ├── nextDeliveryDate <= TODAY
       └── type != 'SPONTANEOUS'

3. 🔄 Process Each Subscription:
   └── createSubscriptionOrder() → New Order created
   └── Order flows through OrderService (payment/fulfillment)
   └── Updates nextDeliveryDate for next cycle
   └── Logs: "✅ Created subscription order [orderNumber] for subscription [id]"
```

### Flow 3: Spontaneous Deliveries (User-Triggered)

```
1. 🌐 User Request
   └── POST /api/subscriptions/:id/spontaneous
   └── Body: { requestedDate?, deliveryNotes?, items? }

2. ✅ Validation (SubscriptionService.ts:312-327)
   └── Checks subscription.type === 'SPONTANEOUS'
   └── Validates user owns the subscription
   └── Allows custom items OR uses subscription default items

3. 🛒 One-Time Order Creation (SubscriptionService.ts:329-371)
   └── Creates ORDER with purchaseType='ONE_TIME'
   └── Links to subscription via subscriptionId
   └── Flows through full OrderService pipeline
```

## 🎯 Subscription Types & Behavior

| Type | Auto Orders | User Trigger | Next Delivery | Use Case |
|------|-------------|--------------|---------------|----------|
| `RECURRING_WEEKLY` | ✅ Every 7 days | ❌ | Auto-calculated | Regular weekly flowers |
| `RECURRING_BIWEEKLY` | ✅ Every 14 days | ❌ | Auto-calculated | Bi-weekly arrangements |
| `RECURRING_MONTHLY` | ✅ Every month | ❌ | Auto-calculated | Monthly centerpieces |
| `RECURRING_QUARTERLY` | ✅ Every 3 months | ❌ | Auto-calculated | Seasonal decorations |
| `RECURRING_YEARLY` | ✅ Every year | ❌ | Auto-calculated | Anniversary flowers |
| `SPONTANEOUS` | ❌ Never | ✅ Manual | No schedule | On-demand deliveries |

## 🧪 Testing

For comprehensive testing instructions, see: **[TESTING_GUIDE.md](./TESTING_GUIDE.md)**

Quick test commands:
```bash
# Run automated test suite
docker exec flora-backend pnpm test:subscriptions

# Test delivery endpoints
curl http://localhost:3001/api/delivery/info
curl http://localhost:3001/api/delivery/validate/3000
```

## 🔧 Development Tools

### Database Inspection
```bash
# GUI for database
npx prisma studio

# View logs
pnpm docker:logs

# Restart backend
pnpm docker:restart-backend
```

### API Testing Tools
- **Postman**: Import endpoints with Bearer token auth
- **Insomnia**: REST client with authentication
- **curl**: Command line testing
- **Browser DevTools**: Network tab to see requests

## 🚨 Common Issues & Solutions

### 1. "Missing authorization header"
- **Cause**: No JWT token provided
- **Fix**: Login at frontend, get token from localStorage

### 2. "Subscription not found"
- **Cause**: Invalid subscription ID or wrong user
- **Fix**: Use subscription ID from creation response

### 3. "Invalid address for this user"
- **Cause**: addressId doesn't belong to the authenticated user
- **Fix**: Create user address first or use correct addressId

### 4. "Product not available"
- **Cause**: Invalid productId or product is inactive
- **Fix**: Check available products via `/api/products`

### 5. Database connection errors
- **Cause**: Database not running or wrong connection
- **Fix**: Check `pnpm docker:logs` and restart services

## 🔄 Integration with Existing Systems

The subscription system seamlessly integrates with:

- **OrderService**: All subscription deliveries create real orders
- **PaymentService**: Orders go through Stripe payment processing
- **EmailService**: Confirmation emails sent automatically
- **DeliveryService**: Tracking and fulfillment handled
- **Auth0**: JWT authentication for all subscription operations

This ensures subscription orders have the same reliability and features as one-time purchases.

## 📋 For Your Teammates

This subscription system is designed to:

1. **Reuse existing infrastructure** - All subscriptions create real orders through the existing OrderService
2. **Maintain data consistency** - Uses database transactions and proper validation
3. **Scale easily** - Background job processing handles recurring deliveries
4. **Stay secure** - All endpoints require authentication and validate user ownership
5. **Be testable** - Comprehensive API endpoints for all operations

The backend is now ready for frontend integration. The key endpoint for UI integration is:
```
POST /api/subscriptions/from-product
```
This single endpoint handles the entire subscription creation flow from a product page.