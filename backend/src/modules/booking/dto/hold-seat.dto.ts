import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class HoldSeatDto {
  @ApiProperty({ example: 'st_456', description: 'ID suất chiếu' })
  @IsString()
  @IsNotEmpty()
  showtimeId: string;

  @ApiProperty({ example: ['H12', 'H13'], description: 'Danh sách mã ghế cần giữ' })
  @IsArray()
  @IsString({ each: true })
  seatIds: string[];
}
