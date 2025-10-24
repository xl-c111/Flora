-- Create payments table if it is missing
CREATE TABLE IF NOT EXISTS "payments" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "amountCents" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "stripePaymentIntentId" TEXT,
  "stripePaymentMethodId" TEXT,
  "status" TEXT NOT NULL,
  "paidAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "payments_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "payments_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "orders"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "payments_stripePaymentIntentId_key"
  ON "payments"("stripePaymentIntentId")
  WHERE "stripePaymentIntentId" IS NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_payments_updatedAt'
  ) THEN
    CREATE OR REPLACE FUNCTION update_payments_updated_at()
    RETURNS TRIGGER AS $func$
    BEGIN
      NEW."updatedAt" = NOW();
      RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql;

    CREATE TRIGGER update_payments_updatedAt
      BEFORE UPDATE ON "payments"
      FOR EACH ROW EXECUTE FUNCTION update_payments_updated_at();
  END IF;
END
$$;
