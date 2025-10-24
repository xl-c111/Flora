-- Allow nullable first/last names to align with current Prisma schema
ALTER TABLE "users"
  ALTER COLUMN "firstName" DROP NOT NULL,
  ALTER COLUMN "lastName" DROP NOT NULL;
