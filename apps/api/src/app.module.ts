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

@Module({
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
export class AppModule {}
