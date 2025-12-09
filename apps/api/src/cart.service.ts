import { Injectable, BadRequestException } from '@nestjs/common';
import Redis from 'ioredis';
import { PrismaService } from './prisma.service.js';
import { v4 as uuid } from 'uuid';

type CartItem = { id: string; variantId: string; quantity: number };
type Cart = { items: CartItem[] };

@Injectable()
export class CartService {
  private redis: Redis;

  constructor(private prisma: PrismaService) {
    const url = process.env.REDIS_URL || 'redis://localhost:6379';
    this.redis = new Redis(url);
  }

  private key(guestKey: string) { return `cart:${guestKey}`; }

  async getCart(guestKey: string) {
    if (!guestKey) throw new BadRequestException('guestKey required');
    const raw = await this.redis.get(this.key(guestKey));
    const cart: Cart = raw ? JSON.parse(raw) : { items: [] };

    // hydrate UI fields
    const variants = await this.prisma.productVariant.findMany({
      where: { id: { in: cart.items.map(i => i.variantId) } },
      include: { product: { include: { images: true } } }
    });

    const items = cart.items.map(it => {
      const v = variants.find(v => v.id === it.variantId);
      const img = v?.product?.images?.[0];
      const image =
        img && img.data
          ? `data:${img.mimeType || 'image/jpeg'};base64,${Buffer.from(img.data).toString('base64')}`
          : undefined;
      return {
        ...it,
        sku: v?.sku,
        priceCents: v?.priceCents,
        currency: v?.currency,
        stock: v?.stock,
        product: v?.product ? {
          id: v.product.id,
          name: v.product.name,
          slug: v.product.slug,
          image
        } : null
      };
    });

    const totalCents = items.reduce((s, i) => s + (i.priceCents || 0) * i.quantity, 0);
    return { items, totalCents, currency: items[0]?.currency ?? 'USD' };
  }

  private async save(guestKey: string, cart: Cart) {
    await this.redis.set(this.key(guestKey), JSON.stringify(cart), 'EX', 60 * 60 * 24 * 14); // 14 days
  }

  async addItem(guestKey: string, variantId: string, quantity = 1) {
    if (!guestKey) throw new BadRequestException('guestKey required');
    if (!variantId) throw new BadRequestException('variantId required');
    if (quantity < 1) quantity = 1;

    const raw = await this.redis.get(this.key(guestKey));
    const cart: Cart = raw ? JSON.parse(raw) : { items: [] };

    const existing = cart.items.find(i => i.variantId === variantId);
    if (existing) existing.quantity += quantity;
    else cart.items.push({ id: uuid(), variantId, quantity });

    await this.save(guestKey, cart);
    return this.getCart(guestKey);
  }

  async updateItem(guestKey: string, itemId: string, quantity: number) {
    if (quantity < 1) return this.removeItem(guestKey, itemId);
    const raw = await this.redis.get(this.key(guestKey));
    const cart: Cart = raw ? JSON.parse(raw) : { items: [] };
    const idx = cart.items.findIndex(i => i.id === itemId);
    if (idx === -1) throw new BadRequestException('item not found');
    cart.items[idx].quantity = quantity;
    await this.save(guestKey, cart);
    return this.getCart(guestKey);
  }

  async removeItem(guestKey: string, itemId: string) {
    const raw = await this.redis.get(this.key(guestKey));
    const cart: Cart = raw ? JSON.parse(raw) : { items: [] };
    const next = { items: cart.items.filter(i => i.id !== itemId) };
    await this.save(guestKey, next);
    return this.getCart(guestKey);
  }
}
