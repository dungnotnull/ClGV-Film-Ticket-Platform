import { IsOptional, IsEnum, IsInt, IsBoolean, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { MembershipTier } from '@prisma/client';

export class UpdateUserMembershipDto {
  @ApiPropertyOptional({ description: 'Hạng hội viên mới (MEMBER, U22_FANC, VIP, VVIP)', enum: MembershipTier })
  @IsOptional()
  @IsEnum(MembershipTier)
  membershipTier?: MembershipTier;

  @ApiPropertyOptional({ description: 'Số điểm thưởng CGV Rewards mới', example: 500 })
  @IsOptional()
  @IsInt()
  @Min(0)
  points?: number;

  @ApiPropertyOptional({ description: 'Số dư ví thẻ CGV Card mới (VND Integer)', example: 1000000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  cgvCardBalance?: number;

  @ApiPropertyOptional({ description: 'Trạng thái xác minh HSSV/U22', example: true })
  @IsOptional()
  @IsBoolean()
  isU22Verified?: boolean;
}
