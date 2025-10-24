-- Create delivery_zones table if missing
CREATE TABLE IF NOT EXISTS "delivery_zones" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "zipCodes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "cities" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "standardCostCents" INTEGER NOT NULL,
  "expressCostCents" INTEGER,
  "sameDayCostCents" INTEGER,
  "standardDeliveryDays" INTEGER NOT NULL DEFAULT 5,
  "expressDeliveryDays" INTEGER NOT NULL DEFAULT 2,
  "sameDayAvailable" BOOLEAN NOT NULL DEFAULT false,
  "sameDayCutoffHour" INTEGER,
  "freeDeliveryThreshold" INTEGER,
  "weekendDelivery" BOOLEAN NOT NULL DEFAULT false,
  "holidayDelivery" BOOLEAN NOT NULL DEFAULT false,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "delivery_zones_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "delivery_zones_name_key" ON "delivery_zones"("name");

-- Create delivery_windows table if missing
CREATE TABLE IF NOT EXISTS "delivery_windows" (
  "id" TEXT NOT NULL,
  "zoneId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "startTime" TEXT NOT NULL,
  "endTime" TEXT NOT NULL,
  "additionalCostCents" INTEGER NOT NULL DEFAULT 0,
  "isAvailable" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "delivery_windows_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "delivery_windows_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "delivery_zones"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
