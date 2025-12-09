// apps/api/src/auth.service.ts
import { Injectable, BadRequestException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaService } from './prisma.service.js';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  private normalizeEmail(email: string) {
    return email?.trim().toLowerCase();
  }

  private static warned = false;

  private jwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (secret) return secret;
    if (process.env.NODE_ENV !== 'production') {
      if (!AuthService.warned) {
        console.warn('[auth] JWT_SECRET not set – using local fallback. Set JWT_SECRET for non-dev environments.');
        AuthService.warned = true;
      }
      return 'development-only-secret';
    }
    throw new Error('JWT_SECRET not set');
  }

  async register(email: string, password: string) {
    const normalizedEmail = this.normalizeEmail(email);
    const existing = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) throw new BadRequestException('Email already registered');

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: { email: normalizedEmail, passwordHash },
      select: { id: true, email: true, createdAt: true, isAdmin: true },
    });

    const token = jwt.sign({ sub: user.id, email: user.email }, this.jwtSecret(), { expiresIn: '7d' });
    return { token, user };
  }

  async login(email: string, password: string) {
    const normalizedEmail = this.normalizeEmail(email);
    const user = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, email: user.email };
    const token = jwt.sign(payload, this.jwtSecret(), { expiresIn: '7d' });

    const { passwordHash, ...safe } = user;
    return { token, user: safe };
  }

  verifyTokenOrThrow(token: string) {
    try {
      return jwt.verify(token, this.jwtSecret()) as { sub: string; email: string; iat: number; exp: number };
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async userFromAuthHeader(authHeader?: string, requireAdmin = false) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) throw new UnauthorizedException('Missing token');
    const token = authHeader.slice('Bearer '.length).trim();
    const payload = this.verifyTokenOrThrow(token);
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, createdAt: true, isAdmin: true },
    });
    if (!user) throw new UnauthorizedException('User not found');
    if (requireAdmin && !user.isAdmin) throw new ForbiddenException('Admin access required');
    return user;
  }

  async meFromAuthHeader(authHeader?: string) {
    return this.userFromAuthHeader(authHeader, false);
  }
}
