import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class ProductInputDto {
  @Transform(trim) @IsString() @MinLength(1, { message: 'Mã sản phẩm không được để trống' }) @MaxLength(50)
  code: string;

  @Transform(trim) @IsString() @MinLength(1, { message: 'Tên sản phẩm không được để trống' }) @MaxLength(255)
  name: string;

  @IsInt({ message: 'Vui lòng chọn danh mục' })
  categoryId: number;

  @Transform(trim) @IsString() @MinLength(1, { message: 'Vui lòng nhập thương hiệu' }) @MaxLength(100)
  brand: string;

  @IsInt({ message: 'Giá bán phải là số nguyên (VNĐ)' }) @Min(1, { message: 'Giá bán phải lớn hơn 0' }) @Max(2_000_000_000)
  price: number;

  @IsInt({ message: 'Tồn kho phải là số nguyên' }) @Min(0, { message: 'Tồn kho phải >= 0' })
  stock: number;

  @IsInt() @Min(0) @Max(120)
  warrantyMonths: number;

  @IsArray() @IsString({ each: true })
  images: string[];

  @IsArray() @IsString({ each: true })
  highlights: string[];

  @IsString() @MaxLength(10000)
  description: string;

  @IsObject()
  specs: Record<string, string>;

  @IsObject()
  attributes: Record<string, string>;

  @IsOptional() @IsString() @MaxLength(500)
  compatibilityNote?: string;
}

export class StockDto {
  @IsInt({ message: 'Tồn kho phải là số nguyên' }) @Min(0, { message: 'Tồn kho phải >= 0' })
  stock: number;
}

export class CategoryInputDto {
  @Transform(trim) @IsString() @MinLength(1, { message: 'Tên danh mục không được để trống' }) @MaxLength(100)
  name: string;

  @IsOptional() @IsInt()
  parentId: number | null;

  @IsOptional() @IsString() @MaxLength(500)
  description = '';
}

export class OrderStatusDto {
  @IsIn(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING', 'COMPLETED', 'CANCELLED'])
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED';

  @IsOptional() @Transform(trim) @IsString() @MaxLength(500)
  note?: string;
}

export class PaymentStatusDto {
  @IsIn(['UNPAID', 'PAID', 'REFUNDED'])
  paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED';
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export class PromotionInputDto {
  @Transform(trim) @IsString() @MinLength(1) @MaxLength(150)
  name: string;

  @IsInt() @Min(0) @Max(99)
  value: number;

  @IsInt() @Min(0)
  minOrderValue: number;

  @Matches(DATE_RE) startDate: string;
  @Matches(DATE_RE) endDate: string;

  @IsBoolean()
  isActive: boolean;

  @IsArray() @IsInt({ each: true }) @Type(() => Number)
  productIds: number[];

  @IsOptional() @IsString() @MaxLength(500)
  description?: string;

  @IsOptional() @IsArray() @IsString({ each: true })
  conditions?: string[];
}

export class SettingsDto {
  @IsInt({ message: 'Phí vận chuyển phải là số nguyên' }) @Min(0)
  baseShippingFee: number;
}
