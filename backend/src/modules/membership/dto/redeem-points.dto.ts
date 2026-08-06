import { IsEnum, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum RewardType {
  TICKET_2D = 'TICKET_2D',
  POPCORN_COMBO = 'POPCORN_COMBO',
  DISCOUNT_VOUCHER_50K = 'DISCOUNT_VOUCHER_50K',
}

export class RedeemPointsDto {
  @ApiProperty({ description: 'Số điểm CGV Rewards muốn sử dụng', example: 100 })
  @IsInt()
  @Min(10)
  pointsToRedeem: number;

  @ApiProperty({ description: 'Loại phần quà quy đổi', enum: RewardType, example: RewardType.TICKET_2D })
  @IsEnum(RewardType)
  rewardType: RewardType;
}
