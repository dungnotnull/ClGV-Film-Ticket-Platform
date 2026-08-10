import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class AssignVoucherDto {
  @ApiProperty({ example: 'vch_uuid_123', description: 'ID của Voucher' })
  @IsString()
  @IsNotEmpty()
  voucherId: string;

  @ApiProperty({ example: ['user_uuid_1', 'user_uuid_2'], description: 'Danh sách ID người dùng được tặng' })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  userIds: string[];
}
