import { z } from "zod";
import { Request, Response, NextFunction } from "express";

// Enums (aligned with Prisma)
export const subscriptionTypeEnum = z.enum([
  "RECURRING_WEEKLY",
  "RECURRING_BIWEEKLY",
  "RECURRING_MONTHLY",
  "RECURRING_QUARTERLY",
  "RECURRING_YEARLY",
  "SPONTANEOUS",
]);

export const subscriptionStatusEnum = z.enum(["ACTIVE", "PAUSED", "CANCELLED"]);
export const deliveryTypeEnum = z.enum(["STANDARD", "EXPRESS", "SAME_DAY", "PICKUP"]);

// SubscriptionItem schema
export const subscriptionItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1").default(1),
});

// Subscription creation schema - for API requests
// Note: userId is added by the controller from auth, not from request body
export const subscriptionSchema = z.object({
  type: subscriptionTypeEnum,
  addressId: z.string().min(1, "Address ID is required"),
  deliveryType: deliveryTypeEnum.optional(), // default is STANDARD
  deliveryNotes: z.string().optional(),
  items: z.array(subscriptionItemSchema).min(1, "At least one subscription item is required"),
});

// For learning: We don't validate userId, status, or delivery dates in the request
// because these are set by the system, not the user

export const validateSubscription = (req: Request, res: Response, next: NextFunction) => {
  const result = subscriptionSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: "Invalid subscription information",
      details: result.error.errors,
    });
  }
  next();
};
