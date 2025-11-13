import { z } from "zod";
import { Request, Response, NextFunction } from "express";

// Enums (aligned with Prisma)
export const purchaseTypeEnum = z.enum(["ONE_TIME", "SUBSCRIPTION"]);
export const subscriptionTypeEnum = z.enum([
  "RECURRING_WEEKLY",
  "RECURRING_BIWEEKLY",
  "RECURRING_MONTHLY",
  "RECURRING_QUARTERLY",
  "RECURRING_YEARLY",
  "SPONTANEOUS",
]);
export const deliveryTypeEnum = z.enum(["STANDARD", "EXPRESS", "SAME_DAY", "PICKUP"]);

// Complete order schema with all required fields
export const orderSchema = z
  .object({
    purchaseType: purchaseTypeEnum,

    // Either userId OR guest info must be provided
    userId: z.string().optional(),
    guestEmail: z.string().email("Invalid email format").optional(),
    guestPhone: z.string().optional(),

    subscriptionId: z.string().optional(),
    subscriptionType: subscriptionTypeEnum.optional(),

    // Required order items
    items: z
      .array(
        z.object({
          productId: z.string().min(1, "Product ID is required"),
          quantity: z.number().int().min(1, "Quantity must be at least 1"),
          priceCents: z.number().int().min(0, "Price must be non-negative"),
        })
      )
      .min(1, "At least one item is required"),

    // Required shipping address
    shippingAddress: z.object({
      firstName: z.string().min(1, "First name is required"),
      lastName: z.string().min(1, "Last name is required"),
      street1: z.string().min(1, "Street address is required"),
      street2: z.string().optional(),
      city: z.string().min(1, "City is required"),
      state: z.string().min(1, "State is required"),
      zipCode: z.string().min(1, "ZIP code is required"),
      phone: z.string().optional(),
    }),

    // Required delivery type
    deliveryType: deliveryTypeEnum,
    deliveryNotes: z.string().optional(),
    requestedDeliveryDate: z.string().datetime().optional().or(z.date().optional()),
  })
  .refine((data) => data.userId || (data.guestEmail && data.guestPhone), {
    message: "Either userId or (guestEmail + guestPhone) must be provided",
    path: ["userId"],
  })
  .refine(
    (data) => {
      // If subscription purchase, require subscription type
      if (data.purchaseType === "SUBSCRIPTION") {
        return data.subscriptionType !== undefined;
      }
      return true;
    },
    {
      message: "Subscription type is required for subscription purchases",
      path: ["subscriptionType"],
    }
  );

export const validateOrder = (req: Request, res: Response, next: NextFunction) => {
  const result = orderSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: result.error?.issues || [],
    });
  }
  next();
};
