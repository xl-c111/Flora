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
export const deliveryTypeEnum = z.enum(["STANDARD", "EXPRESS", "SAME_DAY"]);

// SubscriptionItem schema
export const subscriptionItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1").default(1),
});

// Subscription schema
export const subscriptionSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  type: subscriptionTypeEnum,

  status: subscriptionStatusEnum.optional(), // default is ACTIVE
  frequency: z.number().int().positive().optional(),
  nextDeliveryDate: z.coerce.date().optional(),
  lastDeliveryDate: z.coerce.date().optional(),

  deliveryType: deliveryTypeEnum.optional(), // default is STANDARD
  addressId: z.string().min(1, "Address ID is required"),
  deliveryNotes: z.string().optional(),

  items: z.array(subscriptionItemSchema).min(1, "At least one subscription item is required"),
});

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
