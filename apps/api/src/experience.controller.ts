import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';
import { bufferToDataUrl } from './utils/media.js';

@Controller('experience')
export class ExperienceController {
  constructor(private prisma: PrismaService) {}

  @Get('media/:key')
  async getMedia(@Param('key') key: string) {
    const media = await this.prisma.experienceMedia.findUnique({ where: { key } });
    if (!media) throw new NotFoundException('Experience media not found');
    return {
      key: media.key,
      alt: media.alt,
      dataUrl: bufferToDataUrl(media.mimeType, media.data),
      updatedAt: media.updatedAt,
    };
  }
}
