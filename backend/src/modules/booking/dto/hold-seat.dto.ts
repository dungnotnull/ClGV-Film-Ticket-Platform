import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class HoldSeatDto {
  @ApiProperty({ example: 'st_456', required: false, description: 'ID suất chiếu' })
  @IsOptional()
  @IsString()
  showtimeId?: string;

  @ApiProperty({ example: ['H12', 'H13'], required: false, description: 'Danh sách mã ghế' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  seatIds?: string[];

  @ApiProperty({ example: 'res_12345', required: false, description: 'ID phiên giữ chỗ' })
  @IsOptional()
  @IsString()
  reservationId?: string;
}
