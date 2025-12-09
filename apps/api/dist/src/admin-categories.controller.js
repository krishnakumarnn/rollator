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
import { BadRequestException, Body, Controller, Delete, Get, Headers, NotFoundException, Param, Post, Put, } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';
import { AuthService } from './auth.service.js';
let AdminCategoriesController = class AdminCategoriesController {
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
    parseBoolean(raw, fallback) {
        if (raw === undefined || raw === null || raw === '')
            return fallback;
        return ['true', '1', 'yes', 'on'].includes(String(raw).toLowerCase());
    }
    async requireAdmin(authHeader) {
        await this.auth.userFromAuthHeader(authHeader, true);
    }
    async list(authHeader) {
        await this.requireAdmin(authHeader);
        return this.prisma.category.findMany({ orderBy: { name: 'asc' } });
    }
    async create(authHeader, body) {
        await this.requireAdmin(authHeader);
        const name = String(body.name ?? '').trim();
        if (!name)
            throw new BadRequestException('name is required');
        const slugInput = String(body.slug ?? '').trim();
        const slug = slugInput ? this.slugify(slugInput) : this.slugify(name);
        if (!slug)
            throw new BadRequestException('slug is required');
        const existing = await this.prisma.category.findUnique({ where: { slug } });
        if (existing)
            throw new BadRequestException('slug already exists');
        const isActive = this.parseBoolean(body.isActive, true);
        return this.prisma.category.create({
            data: { name, slug, isActive },
        });
    }
    async update(id, authHeader, body) {
        await this.requireAdmin(authHeader);
        const category = await this.prisma.category.findUnique({ where: { id } });
        if (!category)
            throw new NotFoundException('Category not found');
        const name = String(body.name ?? category.name).trim() || category.name;
        const slugInput = String(body.slug ?? category.slug).trim();
        const slug = slugInput ? this.slugify(slugInput) : category.slug;
        if (slug !== category.slug) {
            const existing = await this.prisma.category.findUnique({ where: { slug } });
            if (existing && existing.id !== id)
                throw new BadRequestException('slug already exists');
        }
        const isActive = this.parseBoolean(body.isActive, category.isActive);
        return this.prisma.category.update({
            where: { id },
            data: { name, slug, isActive },
        });
    }
    async deactivate(id, authHeader) {
        await this.requireAdmin(authHeader);
        const category = await this.prisma.category.findUnique({ where: { id } });
        if (!category)
            throw new NotFoundException('Category not found');
        await this.prisma.category.update({
            where: { id },
            data: { isActive: false },
        });
        return { ok: true };
    }
};
__decorate([
    Get(),
    __param(0, Headers('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminCategoriesController.prototype, "list", null);
__decorate([
    Post(),
    __param(0, Headers('authorization')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminCategoriesController.prototype, "create", null);
__decorate([
    Put(':id'),
    __param(0, Param('id')),
    __param(1, Headers('authorization')),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AdminCategoriesController.prototype, "update", null);
__decorate([
    Delete(':id'),
    __param(0, Param('id')),
    __param(1, Headers('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminCategoriesController.prototype, "deactivate", null);
AdminCategoriesController = __decorate([
    Controller('admin/categories'),
    __metadata("design:paramtypes", [PrismaService, AuthService])
], AdminCategoriesController);
export { AdminCategoriesController };
