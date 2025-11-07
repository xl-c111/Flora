import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";

export const stockCheckMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.body.items && Array.isArray(req.body.items)) {
      for (const item of req.body.items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true, isActive: true, inStock: true, stockCount: true },
        });

        const label = product?.name || item.productId;

        if (!product || product.isActive === false) {
          return res.status(400).json({ success: false, error: `Product ${label} is not available` });
        }

        if (!product.inStock) {
          return res.status(400).json({ success: false, error: `Product ${label} is out of stock` });
        }

        if (product.stockCount < item.quantity) {
          return res.status(400).json({ success: false, error: `Product ${label} has only ${product.stockCount} left` });
        }
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};
