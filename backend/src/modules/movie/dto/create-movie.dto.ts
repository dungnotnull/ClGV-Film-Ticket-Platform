import { IsNotEmpty, IsString, IsOptional, IsInt, IsEnum, IsArray, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MovieStatus, AgeRating } from '@prisma/client';

export class CreateMovieDto {
  @ApiProperty({ example: 'Mai', description: 'Tiêu đề tiếng Việt' })
  @IsString()
  @IsNotEmpty({ message: 'Tên phim không được để trống' })
  title: string;

  @ApiPropertyOptional({ example: 'Mai (2024)', description: 'Tên gốc' })
  @IsOptional()
  @IsString()
  titleOriginal?: string;

  @ApiPropertyOptional({ example: 'Trấn Thành', description: 'Đạo diễn' })
  @IsOptional()
  @IsString()
  director?: string;

  @ApiPropertyOptional({ example: 'Phương Anh Đào, Tuấn Trần', description: 'Diễn viên' })
  @IsOptional()
  @IsString()
  cast?: string;

  @ApiPropertyOptional({ example: ['Tâm lý', 'Tình cảm'], description: 'Danh sách thể loại' })
  @IsOptional()
  @IsArray()
  genres?: string[];

  @ApiProperty({ example: 131, description: 'Thời lượng tính theo phút' })
  @IsInt()
  durationMinutes: number;

  @ApiProperty({ example: '2024-02-10T00:00:00Z', description: 'Ngày khởi chiếu' })
  @IsDateString()
  releaseDate: string;

  @ApiProperty({ example: 'https://images.cgv.vn/poster/mai.jpg', description: 'Poster URL' })
  @IsString()
  @IsNotEmpty({ message: 'Poster URL không được để trống' })
  posterUrl: string;

  @ApiPropertyOptional({ example: 'https://youtube.com/watch?v=123', description: 'Trailer URL' })
  @IsOptional()
  @IsString()
  trailerUrl?: string;

  @ApiPropertyOptional({ enum: AgeRating, example: AgeRating.T18, description: 'Phân loại độ tuổi' })
  @IsOptional()
  @IsEnum(AgeRating)
  ageRating?: AgeRating;

  @ApiPropertyOptional({ example: 'SUB', description: 'Định dạng tiếng: SUB, DUB, THUYT_MINH' })
  @IsOptional()
  @IsString()
  languageType?: string;

  @ApiPropertyOptional({ enum: MovieStatus, example: MovieStatus.COMING_SOON, description: 'Trạng thái phim (mặc định COMING_SOON)' })
  @IsOptional()
  @IsEnum(MovieStatus)
  status?: MovieStatus;

  @ApiProperty({ example: 'Nội dung xoay quanh cuộc đời của Mai...', description: 'Mô tả tóm tắt nội dung phim' })
  @IsString()
  @IsNotEmpty({ message: 'Mô tả không được để trống' })
  description: string;
}
