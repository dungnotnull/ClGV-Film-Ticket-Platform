import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ComboOrderItemDto {
  @ApiProperty({ example: 'cmb_01' })
  @IsString()
  @IsNotEmpty()
  comboId: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CheckoutBookingDto {
  @ApiProperty({ example: 'res_99812', description: 'Mã giữ chỗ trước đó' })
  @IsString()
  @IsOptional()
  reservationId?: string;

  @ApiProperty({ example: 'st_456', description: 'ID suất chiếu' })
  @IsString()
  @IsNotEmpty()
  showtimeId: string;

  @ApiProperty({ example: ['H12', 'H13'], description: 'Danh sách mã ghế' })
  @IsArray()
  @IsString({ each: true })
  seatIds: string[];

  @ApiProperty({ example: 'VNPAY', description: 'Phương thức thanh toán: VNPAY hoặc CGV_CARD' })
  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  @ApiProperty({ type: [ComboOrderItemDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ComboOrderItemDto)
  comboIds?: ComboOrderItemDto[];

  @ApiProperty({ example: 'CGV50K', required: false, description: 'Mã voucher giảm giá' })
  @IsOptional()
  @IsString()
  voucherCode?: string;

  @ApiProperty({ example: 0, required: false, description: 'Số điểm CGV Rewards muốn đổi (1 điểm = 1.000 VNĐ)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  pointsToUse?: number;
}
