import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyQrDto {
  @ApiProperty({ description: 'Chuỗi mã QR Ticket Token HMAC-SHA256', example: 'eyJ0aWNrZXRJZCI6IjEyMyJ9...' })
  @IsNotEmpty()
  @IsString()
  qrToken: string;
}
