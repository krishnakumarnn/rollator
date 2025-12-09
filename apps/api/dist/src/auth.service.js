var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
// apps/api/src/auth.service.ts
import { Injectable, BadRequestException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaService } from './prisma.service.js';
let AuthService = AuthService_1 = class AuthService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    normalizeEmail(email) {
        return email?.trim().toLowerCase();
    }
    jwtSecret() {
        const secret = process.env.JWT_SECRET;
        if (secret)
            return secret;
        if (process.env.NODE_ENV !== 'production') {
            if (!AuthService_1.warned) {
                console.warn('[auth] JWT_SECRET not set – using local fallback. Set JWT_SECRET for non-dev environments.');
                AuthService_1.warned = true;
            }
            return 'development-only-secret';
        }
        throw new Error('JWT_SECRET not set');
    }
    async register(email, password) {
        const normalizedEmail = this.normalizeEmail(email);
        const existing = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (existing)
            throw new BadRequestException('Email already registered');
        const passwordHash = await bcrypt.hash(password, 10);
        const user = await this.prisma.user.create({
            data: { email: normalizedEmail, passwordHash },
            select: { id: true, email: true, createdAt: true, isAdmin: true },
        });
        const token = jwt.sign({ sub: user.id, email: user.email }, this.jwtSecret(), { expiresIn: '7d' });
        return { token, user };
    }
    async login(email, password) {
        const normalizedEmail = this.normalizeEmail(email);
        const user = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (!user)
            throw new UnauthorizedException('Invalid credentials');
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok)
            throw new UnauthorizedException('Invalid credentials');
        const payload = { sub: user.id, email: user.email };
        const token = jwt.sign(payload, this.jwtSecret(), { expiresIn: '7d' });
        const { passwordHash, ...safe } = user;
        return { token, user: safe };
    }
    verifyTokenOrThrow(token) {
        try {
            return jwt.verify(token, this.jwtSecret());
        }
        catch {
            throw new UnauthorizedException('Invalid token');
        }
    }
    async userFromAuthHeader(authHeader, requireAdmin = false) {
        if (!authHeader || !authHeader.startsWith('Bearer '))
            throw new UnauthorizedException('Missing token');
        const token = authHeader.slice('Bearer '.length).trim();
        const payload = this.verifyTokenOrThrow(token);
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            select: { id: true, email: true, createdAt: true, isAdmin: true },
        });
        if (!user)
            throw new UnauthorizedException('User not found');
        if (requireAdmin && !user.isAdmin)
            throw new ForbiddenException('Admin access required');
        return user;
    }
    async meFromAuthHeader(authHeader) {
        return this.userFromAuthHeader(authHeader, false);
    }
};
AuthService.warned = false;
AuthService = AuthService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], AuthService);
export { AuthService };
