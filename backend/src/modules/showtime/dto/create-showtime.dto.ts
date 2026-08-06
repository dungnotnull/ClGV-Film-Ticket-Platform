import { IsNotEmpty, IsString, IsInt, IsDateString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateShowtimeDto {
  @ApiProperty({ description: 'ID phim' })
  @IsString()
  @IsNotEmpty({ message: 'Movie ID không được để trống' })
  movieId: string;

  @ApiProperty({ description: 'ID cụm rạp' })
  @IsString()
  @IsNotEmpty({ message: 'Cinema ID không được để trống' })
  cinemaId: string;

  @ApiProperty({ description: 'ID phòng chiếu' })
  @IsString()
  @IsNotEmpty({ message: 'Hall ID không được để trống' })
  hallId: string;

  @ApiProperty({ example: '2026-08-10T14:00:00Z', description: 'Thời gian bắt đầu' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ example: '2026-08-10T16:15:00Z', description: 'Thời gian kết thúc' })
  @IsDateString()
  endTime: string;

  @ApiProperty({ example: 120000, description: 'Giá vé cơ bản (VND Integer)' })
  @IsInt()
  @Min(0, { message: 'Giá vé phải lớn hơn hoặc bằng 0' })
  basePrice: number;
}
