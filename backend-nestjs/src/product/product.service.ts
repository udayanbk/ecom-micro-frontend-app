import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  getAll() {
    return this.prisma.product.findMany({
      include: {
        inventory: true,
      },
    });
  }

  getById(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        inventory: true,
      },
    });
  }
}
