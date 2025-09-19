import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";

export const stockCheckMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.body.items && Array.isArray(req.body.items)) {
      for (const item of req.body.items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });

        if (!product || !product.inStock) {
          return res.status(400).json({
            success: false,
            error: `Product ${product?.name || item.productId} is sold out`,
          });
        }

        if (product.stockCount < item.quantity) {
          return res.status(400).json({
            success: false,
            error: `Product ${product.name} has insufficient stock, only ${product.stockCount} left`,
          });
        }
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};
