import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import multer from 'multer';
import { PrismaService } from './prisma.service.js';
import { AuthService } from './auth.service.js';
import { bufferToDataUrl, ensureImageIsAllowed } from './utils/media.js';

const memoryStorage = multer.memoryStorage();

@Controller('admin/experience')
export class AdminExperienceController {
  constructor(private prisma: PrismaService, private auth: AuthService) {}

  private normalizeKey(raw: string) {
    return raw.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '') || 'default';
  }

  private async requireAdmin(authHeader?: string) {
    await this.auth.userFromAuthHeader(authHeader, true);
  }

  @Get('media/:key')
  async get(@Param('key') key: string, @Headers('authorization') authHeader?: string) {
    await this.requireAdmin(authHeader);
    const media = await this.prisma.experienceMedia.findUnique({ where: { key } });
    if (!media) throw new BadRequestException('Media not found');
    return {
      key: media.key,
      alt: media.alt,
      dataUrl: bufferToDataUrl(media.mimeType, media.data),
      updatedAt: media.updatedAt,
    };
  }

  @Put('media/:key')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage,
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async upload(
    @Param('key') key: string,
    @Headers('authorization') authHeader: string,
    @UploadedFile() image: Express.Multer.File | undefined,
    @Body('alt') alt?: string,
  ) {
    await this.requireAdmin(authHeader);
    try {
      ensureImageIsAllowed(image);
    } catch (err: any) {
      throw new BadRequestException(err?.message || 'Invalid image');
    }

    const normalizedKey = this.normalizeKey(key);
    const fileName = image?.originalname || `${normalizedKey}.jpg`;
    const mimeType = image?.mimetype || 'image/jpeg';
    const buffer = image?.buffer;
    if (!buffer) throw new BadRequestException('Image data missing');

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
}
