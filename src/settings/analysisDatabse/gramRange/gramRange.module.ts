import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GramRange } from './gramRange.entity';
import { GramRangeService } from './gramRange.service';
import { GramRangeController } from './gramRange.controller';

@Module({
  imports: [TypeOrmModule.forFeature([GramRange])],
  providers: [GramRangeService],
  exports: [GramRangeService],
  controllers: [GramRangeController],
})
export class GramRangeModule {}
