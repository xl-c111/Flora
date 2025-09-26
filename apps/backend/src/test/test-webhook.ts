import crypto from "crypto";

interface StripePaymentIntent {
  id: string;
  object: "payment_intent";
  amount: number;
  currency: string;
  status: string;
  metadata: {
    orderId: string;
  };
  created: number;
}

interface StripeEvent {
  id: string;
  object: "event";
  api_version: string;
  created: number;
  data: {
    object: StripePaymentIntent;
  };
  livemode: boolean;
  pending_webhooks: number;
  request: {
    id: string;
    idempotency_key: string | null;
  };
  type: "payment_intent.succeeded";
}

// Mock Stripe webhook event for payment_intent.succeeded
function createMockStripeEvent(paymentIntentId: string): StripeEvent {
  return {
    id: "evt_test_webhook",
    object: "event",
    api_version: "2023-10-16",
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: paymentIntentId,
        object: "payment_intent",
        amount: 2999, // $29.99
        currency: "usd",
        status: "succeeded",
        metadata: {
          orderId: "test-order-webhook-123",
        },
        created: Math.floor(Date.now() / 1000),
      },
    },
    livemode: false,
    pending_webhooks: 1,
    request: {
      id: "req_test_webhook",
      idempotency_key: null,
    },
    type: "payment_intent.succeeded",
  };
}

// Generate a mock Stripe signature (for testing only)
function generateMockSignature(
  payload: StripeEvent,
  secret: string
): { signature: string; timestamp: number; payload: string } {
  const timestamp = Math.floor(Date.now() / 1000);
  const payloadStr = JSON.stringify(payload);
  const signedPayload = `${timestamp}.${payloadStr}`;
  const signature = crypto.createHmac("sha256", secret).update(signedPayload).digest("hex");

  return {
    signature: `t=${timestamp},v1=${signature}`,
    timestamp,
    payload: payloadStr,
  };
}

async function testWebhook(paymentIntentId: string): Promise<void> {
  console.log("🔗 Testing Stripe Webhook...\n");

  const mockEvent = createMockStripeEvent(paymentIntentId);
  const mockSecret = "whsec_test_mock_secret_for_testing";

  console.log("📤 Mock Event:", JSON.stringify(mockEvent, null, 2));

  // Generate mock signature
  const { signature, payload } = generateMockSignature(mockEvent, mockSecret);

  console.log("\n🔐 Mock Signature:", signature);
  console.log("📝 Payload length:", payload.length);

  try {
    // Test without signature first (should fail)
    console.log("\n🧪 Test 1: Without signature (should fail)");
    const response1 = await fetch("http://localhost:3001/api/webhooks/stripe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: payload,
    });

    const result1 = await response1.text();
    console.log("Status:", response1.status);
    console.log("Response:", result1);

    // Test with invalid signature (should fail)
    console.log("\n🧪 Test 2: With invalid signature (should fail)");
    const response2 = await fetch("http://localhost:3001/api/webhooks/stripe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "stripe-signature": "invalid_signature",
      },
      body: payload,
    });

    const result2 = await response2.text();
    console.log("Status:", response2.status);
    console.log("Response:", result2);

    console.log("\n💡 Note: Both tests above should fail - this is expected!");
    console.log("Real webhooks need valid Stripe signatures from Stripe servers.");
  } catch (error) {
    console.error("❌ Error testing webhook:", (error as Error).message);
  }
}

// Get payment intent ID from command line or use default
const paymentIntentId: string = process.argv[2] || "pi_3SBDkiPtGaCvy8Fq10W4L1tL";

console.log("💳 Using Payment Intent ID:", paymentIntentId);

testWebhook(paymentIntentId);

// pnpm test:webhook
