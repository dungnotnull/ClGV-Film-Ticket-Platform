import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { HomeService } from './home.service';

@ApiTags('Home Aggregator')
@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @ApiOperation({ summary: 'API tổng hợp dữ liệu trang chủ động cho User (Banners, Phim đang chiếu/sắp chiếu, Rạp theo thành phố)' })
  @ApiQuery({ name: 'cityId', required: false, description: 'ID Thành phố được chọn trên giao diện' })
  @Get()
  async getHomePageData(@Query('cityId') cityId?: string) {
    return this.homeService.getHomePageData(cityId);
  }
}
