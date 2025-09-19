import {
  PrismaClient,
  Occasion,
  Season,
  Mood,
  Color,
  ProductType,
  PriceRange,
} from '@prisma/client';

const prisma = new PrismaClient();

const sampleProducts = [
  {
    name: 'Red Rose Bouquet',
    description: 'Classic red roses perfect for romantic occasions',
    priceCents: 4599, // $45.99
    priceRange: PriceRange.RANGE_25_50,
    imageUrl: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=400',
    stockCount: 25,
    occasions: [Occasion.VALENTINES_DAY, Occasion.ANNIVERSARY],
    seasons: [Season.ALL_SEASON],
    moods: [Mood.ROMANTIC],
    colors: [Color.RED],
    type: ProductType.BOUQUET,
  },
  {
    name: 'Spring Tulip Arrangement',
    description: 'Beautiful mixed tulips in a ceramic vase',
    priceCents: 3250, // $32.50
    priceRange: PriceRange.RANGE_25_50,
    imageUrl:
      'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=400',
    stockCount: 18,
    occasions: [Occasion.MOTHERS_DAY, Occasion.BIRTHDAY, Occasion.JUST_BECAUSE],
    seasons: [Season.SPRING],
    moods: [Mood.CHEERFUL, Mood.VIBRANT],
    colors: [Color.MIXED, Color.PASTEL],
    type: ProductType.TULIP,
  },
  {
    name: 'White Orchid Plant',
    description: 'Elegant white orchid in decorative pot',
    priceCents: 6800, // $68.00
    priceRange: PriceRange.RANGE_50_75,
    imageUrl:
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    stockCount: 12,
    occasions: [Occasion.CONGRATULATIONS, Occasion.JUST_BECAUSE],
    seasons: [Season.ALL_SEASON],
    moods: [Mood.ELEGANT, Mood.SOPHISTICATED],
    colors: [Color.WHITE],
    type: ProductType.ORCHID,
  },
  {
    name: 'Sunflower Happiness Bouquet',
    description: 'Bright sunflowers to bring joy and warmth',
    priceCents: 3875, // $38.75
    priceRange: PriceRange.RANGE_25_50,
    imageUrl:
      'https://images.unsplash.com/photo-1597848212624-e8717d946f37?w=400',
    stockCount: 22,
    occasions: [
      Occasion.GET_WELL_SOON,
      Occasion.CONGRATULATIONS,
      Occasion.BIRTHDAY,
    ],
    seasons: [Season.SUMMER, Season.FALL],
    moods: [Mood.CHEERFUL, Mood.VIBRANT],
    colors: [Color.YELLOW],
    type: ProductType.SUNFLOWER,
  },
  {
    name: 'Succulent Garden',
    description: 'Mix of beautiful succulents in a modern planter',
    priceCents: 2399, // $23.99
    priceRange: PriceRange.UNDER_25,
    imageUrl:
      'https://images.unsplash.com/photo-1519336056116-bc0f1771dec8?w=400',
    stockCount: 30,
    occasions: [Occasion.JUST_BECAUSE],
    seasons: [Season.ALL_SEASON],
    moods: [Mood.PEACEFUL, Mood.SOPHISTICATED],
    colors: [Color.GREEN],
    type: ProductType.SUCCULENT,
  },
  {
    name: 'Pink Lily Arrangement',
    description: 'Graceful pink lilies in an elegant vase',
    priceCents: 5500, // $55.00
    priceRange: PriceRange.RANGE_50_75,
    imageUrl:
      'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=400',
    stockCount: 15,
    occasions: [Occasion.MOTHERS_DAY, Occasion.SYMPATHY, Occasion.ANNIVERSARY],
    seasons: [Season.SPRING, Season.SUMMER],
    moods: [Mood.ELEGANT, Mood.PEACEFUL],
    colors: [Color.PINK],
    type: ProductType.LILY,
  },
  {
    name: 'Premium Mixed Bouquet',
    description: 'Luxurious arrangement with premium seasonal flowers',
    priceCents: 12500, // $125.00
    priceRange: PriceRange.OVER_100,
    imageUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400',
    stockCount: 8,
    occasions: [Occasion.WEDDING, Occasion.ANNIVERSARY, Occasion.GRADUATION],
    seasons: [Season.ALL_SEASON],
    moods: [Mood.SOPHISTICATED, Mood.ELEGANT],
    colors: [Color.MIXED],
    type: ProductType.MIXED_FLOWERS,
  },
  {
    name: 'Peace Plant',
    description: 'Low-maintenance peace lily plant',
    priceCents: 4250, // $42.50
    priceRange: PriceRange.RANGE_25_50,
    imageUrl:
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
    stockCount: 20,
    occasions: [Occasion.SYMPATHY, Occasion.JUST_BECAUSE],
    seasons: [Season.ALL_SEASON],
    moods: [Mood.PEACEFUL, Mood.ELEGANT],
    colors: [Color.WHITE, Color.GREEN],
    type: ProductType.PLANT,
  },
];

const categories = [
  {
    name: 'Bouquets',
    description: 'Hand-crafted flower bouquets for any occasion',
    imageUrl: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=400',
  },
  {
    name: 'Plants',
    description: 'Beautiful plants for home and office',
    imageUrl:
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
  },
  {
    name: 'Arrangements',
    description: 'Elegant flower arrangements in vases',
    imageUrl:
      'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=400',
  },
  {
    name: 'Seasonal',
    description: 'Seasonal flowers and plants',
    imageUrl:
      'https://images.unsplash.com/photo-1597848212624-e8717d946f37?w=400',
  },
];

const collections = [
  {
    name: 'Bundle Up and Save',
    description: 'Get more for less with our curated bundles',
    imageUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400',
    discountPercent: 15,
  },
  {
    name: "Valentine's Special",
    description: "Romantic flowers perfect for Valentine's Day",
    imageUrl: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=400',
    discountPercent: 10,
  },
];

async function main() {
  console.log('🌸 Starting to seed Flora database...');

  // Clear existing data (only tables that exist)
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // Create categories
  console.log('📂 Creating categories...');
  for (const category of categories) {
    await prisma.category.create({
      data: category,
    });
  }

  // Create products
  console.log('🌺 Creating products...');
  for (const product of sampleProducts) {
    await prisma.product.create({
      data: product,
    });
  }

  console.log('✅ Seeding completed successfully!');
  console.log(
    `📊 Created ${categories.length} categories and ${sampleProducts.length} products`
  );
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
