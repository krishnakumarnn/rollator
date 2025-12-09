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
import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import { OrdersService } from './orders.service.js';
import { AuthService } from './auth.service.js';
let OrdersController = class OrdersController {
    constructor(orders, auth) {
        this.orders = orders;
        this.auth = auth;
    }
    key(h) {
        return h['x-guest-key'] || h['X-Guest-Key'] || '';
    }
    // guest checkout
    async create(headers, body) {
        const authHeader = headers?.authorization || headers?.Authorization;
        const user = await this.auth.userFromAuthHeader(authHeader);
        return this.orders.createOrderFromCart(this.key(headers), body, user);
    }
    // simple admin reads
    async list(authHeader) {
        await this.auth.userFromAuthHeader(authHeader, true);
        return this.orders.listOrders();
    }
    async mine(authHeader) {
        const user = await this.auth.userFromAuthHeader(authHeader);
        return this.orders.listOrdersForUser(user.id, user.email);
    }
    async one(id, authHeader) {
        await this.auth.userFromAuthHeader(authHeader, true);
        return this.orders.getOrder(id);
    }
    async approve(id, authHeader) {
        await this.auth.userFromAuthHeader(authHeader, true);
        return this.orders.approveOrder(id);
    }
};
__decorate([
    Post(),
    __param(0, Headers()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "create", null);
__decorate([
    Get(),
    __param(0, Headers('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "list", null);
__decorate([
    Get('mine'),
    __param(0, Headers('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "mine", null);
__decorate([
    Get(':id'),
    __param(0, Param('id')),
    __param(1, Headers('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "one", null);
__decorate([
    Post(':id/approve'),
    __param(0, Param('id')),
    __param(1, Headers('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "approve", null);
OrdersController = __decorate([
    Controller('orders'),
    __metadata("design:paramtypes", [OrdersService, AuthService])
], OrdersController);
export { OrdersController };
