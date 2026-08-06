import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateComboDto {
  @ApiProperty({ example: 'CGV Combo 1', description: 'Tên combo bắp nước' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: '1 Bắp Ngọt Large + 2 Nước Ngọt Large', description: 'Mô tả combo' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'https://images.cgv.vn/combo1.jpg', description: 'Hình ảnh combo' })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ example: 119000, description: 'Giá tiền integer (VND)' })
  @IsInt()
  @Min(0)
  price: number;
}
