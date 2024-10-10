// cell-img-analyzed.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CellImgAnalyzed } from './entities/cell.entity';
import { CellImgAnalyzedDto } from './dto/create-cellImg.dto';

@Injectable()
export class CellImgAnalyzedService {
  constructor(
    @InjectRepository(CellImgAnalyzed)
    private readonly cellImgAnalyzedRepository: Repository<CellImgAnalyzed>,
  ) {}

  async create(dto: CellImgAnalyzedDto): Promise<CellImgAnalyzed> {
    const { ...rest } = dto;
    const entity = this.cellImgAnalyzedRepository.create({ ...rest });
    return await this.cellImgAnalyzedRepository.save(entity);
  }

  async find(): Promise<CellImgAnalyzed | null> {
    const entity = await this.cellImgAnalyzedRepository.find();
    if (!entity) {
      console.log(`Cell Image Analyzed Setting 정보를 찾을 수 없습니다.`);
      return null;
    }
    return entity[0];
  }

  async update(dto: CellImgAnalyzedDto): Promise<CellImgAnalyzed> {
    const { ...rest } = dto;

    const existingEntity = await this.cellImgAnalyzedRepository.find();
    if (!existingEntity) {
      return null;
    }

    this.cellImgAnalyzedRepository.merge(existingEntity[0], { ...rest });

    // Save the updated entity
    return await this.cellImgAnalyzedRepository.save(existingEntity)[0];
  }
}
