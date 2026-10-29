import { Transform, Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsIn, IsOptional, IsString, Matches, MaxLength, MinLength, ValidateNested } from 'class-validator';
import { PHONE_RE } from '../../auth/dto/auth.dto.js';
import { CartItemDto } from '../../promotions/promotions.controller.js';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class ShippingDto {
  @Transform(trim) @IsString() @MinLength(2, { message: 'Vui lòng nhập họ tên người nhận' }) @MaxLength(100)
  fullName: string;

  @Transform(trim) @Matches(PHONE_RE, { message: 'Số điện thoại gồm 10 chữ số, bắt đầu bằng 0' })
  phone: string;

  @Transform(trim) @IsString() @MinLength(2, { message: 'Vui lòng chọn tỉnh/thành phố' }) @MaxLength(100)
  province: string;

  @Transform(trim) @IsString() @MinLength(1, { message: 'Vui lòng nhập quận/huyện' }) @MaxLength(100)
  district: string;

  @Transform(trim) @IsString() @MinLength(5, { message: 'Vui lòng nhập địa chỉ cụ thể' }) @MaxLength(255)
  address: string;

  @IsOptional() @Transform(trim) @IsString() @MaxLength(500)
  note?: string;
}

/**
 * POST /api/orders — client CHỈ gửi sản phẩm + số lượng + thông tin nhận hàng.
 * Không nhận giá, tổng tiền hay trạng thái từ client.
 */
export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'Giỏ hàng trống' })
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items: CartItemDto[];

  @ValidateNested()
  @Type(() => ShippingDto)
  shipping: ShippingDto;

  @IsOptional()
  @IsIn(['COD'], { message: 'Hiện chỉ hỗ trợ thanh toán khi nhận hàng (COD)' })
  paymentMethod?: 'COD';
}
