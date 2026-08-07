import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class UpdateUserRoleDto {
  @ApiProperty({ description: 'Quyền hạn mới (CUSTOMER, ADMIN, SCANNER)', enum: Role, example: Role.ADMIN })
  @IsNotEmpty()
  @IsEnum(Role)
  role: Role;
}
