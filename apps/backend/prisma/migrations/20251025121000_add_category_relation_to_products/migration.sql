-- Ensure products table has categoryId column and foreign key
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products'
      AND column_name = 'categoryId'
  ) THEN
    ALTER TABLE "products" ADD COLUMN "categoryId" TEXT;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'products'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND kcu.column_name = 'categoryId'
  ) THEN
    ALTER TABLE "products"
    ADD CONSTRAINT "products_categoryId_fkey"
      FOREIGN KEY ("categoryId")
      REFERENCES "categories"("id")
      ON DELETE SET NULL
      ON UPDATE CASCADE;
  END IF;
END
$$;
