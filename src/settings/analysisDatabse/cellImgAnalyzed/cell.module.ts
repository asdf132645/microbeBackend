// cell-img-analyzed.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CellImgAnalyzed } from './entities/cell.entity';
import { CellImgAnalyzedController } from './cell.controller';
import { CellImgAnalyzedService } from './cell.service';

@Module({
  imports: [TypeOrmModule.forFeature([CellImgAnalyzed])],
  controllers: [CellImgAnalyzedController],
  providers: [CellImgAnalyzedService],
})
export class CellImgAnalyzedModule {}
