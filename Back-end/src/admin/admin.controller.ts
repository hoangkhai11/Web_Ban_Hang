import { Body, Controller, Delete, Get, Module, Param, ParseIntPipe, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, Roles, RolesGuard } from '../auth/guards.js';
import { AdminService } from './admin.service.js';
import {
  CategoryInputDto,
  OrderStatusDto,
  PaymentStatusDto,
  ProductInputDto,
  PromotionInputDto,
  SettingsDto,
  StockDto,
} from './dto/admin.dto.js';

/** Toàn bộ API quản trị: bắt buộc đăng nhập + vai trò ADMIN (kiểm tra ở server). */
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('dashboard')
  dashboard() {
    return this.admin.dashboard();
  }

  // ----- Sản phẩm -----
  @Get('products')
  products() {
    return this.admin.listProducts();
  }
  @Get('products/:id')
  product(@Param('id', ParseIntPipe) id: number) {
    return this.admin.getProduct(id);
  }
  @Post('products')
  createProduct(@Body() dto: ProductInputDto) {
    return this.admin.createProduct(dto);
  }
  @Put('products/:id')
  updateProduct(@Param('id', ParseIntPipe) id: number, @Body() dto: ProductInputDto) {
    return this.admin.updateProduct(id, dto);
  }
  @Delete('products/:id')
  deleteProduct(@Param('id', ParseIntPipe) id: number) {
    return this.admin.deleteProduct(id);
  }

  // ----- Tồn kho -----
  @Patch('inventory/:id')
  stock(@Param('id', ParseIntPipe) id: number, @Body() dto: StockDto) {
    return this.admin.updateStock(id, dto.stock);
  }

  // ----- Danh mục -----
  @Get('categories')
  categories() {
    return this.admin.listCategories();
  }
  @Post('categories')
  createCategory(@Body() dto: CategoryInputDto) {
    return this.admin.createCategory(dto);
  }
  @Put('categories/:id')
  updateCategory(@Param('id', ParseIntPipe) id: number, @Body() dto: CategoryInputDto) {
    return this.admin.updateCategory(id, dto);
  }
  @Delete('categories/:id')
  deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.admin.deleteCategory(id);
  }

  // ----- Đơn hàng -----
  @Get('orders')
  orders(@Query('status') status?: string) {
    return this.admin.listOrders(status);
  }
  @Get('orders/:code')
  order(@Param('code') code: string) {
    return this.admin.getOrder(code);
  }
  @Patch('orders/:code/status')
  status(@Param('code') code: string, @Body() dto: OrderStatusDto) {
    return this.admin.updateOrderStatus(code, dto.status, dto.note);
  }
  @Patch('orders/:code/payment')
  payment(@Param('code') code: string, @Body() dto: PaymentStatusDto) {
    return this.admin.updatePaymentStatus(code, dto.paymentStatus);
  }

  // ----- Nâng cao -----
  @Get('customers')
  customers() {
    return this.admin.listCustomers();
  }
  @Get('promotions')
  promotions() {
    return this.admin.promotionSettings();
  }
  @Put('promotions/:id')
  updatePromotion(@Param('id', ParseIntPipe) id: number, @Body() dto: PromotionInputDto) {
    return this.admin.updatePromotion(id, dto);
  }
  @Put('settings')
  settings(@Body() dto: SettingsDto) {
    return this.admin.updateSettings(dto.baseShippingFee);
  }
}

@Module({
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
