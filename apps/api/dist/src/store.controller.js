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
import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';
import { serializeProduct } from './utils/product-serializer.js';
let StoreController = class StoreController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    health() { return { ok: true }; }
    async categories() {
        return this.prisma.category.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
    }
    async products(category) {
        const products = await this.prisma.product.findMany({
            where: { isActive: true, ...(category ? { category: { slug: category } } : {}) },
            include: { images: true, variants: true, category: true },
            orderBy: { createdAt: 'desc' }
        });
        return products.map(serializeProduct);
    }
    async product(slug) {
        const product = await this.prisma.product.findUnique({
            where: { slug },
            include: { images: true, variants: true, category: true }
        });
        if (!product)
            throw new NotFoundException('Product not found');
        return serializeProduct(product);
    }
};
__decorate([
    Get('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StoreController.prototype, "health", null);
__decorate([
    Get('categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StoreController.prototype, "categories", null);
__decorate([
    Get('products'),
    __param(0, Query('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StoreController.prototype, "products", null);
__decorate([
    Get('products/:slug'),
    __param(0, Param('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StoreController.prototype, "product", null);
StoreController = __decorate([
    Controller(),
    __metadata("design:paramtypes", [PrismaService])
], StoreController);
export { StoreController };
