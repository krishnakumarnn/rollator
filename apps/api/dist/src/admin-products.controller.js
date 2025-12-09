var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { BadRequestException, Body, Controller, Get, Headers, NotFoundException, Param, Post, Put, UploadedFile, UseInterceptors, } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import multer from 'multer';
import { PrismaService } from './prisma.service.js';
import { AuthService } from './auth.service.js';
import { serializeProduct } from './utils/product-serializer.js';
const memoryStorage = multer.memoryStorage();
const productInclude = { images: true, variants: true, category: true };
let AdminProductsController = class AdminProductsController {
    constructor(prisma, auth) {
        this.prisma = prisma;
        this.auth = auth;
    }
    slugify(input) {
        return input
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
            .replace(/--+/g, '-');
    }
    parseBoolean(value, fallback = false) {
        if (value === undefined || value === null || value === '')
            return fallback;
        return ['true', '1', 'yes', 'on'].includes(String(value).toLowerCase());
    }
    parsePriceCents(raw, fallback) {
        if (raw === undefined || raw === null || raw === '') {
            if (fallback !== undefined)
                return fallback;
            throw new BadRequestException('price is required');
        }
        const normalized = String(raw).replace(/[^0-9.]/g, '');
        const numeric = Number.parseFloat(normalized);
        if (!Number.isFinite(numeric))
            throw new BadRequestException('price must be a number');
        return Math.max(0, Math.round(numeric * 100));
    }
    parseStock(raw, fallback = 0) {
        if (raw === undefined || raw === null || raw === '')
            return fallback;
        const numeric = Number.parseInt(String(raw), 10);
        if (!Number.isFinite(numeric))
            throw new BadRequestException('stock must be a number');
        return Math.max(0, numeric);
    }
    ensureJpeg(file, required = false) {
        if (!file) {
            if (required)
                throw new BadRequestException('Image (jpeg) is required');
            return;
        }
        if (!file.mimetype?.includes('jpeg')) {
            throw new BadRequestException('Only JPEG images are supported');
        }
    }
    async requireAdmin(authHeader) {
        await this.auth.userFromAuthHeader(authHeader, true);
    }
    parseSpecifications(raw, current) {
        if (raw === undefined || raw === null || raw === '')
            return current ?? null;
        if (typeof raw === 'string') {
            try {
                return JSON.parse(raw);
            }
            catch {
                throw new BadRequestException('specifications must be valid JSON');
            }
        }
        return raw;
    }
    async getProduct(id, authHeader) {
        await this.requireAdmin(authHeader);
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: { images: true, variants: true, category: true },
        });
        if (!product)
            throw new NotFoundException('Product not found');
        return serializeProduct(product);
    }
    async createProduct(authHeader, image, body) {
        await this.requireAdmin(authHeader);
        this.ensureJpeg(image, true);
        const upload = image;
        const name = String(body.name ?? '').trim();
        if (!name)
            throw new BadRequestException('name is required');
        const categoryId = String(body.categoryId ?? '').trim();
        if (!categoryId)
            throw new BadRequestException('categoryId is required');
        const slugInput = String(body.slug ?? '').trim();
        const slug = slugInput ? this.slugify(slugInput) : this.slugify(name);
        if (!slug)
            throw new BadRequestException('slug is required');
        const existingSlug = await this.prisma.product.findUnique({ where: { slug } });
        if (existingSlug)
            throw new BadRequestException('Slug already exists');
        const priceCents = this.parsePriceCents(body.price ?? body.priceCents);
        const stock = this.parseStock(body.stock, 0);
        const skuInput = String(body.sku ?? '').trim();
        const sku = skuInput ||
            slug
                .replace(/[^a-z0-9]/gi, '')
                .toUpperCase()
                .slice(0, 16) ||
            `SKU-${Date.now()}`;
        const specifications = this.parseSpecifications(body.specifications);
        const isActive = this.parseBoolean(body.isActive, true);
        const product = await this.prisma.product.create({
            data: {
                name,
                slug,
                description: body.description ?? null,
                specifications,
                isActive,
                category: { connect: { id: categoryId } },
                images: {
                    create: {
                        fileName: upload.originalname || `${slug}.jpg`,
                        mimeType: 'image/jpeg',
                        data: upload.buffer,
                        alt: body.imageAlt ?? name,
                        pos: 0,
                    },
                },
                variants: {
                    create: {
                        sku,
                        priceCents,
                        currency: 'USD',
                        stock,
                    },
                },
            },
            include: productInclude,
        });
        return serializeProduct(product);
    }
    async updateProduct(id, authHeader, image, body) {
        await this.requireAdmin(authHeader);
        this.ensureJpeg(image, false);
        const existing = await this.prisma.product.findUnique({
            where: { id },
            include: productInclude,
        });
        if (!existing)
            throw new NotFoundException('Product not found');
        const name = String(body.name ?? existing.name).trim() || existing.name;
        const slugInput = String(body.slug ?? existing.slug).trim();
        const slug = slugInput ? this.slugify(slugInput) : existing.slug;
        if (slug !== existing.slug) {
            const existingSlug = await this.prisma.product.findUnique({ where: { slug } });
            if (existingSlug && existingSlug.id !== id)
                throw new BadRequestException('Slug already exists');
        }
        const categoryId = String(body.categoryId ?? existing.categoryId ?? '').trim() || existing.categoryId;
        if (!categoryId)
            throw new BadRequestException('categoryId is required');
        const currentVariant = existing.variants[0] ?? null;
        const priceCents = this.parsePriceCents(body.price ?? body.priceCents, currentVariant?.priceCents ?? 0);
        const stock = this.parseStock(body.stock, currentVariant?.stock ?? 0);
        const skuInput = String(body.sku ?? currentVariant?.sku ?? '').trim();
        const sku = skuInput ||
            slug
                .replace(/[^a-z0-9]/gi, '')
                .toUpperCase()
                .slice(0, 16) ||
            `SKU-${Date.now()}`;
        const isActive = this.parseBoolean(body.isActive, existing.isActive);
        const specifications = this.parseSpecifications(body.specifications, existing.specifications);
        const description = body.description !== undefined ? body.description : existing.description;
        const imageAlt = body.imageAlt ?? (existing.images[0]?.alt ?? name);
        const updated = await this.prisma.$transaction(async (tx) => {
            const base = await tx.product.update({
                where: { id },
                data: {
                    name,
                    slug,
                    description,
                    specifications,
                    isActive,
                    category: { connect: { id: categoryId } },
                },
                include: { variants: true, images: true, category: true },
            });
            const existingVariant = base.variants[0];
            if (existingVariant) {
                await tx.productVariant.update({
                    where: { id: existingVariant.id },
                    data: { priceCents, stock, sku, currency: existingVariant.currency || 'USD' },
                });
            }
            else {
                await tx.productVariant.create({
                    data: {
                        productId: id,
                        priceCents,
                        stock,
                        sku,
                        currency: 'USD',
                    },
                });
            }
            if (image) {
                await tx.productImage.deleteMany({ where: { productId: id } });
                await tx.productImage.create({
                    data: {
                        productId: id,
                        fileName: image.originalname || `${slug}.jpg`,
                        mimeType: 'image/jpeg',
                        data: image.buffer,
                        alt: imageAlt,
                        pos: 0,
                    },
                });
            }
            else if (base.images[0]) {
                await tx.productImage.update({
                    where: { id: base.images[0].id },
                    data: { alt: imageAlt },
                });
            }
            return tx.product.findUnique({
                where: { id },
                include: productInclude,
            });
        });
        if (!updated)
            throw new NotFoundException('Product not found after update');
        return serializeProduct(updated);
    }
};
__decorate([
    Get(':id'),
    __param(0, Param('id')),
    __param(1, Headers('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminProductsController.prototype, "getProduct", null);
__decorate([
    Post(),
    UseInterceptors(FileInterceptor('image', { storage: memoryStorage, limits: { fileSize: 8 * 1024 * 1024 } })),
    __param(0, Headers('authorization')),
    __param(1, UploadedFile()),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminProductsController.prototype, "createProduct", null);
__decorate([
    Put(':id'),
    UseInterceptors(FileInterceptor('image', { storage: memoryStorage, limits: { fileSize: 8 * 1024 * 1024 } })),
    __param(0, Param('id')),
    __param(1, Headers('authorization')),
    __param(2, UploadedFile()),
    __param(3, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminProductsController.prototype, "updateProduct", null);
AdminProductsController = __decorate([
    Controller('admin/products'),
    __metadata("design:paramtypes", [PrismaService, AuthService])
], AdminProductsController);
export { AdminProductsController };
