import { Injectable, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from './prisma.service.js';
import { CartService } from './cart.service.js';

type CheckoutPayload = {
  email?: string;
  shipping?: any; // { fullName, line1, line2, city, region, postalCode, country, phone }
  billing?: any;
};

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private cart: CartService,
  ) {}

  async createOrderFromCart(
    guestKey: string,
    body: CheckoutPayload,
    user?: { id: string; email: string },
  ) {
    if (!guestKey) throw new BadRequestException('Missing x-guest-key');
    if (!user) throw new UnauthorizedException('Sign in required to place an order');

    const normalizedPayloadEmail = String(body.email ?? '').trim().toLowerCase();
    const normalizedUserEmail = String(user.email ?? '').trim().toLowerCase();
    if (normalizedPayloadEmail && normalizedPayloadEmail !== normalizedUserEmail) {
      throw new BadRequestException('Checkout email must match your account email');
    }
    const email = normalizedUserEmail;

    // 1) Load current cart (from Redis via your CartService)
    const c = await this.cart.getCart(guestKey);
    if (!c || !c.items || c.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // 2) Validate each item against DB and compute total from trusted prices
    const itemsData = await Promise.all(
      c.items.map(async (it: any) => {
        const variant = await this.prisma.productVariant.findUnique({
          where: { id: it.variantId },
          include: { product: true },
        });
        if (!variant) throw new BadRequestException(`Variant not found: ${it.variantId}`);

        const quantity = Math.max(1, Math.min(99, Number(it.quantity || 1)));
        const priceCents = variant.priceCents;
        const sku = variant.sku;
        const nameSnapshot = variant.product.name;

        const image = await this.prisma.productImage.findFirst({
          where: { productId: variant.productId },
          orderBy: { pos: 'asc' },
          select: { data: true, mimeType: true }
        });

        return {
          productId: variant.productId,
          productVariantId: variant.id,
          sku,
          priceCents,
          quantity,
          nameSnapshot,
          imageData: image?.data ?? null,
          imageMime: image?.mimeType ?? null,
        };
      })
    );

    const totalCents = itemsData.reduce((sum, it) => sum + it.priceCents * it.quantity, 0);

    // 3) Create Order + OrderItems
    const order = await this.prisma.order.create({
      data: {
        guestKey,
        email,
        status: 'PENDING',
        totalCents,
        currency: 'USD',
        userId: user?.id ?? null,
        shipping: body.shipping ?? null,
        billing: body.billing ?? null,
        items: {
          create: itemsData.map(it => ({
            productId: it.productId,
            productVariantId: it.productVariantId,
            sku: it.sku,
            priceCents: it.priceCents,
            quantity: it.quantity,
            nameSnapshot: it.nameSnapshot,
            imageData: it.imageData ?? undefined,
            imageMime: it.imageMime ?? undefined,
          }))
        }
      },
      include: { items: true }
    });

    // TODO later: decrement stock, clear cart, handle payment, etc.
    return { id: order.id, status: order.status, totalCents: order.totalCents, currency: order.currency };
  }

  // --- simple admin helpers
  async listOrders() {
    return this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, status: true, totalCents: true, currency: true, createdAt: true }
    });
  }

  async getOrder(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
  }

  async listOrdersForUser(userId: string, email: string) {
    const normalizedEmail = String(email ?? '').trim().toLowerCase();
    const where: Prisma.OrderWhereInput = {
      OR: [{ userId }, ...(normalizedEmail ? [{ email: normalizedEmail }] : [])],
    };
    return this.prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        totalCents: true,
        currency: true,
        createdAt: true,
        items: {
          select: {
            id: true,
            nameSnapshot: true,
            quantity: true,
            priceCents: true,
          },
        },
      },
    });
  }

  async approveOrder(id: string) {
    const existing = await this.prisma.order.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
    if (!existing) throw new NotFoundException('Order not found');
    if (existing.status !== 'PENDING') {
      throw new BadRequestException('Only pending orders can be approved');
    }
    return this.prisma.order.update({
      where: { id },
      data: { status: 'APPROVED' },
      select: { id: true, status: true, updatedAt: true },
    });
  }
}
