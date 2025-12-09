-- AlterTable: add admin flag to users
ALTER TABLE "User" ADD COLUMN "isAdmin" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable: rehome product images into the database
ALTER TABLE "ProductImage"
  ADD COLUMN "fileName" TEXT NOT NULL DEFAULT 'legacy-image.jpg',
  ADD COLUMN "mimeType" TEXT NOT NULL DEFAULT 'image/jpeg',
  ADD COLUMN "data" BYTEA NOT NULL DEFAULT decode('/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxISEhUQEhMVFhUVFRUVFRUVFRUVFRUWFxUVFhUYHSggGBolHRUVITEiJSkrLi4uFx8zODMsNygtLisBCgoKDg0OGhAQFy0dHR0tKy0rLS0rNystKy0tLS0tKysrKystLS03Ky03LS0rLS0tLSstNy0rNy0tLS0tLS0tLf/AABEIAMIBAwMBIgACEQEDEQH/xAAbAAEAAgMBAQAAAAAAAAAAAAAABQYBBAcDAv/EADQQAAEDAQYEBQQBBQAAAAAAAAEAAgMEBRESITEGQRNRYXGBIhQjMqGxwfAUI1JicoL/xAAZAQEAAwEBAAAAAAAAAAAAAAAAAgMEAQX/xAAjEQABAwQCAQUAAAAAAAAAAAABAAIREiEDMUEEEyJRYXGB/9oADAMBAAIRAxEAPwD5fEOKt2bZqSeK6FQMqxTkn6n/2Q==', 'base64'),
  ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Drop the old URL column now that binary data is stored locally
ALTER TABLE "ProductImage" DROP COLUMN "url";

-- Give each legacy image a distinct filename to avoid clashes
UPDATE "ProductImage"
SET "fileName" = concat('legacy-', "id", '.jpg')
WHERE "fileName" = 'legacy-image.jpg';

-- Remove transitional defaults that are not part of the Prisma schema
ALTER TABLE "ProductImage" ALTER COLUMN "fileName" DROP DEFAULT;
ALTER TABLE "ProductImage" ALTER COLUMN "data" DROP DEFAULT;

-- Order items should embed the image snapshot alongside metadata
ALTER TABLE "OrderItem"
  ADD COLUMN "imageData" BYTEA,
  ADD COLUMN "imageMime" TEXT,
  DROP COLUMN "imageUrl";
