import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsInt, Max, Min, ValidateNested } from 'class-validator';
import { PromotionsService } from './promotions.service.js';

export class CartItemDto {
  @IsInt()
  @Min(1)
  productId: number;

  @IsInt({ message: 'Số lượng phải là số nguyên' })
  @Min(1, { message: 'Số lượng tối thiểu là 1' })
  @Max(10, { message: 'Tối đa 10 sản phẩm mỗi loại' })
  quantity: number;
}

export class QuoteDto {
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items: CartItemDto[];
}

@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotions: PromotionsService) {}

  /** GET /api/promotions — chương trình + điều kiện + sản phẩm áp dụng */
  @Get()
  list() {
    return this.promotions.list();
  }

  /** GET /api/promotions/pricing-context — dữ liệu để FE hiển thị giá giảm trên thẻ sản phẩm */
  @Get('pricing-context')
  context() {
    return this.promotions.getPricingContext();
  }

  /** POST /api/promotions/quote — tính tạm tính, giảm giá, phí vận chuyển, tổng tiền */
  @Post('quote')
  @HttpCode(200)
  quote(@Body() dto: QuoteDto) {
    return this.promotions.quote(dto.items);
  }
}
