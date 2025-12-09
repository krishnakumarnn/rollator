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
import { BadRequestException, Body, Controller, Get, Headers, Param, Put, UploadedFile, UseInterceptors, } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import multer from 'multer';
import { PrismaService } from './prisma.service.js';
import { AuthService } from './auth.service.js';
import { bufferToDataUrl, ensureImageIsAllowed } from './utils/media.js';
const memoryStorage = multer.memoryStorage();
let AdminExperienceController = class AdminExperienceController {
    constructor(prisma, auth) {
        this.prisma = prisma;
        this.auth = auth;
    }
    normalizeKey(raw) {
        return raw.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '') || 'default';
    }
    async requireAdmin(authHeader) {
        await this.auth.userFromAuthHeader(authHeader, true);
    }
    async get(key, authHeader) {
        await this.requireAdmin(authHeader);
        const media = await this.prisma.experienceMedia.findUnique({ where: { key } });
        if (!media)
            throw new BadRequestException('Media not found');
        return {
            key: media.key,
            alt: media.alt,
            dataUrl: bufferToDataUrl(media.mimeType, media.data),
            updatedAt: media.updatedAt,
        };
    }
    async upload(key, authHeader, image, alt) {
        await this.requireAdmin(authHeader);
        try {
            ensureImageIsAllowed(image);
        }
        catch (err) {
            throw new BadRequestException(err?.message || 'Invalid image');
        }
        const normalizedKey = this.normalizeKey(key);
        const fileName = image?.originalname || `${normalizedKey}.jpg`;
        const mimeType = image?.mimetype || 'image/jpeg';
        const buffer = image?.buffer;
        if (!buffer)
            throw new BadRequestException('Image data missing');
        const record = await this.prisma.experienceMedia.upsert({
            where: { key: normalizedKey },
            update: {
                fileName,
                mimeType,
                data: buffer,
                alt: alt?.trim() || null,
            },
            create: {
                key: normalizedKey,
                fileName,
                mimeType,
                data: buffer,
                alt: alt?.trim() || null,
            },
        });
        return {
            key: record.key,
            alt: record.alt,
            dataUrl: bufferToDataUrl(record.mimeType, record.data),
            updatedAt: record.updatedAt,
        };
    }
};
__decorate([
    Get('media/:key'),
    __param(0, Param('key')),
    __param(1, Headers('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminExperienceController.prototype, "get", null);
__decorate([
    Put('media/:key'),
    UseInterceptors(FileInterceptor('image', {
        storage: memoryStorage,
        limits: { fileSize: 5 * 1024 * 1024 },
    })),
    __param(0, Param('key')),
    __param(1, Headers('authorization')),
    __param(2, UploadedFile()),
    __param(3, Body('alt')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, String]),
    __metadata("design:returntype", Promise)
], AdminExperienceController.prototype, "upload", null);
AdminExperienceController = __decorate([
    Controller('admin/experience'),
    __metadata("design:paramtypes", [PrismaService, AuthService])
], AdminExperienceController);
export { AdminExperienceController };
