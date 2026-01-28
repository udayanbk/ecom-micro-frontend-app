import { PrismaClient, ProductCategory } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

async function main() {
  const products = [
    // Pants (5 × 25 = 125 → but we cap inventory to 25 each)
    { name: 'Jeans Design 1', category: ProductCategory.PANT, price: 1200 },
    { name: 'Jeans Design 2', category: ProductCategory.PANT, price: 1300 },
    { name: 'Track Pant Design 1', category: ProductCategory.PANT, price: 900 },
    { name: 'Pajama Design 1', category: ProductCategory.PANT, price: 800 },
    { name: 'Formal Pant Design 1', category: ProductCategory.PANT, price: 1500 },

    // Shirts
    { name: 'Shirt Design 1', category: ProductCategory.SHIRT, price: 1000 },
    { name: 'Shirt Design 2', category: ProductCategory.SHIRT, price: 1100 },
    { name: 'Casual Shirt Design 1', category: ProductCategory.SHIRT, price: 900 },
    { name: 'Formal Shirt Design 1', category: ProductCategory.SHIRT, price: 1400 },
    { name: 'T-Shirt Design 1', category: ProductCategory.SHIRT, price: 700 },
  ];

  for (const p of products) {
    const product = await prisma.product.create({
      data: p,
    });

    await prisma.inventory.create({
      data: {
        productId: product.id,
        quantity: 25,
      },
    });
  }
}

main()
  .then(() => {
    console.log('🌱 Database seeded successfully');
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
