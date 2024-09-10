import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GramRange } from './gramRange.entity';
import { GramRangeDto } from './dto/gramRangeDto';

@Injectable()
export class GramRangeService {
  constructor(
    @InjectRepository(GramRange)
    private readonly gramRangeRepository: Repository<GramRange>,
  ) {}

  async create(createDto: GramRangeDto): Promise<GramRange> {
    const { gramRangeItems } = createDto;
    const createdItems: GramRange[] = [];
    for (const item of gramRangeItems) {
      const gramRange = this.gramRangeRepository.create({ ...item });
      const createdItem = await this.gramRangeRepository.save(gramRange);
      createdItems.push(createdItem);
    }

    return createdItems[0];
  }

  async update(updateDto: GramRangeDto): Promise<GramRange[]> {
    const { gramRangeItems } = updateDto;

    const updatedItems: GramRange[] = [];
    for (const item of gramRangeItems) {
      const updatedItem = await this.updateItem(item);
      updatedItems.push(updatedItem);
    }

    return updatedItems;
  }

  private async updateItem(item: any): Promise<GramRange> {
    const existingGramRange = await this.gramRangeRepository.findOne({
      where: { id: item.id },
    });

    if (existingGramRange) {
      await this.gramRangeRepository.update(existingGramRange.id, item);
      return await this.gramRangeRepository.findOne({
        where: { id: item.id },
      });
    }

    return null;
  }

  async find(): Promise<GramRange[]> {
    return await this.gramRangeRepository.find();
  }
}
