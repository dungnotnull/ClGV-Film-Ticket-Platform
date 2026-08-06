import { IsNotEmpty, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMatrixDto {
  @ApiProperty({ description: 'Sơ đồ ma trận ghế JSON mới' })
  @IsObject()
  @IsNotEmpty({ message: 'Ma trận ghế mới không được để trống' })
  roomMatrix: any;
}
