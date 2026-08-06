import { IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCinemaDto {
  @ApiProperty({ example: 'city_hcm', description: 'ID thành phố' })
  @IsString()
  @IsNotEmpty({ message: 'City ID không được để trống' })
  cityId: string;

  @ApiProperty({ example: 'CGV Vincom Đồng Khởi', description: 'Tên cụm rạp' })
  @IsString()
  @IsNotEmpty({ message: 'Tên cụm rạp không được để trống' })
  name: string;

  @ApiProperty({ example: '72 Lê Thánh Tôn, Q.1, TP.HCM', description: 'Địa chỉ cụm rạp' })
  @IsString()
  @IsNotEmpty({ message: 'Địa chỉ không được để trống' })
  address: string;

  @ApiPropertyOptional({ example: '1900 6017', description: 'Số điện thoại liên hệ' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: ['Bãi đậu xe', 'Popcorn Bar', 'L\'Amour'], description: 'Danh sách tiện ích' })
  @IsOptional()
  @IsArray()
  amenities?: string[];
}
