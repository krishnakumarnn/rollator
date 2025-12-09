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
import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';
import { bufferToDataUrl } from './utils/media.js';
let ExperienceController = class ExperienceController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMedia(key) {
        const media = await this.prisma.experienceMedia.findUnique({ where: { key } });
        if (!media)
            throw new NotFoundException('Experience media not found');
        return {
            key: media.key,
            alt: media.alt,
            dataUrl: bufferToDataUrl(media.mimeType, media.data),
            updatedAt: media.updatedAt,
        };
    }
};
__decorate([
    Get('media/:key'),
    __param(0, Param('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ExperienceController.prototype, "getMedia", null);
ExperienceController = __decorate([
    Controller('experience'),
    __metadata("design:paramtypes", [PrismaService])
], ExperienceController);
export { ExperienceController };
