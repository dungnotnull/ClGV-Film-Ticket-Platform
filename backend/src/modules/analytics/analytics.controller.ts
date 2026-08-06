import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AnalyticsService } from './analytics.service';
import { DateRangeQueryDto, OccupancyQueryDto } from './dto/analytics-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Admin Analytics')
@Controller('admin/analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @ApiOperation({ summary: 'Admin xem tổng quan chỉ số Dashboard (doanh thu, vé bán, lấp đầy)' })
  @Get('dashboard')
  async getDashboardSummary() {
    return this.analyticsService.getDashboardSummary();
  }

  @ApiOperation({ summary: 'Admin xem phân tích doanh thu chi tiết (theo ngày, rạp, phim)' })
  @Get('revenue')
  async getRevenueAnalytics(@Query() query: DateRangeQueryDto) {
    return this.analyticsService.getRevenueAnalytics(query);
  }

  @ApiOperation({ summary: 'Admin xem tỷ lệ lấp đầy phòng chiếu (Occupancy Rate %)' })
  @Get('occupancy')
  async getOccupancyAnalytics(@Query() query: OccupancyQueryDto) {
    return this.analyticsService.getOccupancyAnalytics(query);
  }

  @ApiOperation({ summary: 'Admin xem thống kê phân bổ hội viên và điểm thưởng CGV Rewards' })
  @Get('members')
  async getMembersAnalytics() {
    return this.analyticsService.getMembersAnalytics();
  }
}
