import { Module } from '@nestjs/common';
import { CGVCardService } from './cgv-card.service';
import { CGVCardController } from './cgv-card.controller';

@Module({
  controllers: [CGVCardController],
  providers: [CGVCardService],
  exports: [CGVCardService],
})
export class CGVCardModule {}
