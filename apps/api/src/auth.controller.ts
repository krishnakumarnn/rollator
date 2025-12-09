// apps/api/src/auth.controller.ts
import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterDto, LoginDto } from './dto/auth.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  async register(@Body() body: RegisterDto) {
    return this.auth.register(body.email, body.password);
  }

  @Post('login')
  async login(@Body() body: LoginDto) {
    return this.auth.login(body.email, body.password);
  }

  @Get('me')
  async me(@Headers('authorization') authHeader?: string) {
    const user = await this.auth.meFromAuthHeader(authHeader);
    return { user };
  }
}
