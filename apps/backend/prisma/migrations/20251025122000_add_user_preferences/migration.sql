-- Add user preference arrays if they are missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users'
      AND column_name = 'favoriteOccasions'
  ) THEN
    ALTER TABLE "users" ADD COLUMN "favoriteOccasions" "Occasion"[] DEFAULT ARRAY[]::"Occasion"[];
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users'
      AND column_name = 'favoriteColors'
  ) THEN
    ALTER TABLE "users" ADD COLUMN "favoriteColors" "Color"[] DEFAULT ARRAY[]::"Color"[];
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users'
      AND column_name = 'favoriteMoods'
  ) THEN
    ALTER TABLE "users" ADD COLUMN "favoriteMoods" "Mood"[] DEFAULT ARRAY[]::"Mood"[];
  END IF;
END
$$;
