import { IsNotEmpty, IsString, IsOptional, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCityDto {
  @ApiProperty({ example: 'TP. Hồ Chí Minh', description: 'Tên thành phố / khu vực' })
  @IsString()
  @IsNotEmpty({ message: 'Tên thành phố không được để trống' })
  name: string;

  @ApiProperty({ example: 'HCM', description: 'Mã code viết tắt thành phố' })
  @IsString()
  @IsNotEmpty({ message: 'Mã code không được để trống' })
  code: string;

  @ApiPropertyOptional({ example: 1, description: 'Thứ tự hiển thị' })
  @IsOptional()
  @IsInt()
  displayOrder?: number;
}
