import { z } from "zod";
import { Request, Response, NextFunction } from "express";

// Enums aligned with Prisma
export const userRoleEnum = z.enum(["CUSTOMER", "ADMIN"]);
export const occasionEnum = z.enum([
  "BIRTHDAY",
  "ANNIVERSARY",
  "GRADUATION",
  "WEDDING",
  "VALENTINE",
  "MOTHERS_DAY",
  "OTHERS",
]);
export const colorEnum = z.enum(["RED", "PINK", "WHITE", "YELLOW", "PURPLE", "BLUE", "ORANGE", "MIXED"]);
export const moodEnum = z.enum(["ROMANTIC", "CHEERFUL", "ELEGANT", "LUXURIOUS", "SYMPATHETIC", "JOYFUL", "CALM"]);

// User schema
export const userSchema = z.object({
  email: z.string().email("Invalid email format"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  role: userRoleEnum.optional(), // default is CUSTOMER

  favoriteOccasions: z.array(occasionEnum).optional(),
  favoriteColors: z.array(colorEnum).optional(),
  favoriteMoods: z.array(moodEnum).optional(),
});

export const validateUser = (req: Request, res: Response, next: NextFunction) => {
  const result = userSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: "Invalid user information",
      details: result.error.errors,
    });
  }
  next();
};
