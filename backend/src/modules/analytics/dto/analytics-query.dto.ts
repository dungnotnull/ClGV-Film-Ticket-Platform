import { IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class DateRangeQueryDto {
  @ApiPropertyOptional({ description: 'Ngày bắt đầu (YYYY-MM-DD)', example: '2026-08-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Ngày kết thúc (YYYY-MM-DD)', example: '2026-08-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Lọc theo ID Cụm rạp' })
  @IsOptional()
  @IsString()
  cinemaId?: string;

  @ApiPropertyOptional({ description: 'Lọc theo ID Phim' })
  @IsOptional()
  @IsString()
  movieId?: string;
}

export class OccupancyQueryDto {
  @ApiPropertyOptional({ description: 'Lọc theo ID Cụm rạp' })
  @IsOptional()
  @IsString()
  cinemaId?: string;

  @ApiPropertyOptional({ description: 'Lọc theo ngày (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  date?: string;
}
