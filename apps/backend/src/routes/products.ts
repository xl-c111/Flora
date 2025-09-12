import express from 'express';
import { prisma } from '../index';
import { Occasion, Season, Mood, Color, ProductType, PriceRange } from '@prisma/client';

const router = express.Router();

// GET /api/products - Get all products with optional filtering
router.get('/', async (req, res) => {
  try {
    const {
      occasion,
      season,
      mood,
      color,
      type,
      priceRange,
      inStock,
      search,
      page = '1',
      limit = '12'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build filter conditions
    const where: any = {};

    if (occasion && Object.values(Occasion).includes(occasion as Occasion)) {
      where.occasions = { has: occasion as Occasion };
    }

    if (season && Object.values(Season).includes(season as Season)) {
      where.seasons = { has: season as Season };
    }

    if (mood && Object.values(Mood).includes(mood as Mood)) {
      where.moods = { has: mood as Mood };
    }

    if (color && Object.values(Color).includes(color as Color)) {
      where.colors = { has: color as Color };
    }

    if (type && Object.values(ProductType).includes(type as ProductType)) {
      where.type = type as ProductType;
    }

    if (priceRange && Object.values(PriceRange).includes(priceRange as PriceRange)) {
      where.priceRange = priceRange as PriceRange;
    }

    if (inStock !== undefined) {
      where.inStock = inStock === 'true';
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    // Get products with pagination
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/products/:id - Get a single product
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// GET /api/products/filters/options - Get all filter options
router.get('/filters/options', async (req, res) => {
  try {
    res.json({
      occasions: Object.values(Occasion),
      seasons: Object.values(Season),
      moods: Object.values(Mood),
      colors: Object.values(Color),
      types: Object.values(ProductType),
      priceRanges: Object.values(PriceRange)
    });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({ error: 'Failed to fetch filter options' });
  }
});

export default router;