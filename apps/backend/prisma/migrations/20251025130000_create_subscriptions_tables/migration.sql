-- Create subscriptions table if it is missing
CREATE TABLE IF NOT EXISTS "subscriptions" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" "SubscriptionType" NOT NULL,
  "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
  "nextDeliveryDate" TIMESTAMP(3),
  "lastDeliveryDate" TIMESTAMP(3),
  "stripeSubscriptionId" TEXT,
  "deliveryType" "DeliveryType" NOT NULL DEFAULT 'STANDARD',
  "deliveryNotes" TEXT,
  "shippingFirstName" TEXT NOT NULL,
  "shippingLastName" TEXT NOT NULL,
  "shippingStreet1" TEXT NOT NULL,
  "shippingStreet2" TEXT,
  "shippingCity" TEXT NOT NULL,
  "shippingState" TEXT NOT NULL,
  "shippingZipCode" TEXT NOT NULL,
  "shippingCountry" TEXT NOT NULL DEFAULT 'AU',
  "shippingPhone" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "subscriptions_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "subscriptions_stripeSubscriptionId_key"
  ON "subscriptions"("stripeSubscriptionId")
  WHERE "stripeSubscriptionId" IS NOT NULL;

-- Trigger to keep updatedAt in sync (only if it doesn't already exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_subscriptions_updatedAt'
  ) THEN
    CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
    RETURNS TRIGGER AS $func$
    BEGIN
      NEW."updatedAt" = NOW();
      RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql;

    CREATE TRIGGER update_subscriptions_updatedAt
      BEFORE UPDATE ON "subscriptions"
      FOR EACH ROW EXECUTE FUNCTION update_subscriptions_updated_at();
  END IF;
END
$$;

-- Create subscription_items table if it is missing
CREATE TABLE IF NOT EXISTS "subscription_items" (
  "id" TEXT NOT NULL,
  "subscriptionId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "subscription_items_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "subscription_items_subscriptionId_fkey"
    FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "subscription_items_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "products"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "subscription_items_subscriptionId_productId_key"
  ON "subscription_items"("subscriptionId","productId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_subscription_items_updatedAt'
  ) THEN
    CREATE OR REPLACE FUNCTION update_subscription_items_updated_at()
    RETURNS TRIGGER AS $func$
    BEGIN
      NEW."updatedAt" = NOW();
      RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql;

    CREATE TRIGGER update_subscription_items_updatedAt
      BEFORE UPDATE ON "subscription_items"
      FOR EACH ROW EXECUTE FUNCTION update_subscription_items_updated_at();
  END IF;
END
$$;
