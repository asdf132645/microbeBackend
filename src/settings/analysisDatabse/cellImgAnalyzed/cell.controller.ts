import { Controller, Post, Body, Get, Put } from '@nestjs/common';
import { CellImgAnalyzedDto } from './dto/create-cellImg.dto';
import { CellImgAnalyzedService } from './cell.service';

@Controller('cellImgAnalyzed')
export class CellImgAnalyzedController {
  constructor(
    private readonly cellImgAnalyzedService: CellImgAnalyzedService,
  ) {}

  @Post('create')
  async create(@Body() dto: CellImgAnalyzedDto) {
    return await this.cellImgAnalyzedService.create(dto);
  }

  @Put('update')
  async update(@Body() dto: CellImgAnalyzedDto) {
    return await this.cellImgAnalyzedService.update(dto);
  }

  @Get()
  async find() {
    return await this.cellImgAnalyzedService.find();
  }
}
