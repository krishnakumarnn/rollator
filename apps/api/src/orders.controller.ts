import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import { OrdersService } from './orders.service.js';
import { AuthService } from './auth.service.js';

@Controller('orders')
export class OrdersController {
  constructor(private orders: OrdersService, private auth: AuthService) {}

  private key(h: Record<string, string>) {
    return h['x-guest-key'] || (h['X-Guest-Key'] as any) || '';
  }

  // guest checkout
  @Post()
  async create(@Headers() headers: Record<string, string>, @Body() body: any) {
    const authHeader = headers?.authorization || (headers?.Authorization as any);
    const user = await this.auth.userFromAuthHeader(authHeader);
    return this.orders.createOrderFromCart(this.key(headers), body, user);
  }

  // simple admin reads
  @Get()
  async list(@Headers('authorization') authHeader?: string) {
    await this.auth.userFromAuthHeader(authHeader, true);
    return this.orders.listOrders();
  }

  @Get('mine')
  async mine(@Headers('authorization') authHeader?: string) {
    const user = await this.auth.userFromAuthHeader(authHeader);
    return this.orders.listOrdersForUser(user.id, user.email);
  }

  @Get(':id')
  async one(@Param('id') id: string, @Headers('authorization') authHeader?: string) {
    await this.auth.userFromAuthHeader(authHeader, true);
    return this.orders.getOrder(id);
  }

  @Post(':id/approve')
  async approve(@Param('id') id: string, @Headers('authorization') authHeader?: string) {
    await this.auth.userFromAuthHeader(authHeader, true);
    return this.orders.approveOrder(id);
  }
}
