import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class ApplyVoucherDto {
  @ApiProperty({ example: 'CGV50K', description: 'Mã voucher cần kiểm tra' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 250000, description: 'Tổng số tiền đơn hàng (VND)' })
  @IsInt()
  @Min(0)
  orderAmount: number;
}
