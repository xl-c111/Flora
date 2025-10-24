-- Add missing isActive flag to products for alignment with schema.prisma
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;
