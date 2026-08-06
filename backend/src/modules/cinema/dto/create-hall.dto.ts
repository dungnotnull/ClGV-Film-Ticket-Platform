import { IsNotEmpty, IsString, IsEnum, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ScreenType } from '@prisma/client';

export class CreateHallDto {
  @ApiProperty({ description: 'ID cụm rạp' })
  @IsString()
  @IsNotEmpty({ message: 'Cinema ID không được để trống' })
  cinemaId: string;

  @ApiProperty({ example: 'Phòng 01 (IMAX)', description: 'Tên phòng chiếu' })
  @IsString()
  @IsNotEmpty({ message: 'Tên phòng chiếu không được để trống' })
  name: string;

  @ApiProperty({ enum: ScreenType, example: ScreenType.IMAX, description: 'Loại màn hình' })
  @IsEnum(ScreenType, { message: 'Loại màn hình không hợp lệ' })
  screenType: ScreenType;

  @ApiProperty({ description: 'Sơ đồ ma trận ghế JSON' })
  @IsObject()
  @IsNotEmpty({ message: 'Cấu trúc ma trận ghế không được để trống' })
  roomMatrix: any;
}
