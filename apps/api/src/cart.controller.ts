// apps/api/src/cart.controller.ts
import { Body, Controller, Delete, Get, Headers, Param, Patch, Post } from '@nestjs/common';
import { CartService } from './cart.service.js';

@Controller('cart')
export class CartController {

  constructor(private svc: CartService) {}

  private key(h: Record<string,string>) { return h['x-guest-key'] || h['X-Guest-Key'] || ''; }

  @Get()
  async get(@Headers() headers: any) {
    return this.svc.getCart(this.key(headers));
  }

  @Post('items')
  async add(@Headers() headers: any, @Body() body: { variantId: string; quantity?: number }) {
    return this.svc.addItem(this.key(headers), body.variantId, body.quantity ?? 1);
  }

  @Patch('items/:id')
  async update(@Headers() headers: any, @Param('id') id: string, @Body() body: { quantity: number }) {
    return this.svc.updateItem(this.key(headers), id, body.quantity);
  }

  @Delete('items/:id')
  async remove(@Headers() headers: any, @Param('id') id: string) {
    return this.svc.removeItem(this.key(headers), id);
  }
}
