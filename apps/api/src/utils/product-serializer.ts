// apps/api/src/utils/product-serializer.ts
import type { Prisma } from '@prisma/client';

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: { images: true; variants: true; category: true };
}>;

const toDataUrl = (image: ProductWithRelations['images'][number]) =>
  `data:${image.mimeType || 'image/jpeg'};base64,${Buffer.from(image.data).toString('base64')}`;

export function serializeProduct(product: ProductWithRelations) {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    specifications: product.specifications,
    isActive: product.isActive,
    createdAt: product.createdAt,
    category: product.category
      ? {
          id: product.category.id,
          name: product.category.name,
          slug: product.category.slug,
        }
      : null,
    images: [...product.images]
      .sort((a, b) => a.pos - b.pos)
      .map((image) => ({
        id: image.id,
        alt: image.alt,
        pos: image.pos,
        mimeType: image.mimeType,
        dataUrl: toDataUrl(image),
      })),
    variants: product.variants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      priceCents: variant.priceCents,
      currency: variant.currency,
      stock: variant.stock,
    })),
  };
}
