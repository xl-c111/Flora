# 💻 How to Use Stripe CLI

## 1. Automatic Start (Recommended)

```bash
# Starts all containers including Stripe CLI
pnpm docker:dev:build
```

## 2. Check if Stripe CLI is Working

```bash
# View Stripe CLI logs
docker logs flora-stripe-cli

# Should show something like:
# > Ready! Your webhook signing secret is whsec_xxx
# > Forwarding events to http://backend:3001/api/webhooks/stripe
```

## 3. Test Webhook Events

### Step 1: start backend and stripe-cli container in Terminal 1

```bash
docker start flora-backend flora-stripe-cli
```

### Step 2: watch backend logs in Terminal 1

```bash
Watch Backend Logs
```

### Step 3: Start Stripe CLI Listener in Terminal 2
```bash
docker exec -it flora-stripe-cli stripe listen --forward-to http://backend:3001/api/webhooks/stripe
```

### Step 4: Trigger Test Events in Terminal 3

```bash
# Trigger a test payment event
docker exec -it flora-stripe-cli stripe trigger payment_intent.succeeded
# Trigger other events
docker exec -it flora-stripe-cli stripe trigger payment_intent.payment_failed
docker exec -it flora-stripe-cli stripe trigger invoice.payment_succeeded
```

### Step 5.(optinal) Monitor Webhook Activities through Stripe CLI container logs in Termimal 4

```bash
# Watch both Stripe CLI and backend logs
docker logs -f flora-stripe-cli
```


