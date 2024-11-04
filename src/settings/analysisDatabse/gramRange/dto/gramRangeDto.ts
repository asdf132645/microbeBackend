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

  @IsInt()
  rareBoundary: number;

  @IsInt()
  fewBoundary: number;

  @IsInt()
  moderateBoundary: number;

  @IsString()
  fullNm: string;
}
