-- Create delivery tracking table if it does not already exist
CREATE TABLE IF NOT EXISTS "delivery_tracking" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "trackingNumber" TEXT,
  "carrierName" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PREPARING',
  "currentLocation" TEXT,
  "estimatedDelivery" TIMESTAMP(3),
  "actualDelivery" TIMESTAMP(3),
  "deliveredTo" TEXT,
  "deliveryNotes" TEXT,
  "deliveryPhoto" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "delivery_tracking_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "delivery_tracking_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "orders"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "delivery_tracking_orderId_key" ON "delivery_tracking"("orderId");
CREATE UNIQUE INDEX IF NOT EXISTS "delivery_tracking_trackingNumber_key" ON "delivery_tracking"("trackingNumber");

-- Create tracking events table if it does not already exist
CREATE TABLE IF NOT EXISTS "tracking_events" (
  "id" TEXT NOT NULL,
  "trackingId" TEXT NOT NULL,
  "timestamp" TIMESTAMP(3) NOT NULL,
  "location" TEXT,
  "status" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "isCustomerVisible" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "tracking_events_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "tracking_events_trackingId_fkey"
    FOREIGN KEY ("trackingId") REFERENCES "delivery_tracking"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "tracking_events_trackingId_idx" ON "tracking_events"("trackingId");
