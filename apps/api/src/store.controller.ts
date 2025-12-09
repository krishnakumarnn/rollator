import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';
import { serializeProduct } from './utils/product-serializer.js';

@Controller()
export class StoreController {
  constructor(private prisma: PrismaService) {}

  @Get('health')
  health() { return { ok: true }; }

  @Get('categories')
  async categories() {
    return this.prisma.category.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
  }

  @Get('products')
  async products(@Query('category') category?: string) {
    const products = await this.prisma.product.findMany({
      where: { isActive: true, ...(category ? { category: { slug: category } } : {}) },
      include: { images: true, variants: true, category: true },
      orderBy: { createdAt: 'desc' }
    });
    return products.map(serializeProduct);
  }

  @Get('products/:slug')
  async product(@Param('slug') slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: { images: true, variants: true, category: true }
    });
    if (!product) throw new NotFoundException('Product not found');
    return serializeProduct(product);
  }
}
