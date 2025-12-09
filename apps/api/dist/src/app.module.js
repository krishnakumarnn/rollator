var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
// apps/api/src/app.module.ts
import { Module } from '@nestjs/common';
import { StoreController } from './store.controller.js';
import { CartController } from './cart.controller.js';
import { AuthController } from './auth.controller.js';
import { OrdersController } from './orders.controller.js';
import { AdminProductsController } from './admin-products.controller.js';
import { PrismaService } from './prisma.service.js';
import { CartService } from './cart.service.js';
import { AuthService } from './auth.service.js';
import { OrdersService } from './orders.service.js';
import { AdminCategoriesController } from './admin-categories.controller.js';
import { ExperienceController } from './experience.controller.js';
import { AdminExperienceController } from './admin-experience.controller.js';
let AppModule = class AppModule {
};
AppModule = __decorate([
    Module({
        controllers: [
            StoreController,
            CartController,
            AuthController,
            OrdersController,
            AdminProductsController,
            AdminCategoriesController,
            ExperienceController,
            AdminExperienceController,
        ],
        providers: [PrismaService, CartService, AuthService, OrdersService],
    })
], AppModule);
export { AppModule };
