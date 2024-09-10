import {
  IsString,
  IsInt,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GramRangeDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => gramRangeItems)
  gramRangeItems: gramRangeItems[];
}

export class gramRangeItems {
  @IsInt()
  @IsOptional()
  id?: number;

  @IsString()
  classId: string;

  @IsString()
  rareMost: string;

  @IsString()
  fewLeast: string;

  @IsString()
  fewMost: string;

  @IsString()
  moderateLeast: string;

  @IsString()
  moderateMost: string;

  @IsString()
  manyLeast: string;

  @IsString()
  abbreviation: string;

  @IsString()
  fullNm: string;

  @IsString()
  unit: string;
}
