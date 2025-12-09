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
// src/admin.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';
let AdminController = class AdminController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createProduct(body) {
        const product = await this.prisma.product.create({
            data: {
                name: body.name,
                slug: body.slug,
                description: body.description ?? null,
                categoryId: body.categoryId,
                images: { createMany: { data: body.images.map(i => ({ url: i.url, alt: i.alt ?? null, pos: i.pos ?? 0 })) } },
                variants: { create: [{ sku: `SKU-${Date.now()}`, priceCents: body.priceCents, stock: body.stock ?? 10 }] },
            },
            include: { images: true, variants: true },
        });
        return product;
    }
};
__decorate([
    Post('products'),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createProduct", null);
AdminController = __decorate([
    Controller('admin'),
    __metadata("design:paramtypes", [PrismaService])
], AdminController);
export { AdminController };
