import { IsNotEmpty, IsString, IsOptional, IsInt, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BannerStatus } from '@prisma/client';

export class CreateBannerDto {
  @ApiProperty({ example: 'Khuyến mãi Happy Wednesday', description: 'Tiêu đề banner' })
  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
  title: string;

  @ApiProperty({ example: 'https://images.cgv.vn/banner/happy-wed.jpg', description: 'Hình ảnh banner URL' })
  @IsString()
  @IsNotEmpty({ message: 'URL hình ảnh không được để trống' })
  imageUrl: string;

  @ApiPropertyOptional({ example: '/promotions/happy-wednesday', description: 'Đường dẫn liên kết' })
  @IsOptional()
  @IsString()
  linkUrl?: string;

  @ApiPropertyOptional({ example: 1, description: 'Thứ tự hiển thị' })
  @IsOptional()
  @IsInt()
  displayOrder?: number;

  @ApiPropertyOptional({ enum: BannerStatus, example: BannerStatus.ACTIVE, description: 'Trạng thái active' })
  @IsOptional()
  @IsEnum(BannerStatus)
  status?: BannerStatus;
}
