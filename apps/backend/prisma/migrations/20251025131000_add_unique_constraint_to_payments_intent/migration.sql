-- Drop legacy partial index created earlier so we can add a true UNIQUE constraint
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'payments_stripePaymentIntentId_key'
      AND n.nspname = 'public'
      AND c.relkind = 'i'
  ) THEN
    DROP INDEX IF EXISTS "public"."payments_stripePaymentIntentId_key";
  END IF;
END
$$;

-- Add the UNIQUE constraint that Prisma expects for upsert
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'payments_stripePaymentIntentId_unique'
  ) THEN
    ALTER TABLE "payments"
      ADD CONSTRAINT "payments_stripePaymentIntentId_unique"
      UNIQUE ("stripePaymentIntentId");
  END IF;
END
$$;
