import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { PrismaService } from './prisma.service.js';
import { AuthService } from './auth.service.js';

@Controller('admin/categories')
export class AdminCategoriesController {
  constructor(private prisma: PrismaService, private auth: AuthService) {}

  private slugify(input: string) {
    return input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .replace(/--+/g, '-');
  }

  private parseBoolean(raw: unknown, fallback: boolean) {
    if (raw === undefined || raw === null || raw === '') return fallback;
    return ['true', '1', 'yes', 'on'].includes(String(raw).toLowerCase());
  }

  private async requireAdmin(authHeader?: string) {
    await this.auth.userFromAuthHeader(authHeader, true);
  }

  @Get()
  async list(@Headers('authorization') authHeader?: string) {
    await this.requireAdmin(authHeader);
    return this.prisma.category.findMany({ orderBy: { name: 'asc' } });
  }

  @Post()
  async create(@Headers('authorization') authHeader: string, @Body() body: any) {
    await this.requireAdmin(authHeader);
    const name = String(body.name ?? '').trim();
    if (!name) throw new BadRequestException('name is required');

    const slugInput = String(body.slug ?? '').trim();
    const slug = slugInput ? this.slugify(slugInput) : this.slugify(name);
    if (!slug) throw new BadRequestException('slug is required');

    const existing = await this.prisma.category.findUnique({ where: { slug } });
    if (existing) throw new BadRequestException('slug already exists');

    const isActive = this.parseBoolean(body.isActive, true);

    return this.prisma.category.create({
      data: { name, slug, isActive },
    });
  }

  @Put(':id')
  async update(@Param('id') id: string, @Headers('authorization') authHeader: string, @Body() body: any) {
    await this.requireAdmin(authHeader);
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');

    const name = String(body.name ?? category.name).trim() || category.name;
    const slugInput = String(body.slug ?? category.slug).trim();
    const slug = slugInput ? this.slugify(slugInput) : category.slug;

    if (slug !== category.slug) {
      const existing = await this.prisma.category.findUnique({ where: { slug } });
      if (existing && existing.id !== id) throw new BadRequestException('slug already exists');
    }

    const isActive = this.parseBoolean(body.isActive, category.isActive);

    return this.prisma.category.update({
      where: { id },
      data: { name, slug, isActive },
    });
  }

  @Delete(':id')
  async deactivate(@Param('id') id: string, @Headers('authorization') authHeader: string) {
    await this.requireAdmin(authHeader);
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');

    await this.prisma.category.update({
      where: { id },
      data: { isActive: false },
    });
    return { ok: true };
  }
}
