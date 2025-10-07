# 🧪 Flora Subscription Testing Guide

## Quick Testing Commands

### 🏃‍♀️ Automated Tests

```bash
# Run comprehensive subscription test suite
docker exec flora-backend pnpm test:subscriptions

# Alternative: Run in Docker background first
pnpm docker:dev:bg
docker exec flora-backend pnpm test:subscriptions
```

**Expected Output:**
```
🌸 Flora Subscription System - Simplified Test Suite (Melbourne)
═════════════════════════════════════════════════════════════════

✅ Simplified Flow:       ✅ PASSED
✅ Management Operations: ✅ PASSED
✅ Spontaneous Delivery:  ✅ PASSED
✅ Order Integration:     ✅ PASSED
✅ Melbourne Delivery:    ✅ PASSED
✅ Error Handling:        ✅ PASSED

🎯 Overall: 6/6 tests passed
```

## 📱 Manual API Testing (Postman/curl)

### 🔐 Authentication Setup

1. **Get JWT Token:**
   - Login at: http://localhost:5173
   - Open Dev Tools → Console
   - Find `access_token` value
   - Copy for API testing

### 🚚 Delivery Endpoints (No Auth Required)

```bash
# Get Melbourne delivery info
curl http://localhost:3001/api/delivery/info

# Validate Melbourne postcode
curl http://localhost:3001/api/delivery/validate/3000
curl http://localhost:3001/api/delivery/validate/3141
curl http://localhost:3001/api/delivery/validate/9999  # Should fail
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "serviceArea": {
      "name": "Melbourne Metro Area",
      "description": "We deliver throughout Greater Melbourne"
    },
    "pricing": {
      "standard": {"fee": 899, "display": "$8.99 AUD"},
      "express": {"fee": 1599, "display": "$15.99 AUD"}
    },
    "currency": "AUD"
  }
}
```

### 📋 Subscription Endpoints (Auth Required)

#### Create Weekly Subscription (Melbourne)
```bash
POST http://localhost:3001/api/subscriptions/from-product
Headers:
  Content-Type: application/json
  Authorization: Bearer YOUR_JWT_TOKEN

Body:
{
  "productId": "PRODUCT_ID_FROM_DB",
  "subscriptionType": "RECURRING_WEEKLY",
  "quantity": 1,
  "deliveryType": "STANDARD",
  "deliveryNotes": "Leave at door",
  "shippingAddress": {
    "firstName": "Emma",
    "lastName": "Melbourne",
    "street1": "123 Collins Street",
    "street2": "Unit 15B",
    "city": "Melbourne",
    "state": "VIC",
    "zipCode": "3000",
    "phone": "+61-3-9555-1234"
  }
}
```

#### Get User Subscriptions
```bash
GET http://localhost:3001/api/subscriptions
Headers: Authorization: Bearer YOUR_JWT_TOKEN
```

#### Subscription Management
```bash
# Pause subscription
POST http://localhost:3001/api/subscriptions/SUBSCRIPTION_ID/pause

# Resume subscription
POST http://localhost:3001/api/subscriptions/SUBSCRIPTION_ID/resume

# Cancel subscription
DELETE http://localhost:3001/api/subscriptions/SUBSCRIPTION_ID
```

#### Create Spontaneous Delivery
```bash
POST http://localhost:3001/api/subscriptions/SUBSCRIPTION_ID/spontaneous
Headers:
  Content-Type: application/json
  Authorization: Bearer YOUR_JWT_TOKEN

Body:
{
  "requestedDate": "2024-10-15T00:00:00.000Z",
  "deliveryNotes": "Rush delivery for special event"
}
```

## 🎯 Test Scenarios for Demo Day

