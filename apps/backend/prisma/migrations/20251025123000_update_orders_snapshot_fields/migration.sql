-- Ensure enums exist for new order fields
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PurchaseType') THEN
    CREATE TYPE "PurchaseType" AS ENUM ('ONE_TIME', 'SUBSCRIPTION');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SubscriptionType') THEN
    CREATE TYPE "SubscriptionType" AS ENUM (
      'RECURRING_WEEKLY',
      'RECURRING_BIWEEKLY',
      'RECURRING_MONTHLY',
      'RECURRING_QUARTERLY',
      'RECURRING_YEARLY',
      'SPONTANEOUS',
      'SPONTANEOUS_WEEKLY',
      'SPONTANEOUS_BIWEEKLY',
      'SPONTANEOUS_MONTHLY'
    );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SubscriptionStatus') THEN
    CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAUSED', 'CANCELLED', 'EXPIRED');
  END IF;
END
$$;

-- Relax foreign keys for guest checkout
ALTER TABLE "orders"
  ALTER COLUMN "userId" DROP NOT NULL,
  ALTER COLUMN "shippingAddressId" DROP NOT NULL;

-- Add core order metadata
ALTER TABLE "orders"
  ADD COLUMN IF NOT EXISTS "purchaseType" "PurchaseType" NOT NULL DEFAULT 'ONE_TIME',
  ADD COLUMN IF NOT EXISTS "subscriptionType" "SubscriptionType",
  ADD COLUMN IF NOT EXISTS "subscriptionId" TEXT,
  ADD COLUMN IF NOT EXISTS "guestEmail" TEXT,
  ADD COLUMN IF NOT EXISTS "guestPhone" TEXT,
  ADD COLUMN IF NOT EXISTS "requestedDeliveryDate" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "actualDeliveryDate" TIMESTAMP(3);

-- Shipping snapshot fields
ALTER TABLE "orders"
  ADD COLUMN IF NOT EXISTS "shippingFirstName" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "shippingLastName" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "shippingStreet1" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "shippingStreet2" TEXT,
  ADD COLUMN IF NOT EXISTS "shippingCity" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "shippingState" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "shippingZipCode" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "shippingCountry" TEXT NOT NULL DEFAULT 'AU',
  ADD COLUMN IF NOT EXISTS "shippingPhone" TEXT;

-- Billing snapshot fields
ALTER TABLE "orders"
  ADD COLUMN IF NOT EXISTS "billingFirstName" TEXT,
  ADD COLUMN IF NOT EXISTS "billingLastName" TEXT,
  ADD COLUMN IF NOT EXISTS "billingStreet1" TEXT,
  ADD COLUMN IF NOT EXISTS "billingStreet2" TEXT,
  ADD COLUMN IF NOT EXISTS "billingCity" TEXT,
  ADD COLUMN IF NOT EXISTS "billingState" TEXT,
  ADD COLUMN IF NOT EXISTS "billingZipCode" TEXT,
  ADD COLUMN IF NOT EXISTS "billingCountry" TEXT DEFAULT 'AU',
  ADD COLUMN IF NOT EXISTS "billingPhone" TEXT;
