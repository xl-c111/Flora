-- Add requestedDeliveryDate column to order_items if it is missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_items'
      AND column_name = 'requestedDeliveryDate'
  ) THEN
    ALTER TABLE "order_items"
      ADD COLUMN "requestedDeliveryDate" TIMESTAMP(3);
  END IF;
END
$$;
