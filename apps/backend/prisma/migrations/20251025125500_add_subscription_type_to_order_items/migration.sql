-- Add subscriptionType column to order_items for item-level tracking
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_items'
      AND column_name = 'subscriptionType'
  ) THEN
    ALTER TABLE "order_items"
      ADD COLUMN "subscriptionType" "SubscriptionType";
  END IF;
END
$$;
