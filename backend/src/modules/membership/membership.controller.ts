import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MembershipService } from './membership.service';
import { RedeemPointsDto } from './dto/redeem-points.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('CGV Membership & Loyalty')
@Controller('membership')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class MembershipController {
  constructor(private readonly membershipService: MembershipService) {}

  @ApiOperation({ summary: 'Khách hàng xem thông tin hạng thẻ hội viên và lịch sử điểm CGV Rewards' })
  @Get('history')
  async getHistory(@CurrentUser() user: any) {
    return this.membershipService.getHistory(user.id);
  }

  @ApiOperation({ summary: 'Khách hàng đổi điểm CGV Rewards lấy phần quà / vé / bắp nước' })
  @Post('redeem')
  async redeemPoints(
    @CurrentUser() user: any,
    @Body() redeemPointsDto: RedeemPointsDto,
  ) {
    return this.membershipService.redeemPoints(user.id, redeemPointsDto);
  }
}