### Scenario 1: Melbourne Customer Weekly Flowers
```json
{
  "productId": "cm26goh240000r2c5xbpv7xj5",
  "subscriptionType": "RECURRING_WEEKLY",
  "shippingAddress": {
    "firstName": "Sarah",
    "lastName": "Wilson",
    "street1": "456 Chapel Street",
    "city": "South Yarra",
    "state": "VIC",
    "zipCode": "3141",
    "phone": "+61-3-9555-7890"
  },
  "deliveryType": "STANDARD",
  "deliveryNotes": "Apartment 12B - ring buzzer"
}
```

### Scenario 2: Express Delivery to Melbourne CBD
```json
{
  "productId": "cm26goh240000r2c5xbpv7xj5",
  "subscriptionType": "RECURRING_MONTHLY",
  "shippingAddress": {
    "firstName": "James",
    "lastName": "Chen",
    "street1": "88 Collins Street",
    "city": "Melbourne",
    "state": "VIC",
    "zipCode": "3000",
    "phone": "+61-3-9555-0123"
  },
  "deliveryType": "EXPRESS",
  "deliveryNotes": "Office delivery - Level 15"
}
```

### Scenario 3: Spontaneous Subscription
```json
{
  "productId": "cm26goh240000r2c5xbpv7xj5",
  "subscriptionType": "SPONTANEOUS",
  "shippingAddress": {
    "firstName": "Lucy",
    "lastName": "Taylor",
    "street1": "22 Brunswick Street",
    "city": "Fitzroy",
    "state": "VIC",
    "zipCode": "3065",
    "phone": "+61-3-9555-4567"
  },
  "deliveryType": "EXPRESS"
}
```

## 🚨 Error Testing

### Authentication Errors
```bash
# Missing token
curl http://localhost:3001/api/subscriptions
# Expected: {"success": false, "error": "Missing or invalid authorization header"}

# Invalid token
curl -H "Authorization: Bearer invalid_token" http://localhost:3001/api/subscriptions
# Expected: {"success": false, "error": "Invalid token"}
```

### Validation Errors
```bash
# Missing required fields
POST /api/subscriptions/from-product
Body: {"productId": "invalid"}
# Expected: 400 error with missing fields message

# Invalid postcode
curl http://localhost:3001/api/delivery/validate/1234
# Expected: {"available": false}
```

## 🔧 Troubleshooting

### Common Issues

**1. "No products found in database"**
```bash
# Solution: Reseed database
docker exec flora-backend pnpm db:seed
```

**2. "User user_1_test not found"**
```bash
# Solution: Check if database was seeded properly
docker exec flora-backend pnpm db:seed
```

**3. "Services not running"**
```bash
# Solution: Start Docker services
pnpm docker:dev:bg
pnpm docker:logs  # Check logs
```

**4. Database connection errors**
```bash
# Solution: Restart services
pnpm docker:restart-backend
```

### Verifying Test Data

```bash
# Check test users exist
npx tsx src/test/get-test-data.ts

# View database in GUI
npx prisma studio
```

## 📊 What Each Test Verifies

1. **Simplified Flow**: Inline addresses, Melbourne delivery, no auto-creation
2. **Management**: Pause, resume, update subscription operations
3. **Spontaneous**: User-triggered deliveries work correctly
4. **Order Integration**: Subscriptions create real orders through OrderService
5. **Melbourne Delivery**: Postcode validation and pricing system
6. **Error Handling**: Graceful failure with proper error messages

## 🎯 Success Criteria

**For Demo Day:**
- ✅ All 6 automated tests pass
- ✅ Melbourne delivery endpoints working
- ✅ Subscription creation with Auth0 user
- ✅ Orders created automatically for recurring subscriptions
- ✅ Email confirmations sent (via OrderService)
- ✅ Pause/resume/cancel functionality working

## 🔄 CI/CD Integration

The automated tests can be run in GitHub Actions for continuous integration:

```yaml
# .github/workflows/test.yml
- name: Test Subscriptions
  run: |
    docker exec flora-backend pnpm test:subscriptions
```

This ensures subscription functionality works on every code push!