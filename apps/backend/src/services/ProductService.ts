import {
  Product,
  Occasion,
  Season,
  Mood,
  Color,
  ProductType,
  PriceRange,
} from '@prisma/client';
import { prisma } from '../config/database';

export interface ProductFilters {
  occasion?: string;
  season?: string;
  mood?: string;
  color?: string;
  type?: string;
  priceRange?: string;
  inStock?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ProductsResult {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    occasions: Occasion[];
    seasons: Season[];
    moods: Mood[];
    colors: Color[];
    types: ProductType[];
    priceRanges: PriceRange[];
  };
}

export class ProductService {
  /**
   * Get products with filtering options and pagination
   */
  static async getProducts(filters: ProductFilters): Promise<ProductsResult> {
    // pagination setup
    const page = filters.page || 1;
    const limit = filters.limit || 12;
    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: any = {
      isActive: true, // Only include active products
    };

    if (filters.inStock !== undefined) {
      where.inStock = filters.inStock;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Array filters using enum values
    if (filters.occasion) {
      where.occasions = { has: filters.occasion as Occasion };
    }

    if (filters.season) {
      where.seasons = { has: filters.season as Season };
    }

    if (filters.mood) {
      where.moods = { has: filters.mood as Mood };
    }

    if (filters.color) {
      where.colors = { has: filters.color as Color };
    }

    if (filters.type) {
      where.type = filters.type as ProductType;
    }

    if (filters.priceRange) {
      where.priceRange = filters.priceRange as PriceRange;
    }

    // Get products and total count
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    // Get available filter options (for frontend dropdowns)
    const [
      occasionRecords,
      seasonRecords,
      moodRecords,
      colorRecords,
      typeRecords,
      priceRangeRecords,
    ] = (await Promise.all([
      prisma.product.findMany({
        select: { occasions: true },
        distinct: ['occasions'],
      }),
      prisma.product.findMany({
        select: { seasons: true },
        distinct: ['seasons'],
      }),
      prisma.product.findMany({
        select: { moods: true },
        distinct: ['moods'],
      }),
      prisma.product.findMany({
        select: { colors: true },
        distinct: ['colors'],
      }),
      prisma.product.findMany({
        select: { type: true },
        distinct: ['type'],
      }),
      prisma.product.findMany({
        select: { priceRange: true },
        distinct: ['priceRange'],
      }),
    ])) as [
      Array<{ occasions: Occasion[] }>,
      Array<{ seasons: Season[] }>,
      Array<{ moods: Mood[] }>,
      Array<{ colors: Color[] }>,
      Array<{ type: ProductType }>,
      Array<{ priceRange: PriceRange }>
    ];

    const occasionOptions = Array.from(
      new Set(occasionRecords.flatMap((record) => record.occasions))
    );
    const seasonOptions = Array.from(
      new Set(seasonRecords.flatMap((record) => record.seasons))
    );
    const moodOptions = Array.from(
      new Set(moodRecords.flatMap((record) => record.moods))
    );
    const colorOptions = Array.from(
      new Set(colorRecords.flatMap((record) => record.colors))
    );
    const typeOptions = typeRecords.map((record) => record.type);
    const priceRangeOptions = priceRangeRecords.map(
      (record) => record.priceRange
    );

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        occasions: occasionOptions,
        seasons: seasonOptions,
        moods: moodOptions,
        colors: colorOptions,
        types: typeOptions,
        priceRanges: priceRangeOptions,
      },
    };
  }

  /**
   * Get a single product by ID
   */
  static async getProductById(id: string): Promise<Product | null> {
    return await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });
  }

  /**
   * Get search suggestions for autocomplete
   */
  static async getSearchSuggestions(query: string): Promise<string[]> {
    const products = (await prisma.product.findMany({
      where: {
        AND: [
          { isActive: true }, // Only active products in suggestions
          {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      select: { name: true },
      take: 10,
      orderBy: { createdAt: 'desc' },
    })) as Array<{ name: string }>;

    return products.map((product) => product.name);
  }

  /**
   * Get similar products based on shared characteristics
   */
  static async getSimilarProducts(
    productId: string,
    limit: number = 4
  ): Promise<Product[]> {
    // First get the reference product
    const referenceProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!referenceProduct) {
      return [];
    }

    // Find products with similar characteristics
    const similarProducts = await prisma.product.findMany({
      where: {
        AND: [
          { id: { not: productId } }, // Exclude the reference product
          { inStock: true }, // Only in-stock products
          {
            OR: [
              { type: referenceProduct.type },
              { priceRange: referenceProduct.priceRange },
              { occasions: { hasSome: referenceProduct.occasions } },
              { colors: { hasSome: referenceProduct.colors } },
              { moods: { hasSome: referenceProduct.moods } },
            ],
          },
        ],
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return similarProducts;
  }

  /**
   * Helper method to format price from cents to dollars
   */
  static formatPrice(priceCents: number): string {
    return `$${(priceCents / 100).toFixed(2)}`;
  }

  /**
   * Helper method to get price range label
   */
  static getPriceRangeLabel(priceRange: PriceRange): string {
    const labels: Record<PriceRange, string> = {
      UNDER_25: 'Under $25',
      RANGE_25_50: '$25-$50',
      RANGE_50_75: '$50-$75',
      RANGE_75_100: '$75-$100',
      OVER_100: 'Over $100',
    };
    return labels[priceRange];
  }
}
