import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

console.log('Seed script starting...');

const placeholderJpeg = '/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxISEhUQEhMVFhUVFRUVFRUVFRUVFRUWFxUVFhUYHSggGBolHRUVITEiJSkrLi4uFx8zODMsNygtLisBCgoKDg0OGhAQFy0dHR0tKy0rLS0rNystKy0tLS0tKysrKystLS03Ky03LS0rLS0tLSstNy0rNy0tLS0tLS0tLf/AABEIAMIBAwMBIgACEQEDEQH/xAAbAAEAAgMBAQAAAAAAAAAAAAAABQYBBAcDAv/EADQQAAEDAQYEBQQBBQAAAAAAAAEAAgMEBRESITEGQRNRYXGBIhQjMqGxwfAUI1JicoL/xAAZAQEAAwEBAAAAAAAAAAAAAAAAAgMEAQX/xAAjEQABAwQCAQUAAAAAAAAAAAABAAIREiEDMUEEEyJRYXGB/9oADAMBAAIRAxEAPwD5fEOKt2bZqSeK6FQMqxTkn6n/2Q==';
const sampleBase64 = {
  headphones: placeholderJpeg,
  speaker: placeholderJpeg,
} as const;

const sampleJpegs: Record<string, Buffer> = Object.fromEntries(
  Object.entries(sampleBase64).map(([key, value]) => [key, Buffer.from(value, 'base64')])
);


async function main() {
  const cat1 = await prisma.category.upsert({
    where: { slug: 'electronics' },
    update: {},
    create: { name: 'Electronics', slug: 'electronics' }
  });

  await prisma.product.upsert({
    where: { slug: 'wireless-headphones' },
    update: {
      name: 'Wireless Headphones',
      description: 'Noise-cancelling over-ear headphones.',
      specifications: { battery: '30h', bluetooth: '5.3' },
      categoryId: cat1.id,
      images: {
        deleteMany: {},
        create: [{
          fileName: 'wireless-headphones.jpg',
          mimeType: 'image/jpeg',
          data: sampleJpegs.headphones,
          alt: 'Wireless headphones resting on a table',
          pos: 0,
        }]
      },
      variants: {
        upsert: {
          where: { sku: 'HP-001' },
          update: { priceCents: 12999, currency: 'USD', stock: 25 },
          create: { sku: 'HP-001', priceCents: 12999, currency: 'USD', stock: 25 },
        }
      },
    },
    create: {
      name: 'Wireless Headphones',
      slug: 'wireless-headphones',
      description: 'Noise-cancelling over-ear headphones.',
      specifications: { battery: '30h', bluetooth: '5.3' },
      categoryId: cat1.id,
      images: {
        create: [{
          fileName: 'wireless-headphones.jpg',
          mimeType: 'image/jpeg',
          data: sampleJpegs.headphones,
          alt: 'Wireless headphones resting on a table',
          pos: 0,
        }]
      },
      variants: { create: [{ sku: 'HP-001', priceCents: 12999, currency: 'USD', stock: 25 }] }
    }
  });

  await prisma.product.upsert({
    where: { slug: 'smart-speaker' },
    update: {
      name: 'Smart Speaker',
      description: 'Voice assistant home speaker.',
      specifications: { mic: 'Far-field' },
      categoryId: cat1.id,
      images: {
        deleteMany: {},
        create: [{
          fileName: 'smart-speaker.jpg',
          mimeType: 'image/jpeg',
          data: sampleJpegs.speaker,
          alt: 'Minimal smart speaker with ambient lighting',
          pos: 0,
        }]
      },
      variants: {
        upsert: {
          where: { sku: 'SP-001' },
          update: { priceCents: 5999, currency: 'USD', stock: 50 },
          create: { sku: 'SP-001', priceCents: 5999, currency: 'USD', stock: 50 },
        }
      },
    },
    create: {
      name: 'Smart Speaker',
      slug: 'smart-speaker',
      description: 'Voice assistant home speaker.',
      specifications: { mic: 'Far-field' },
      categoryId: cat1.id,
      images: {
        create: [{
          fileName: 'smart-speaker.jpg',
          mimeType: 'image/jpeg',
          data: sampleJpegs.speaker,
          alt: 'Minimal smart speaker with ambient lighting',
          pos: 0,
        }]
      },
      variants: { create: [{ sku: 'SP-001', priceCents: 5999, currency: 'USD', stock: 50 }] }
    }
  });

  const adminEmail = 'admin@rollator.test';
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash: adminPasswordHash, isAdmin: true },
    create: { email: adminEmail, passwordHash: adminPasswordHash, isAdmin: true }
  });

  console.log('Seeded products.');
}

main()
  .catch((err) => {
    console.error('Seed failed', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
