const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateAllStock() {
  try {
    // Update all products to have stock
    const result = await prisma.product.updateMany({
      where: {
        OR: [
          { stockCount: { lt: 10 } },
          { inStock: false }
        ]
      },
      data: {
        inStock: true,
        stockCount: 100,
      },
    });
    
    console.log(`✅ Updated ${result.count} products to have stock of 100`);
    
    // Show all products with their stock
    const products = await prisma.product.findMany({
      select: {
        name: true,
        stockCount: true,
        inStock: true,
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    console.log('\n📦 Current inventory:');
    products.forEach(p => {
      console.log(`  ${p.inStock ? '✓' : '✗'} ${p.name}: ${p.stockCount} units`);
    });
  } catch (error) {
    console.error('❌ Error updating stock:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateAllStock();
