import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role, MembershipTier } from '@prisma/client';

export class UserQueryDto {
  @ApiPropertyOptional({ description: 'Lọc theo Role người dùng', enum: Role })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({ description: 'Lọc theo hạng hội viên CGV', enum: MembershipTier })
  @IsOptional()
  @IsEnum(MembershipTier)
  membershipTier?: MembershipTier;

  @ApiPropertyOptional({ description: 'Từ khóa tìm kiếm (email, họ tên, SĐT)' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Trang hiện tại (Default: 1)', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Số bản ghi trên mỗi trang (Default: 10)', example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
