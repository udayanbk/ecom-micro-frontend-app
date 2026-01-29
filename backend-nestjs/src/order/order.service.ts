import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async checkout(userId: string) {
    console.log('Starting checkout for user-1:', userId);
    return this.prisma.$transaction(async (tx) => {
      // Load cart with product & inventory
      const cart = await tx.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  inventory: true,
                },
              },
            },
          },
        },
      });
      console.log('Cart loaded for checkout');
      if (!cart || cart.items.length === 0) {
        throw new BadRequestException('Cart is empty');
      }

      let total = 0;

      // Validate stock + calculate total
      console.log('Validating stock and calculating total in for loop');
      for (const item of cart.items) {
        const inventory = item.product.inventory;

        if (!inventory) {
          console.log('Inventory missing for product:', item.productId);
          throw new BadRequestException(
            `Inventory missing for ${item.product.name}`,
          );
        }

        if (inventory.quantity < item.quantity) {
          console.log('Insufficient stock for product:', item.productId);
          throw new BadRequestException(
            `Insufficient stock for ${item.product.name}`,
          );
        }

        total += item.quantity * item.product.price;
      }

      // Decrement inventory atomically
      console.log('Decrementing inventory for cart items');
      for (const item of cart.items) {
        const updated = await tx.inventory.updateMany({
          where: {
            productId: item.productId,
            quantity: {
              gte: item.quantity,
            },
          },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });
        console.log('Inventory updated for product:', item.productId);
        console.log('Rows affected:', updated.count);
        if (updated.count === 0) {
          console.log('Stock changed while checking out for ', item.productId);
          throw new BadRequestException(
            `Stock changed while checking out for ${item.product.name}`,
          );
        }
      }

      // Create order
      const order = await tx.order.create({
        data: {
          userId,
          total,
          items: {
            create: cart.items.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
              price: i.product.price,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return order;
    });
  }
}
