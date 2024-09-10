import { Controller, Post, Body, Get, Put } from '@nestjs/common';
import { GramRangeService } from './gramRange.service';
import { GramRange } from './gramRange.entity';
import { GramRangeDto } from './dto/gramRangeDto';

@Controller('gramRange')
export class GramRangeController {
  constructor(private readonly gramRangeService: GramRangeService) {}

  @Post('create')
  async create(@Body() createDto: GramRangeDto): Promise<GramRange> {
    return this.gramRangeService.create(createDto);
  }

  @Put('update')
  async update(@Body() updateDto: GramRangeDto): Promise<GramRange[]> {
    return this.gramRangeService.update(updateDto);
  }

  @Get('get')
  async find(): Promise<GramRange[]> {
    return this.gramRangeService.find();
  }
}
