import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { DiscountType } from '@prisma/client';

export class CreateVoucherDto {
  @ApiProperty({ example: 'CGV50K', description: 'Mã giảm giá/Voucher' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Giảm 50K cho đơn từ 200K', description: 'Tiêu đề voucher' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ enum: DiscountType, example: 'FIXED_AMOUNT' })
  @IsEnum(DiscountType)
  discountType: DiscountType;

  @ApiProperty({ example: 50000, description: 'Giá trị giảm (Số tiền VND hoặc % từ 1-100)' })
  @IsInt()
  @Min(1)
  discountValue: number;

  @ApiProperty({ example: 200000, description: 'Giá trị đơn hàng tối thiểu (VND)' })
  @IsInt()
  @IsOptional()
  minOrderValue?: number;

  @ApiProperty({ example: '2026-12-31T23:59:59.000Z', description: 'Thời hạn sử dụng' })
  @IsString()
  @IsNotEmpty()
  expiresAt: string;
}
