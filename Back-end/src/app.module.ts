import { Controller, Get, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from './admin/admin.controller.js';
import { AuthModule } from './auth/auth.module.js';
import { CategoriesModule } from './categories/categories.controller.js';
import { OrdersModule } from './orders/orders.controller.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { PrismaService } from './prisma/prisma.service.js';
import { ProductsModule } from './products/products.controller.js';
import { PromotionsModule } from './promotions/promotions.module.js';

@Controller('health')
class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  /** GET /api/health — kiểm tra API và kết nối MySQL */
  @Get()
  async health() {
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: 'ok', database: 'connected', time: new Date().toISOString() };
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    PromotionsModule,
    CategoriesModule,
    ProductsModule,
    OrdersModule,
    AdminModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
