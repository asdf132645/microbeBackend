import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { TotalClassInfo } from '../types/class-info';

@ObjectType()
@InputType()
export class RunningInfoDtoItems {
  @IsInt()
  @Field(() => Int)
  id: number;

  @Field(() => Boolean)
  lock_status?: boolean;

  @Field(() => String)
  @IsString()
  traySlot?: string;

  @Field(() => String)
  slotNo?: string;

  @Field(() => String)
  barcodeNo?: string;

  @Field(() => String)
  patientId?: string;

  @Field(() => String)
  patientNm?: string;

  @Field(() => String)
  gender?: string;

  @Field(() => String)
  birthDay?: string;

  @Field(() => String)
  slotId?: string;

  @Field(() => String)
  orderDttm?: string;

  @Field(() => String)
  testType?: string;

  @Field(() => String)
  analyzedDttm?: string;

  @Field(() => String)
  tactTime?: string;

  @Field(() => String)
  cassetId?: string;

  @Field(() => Boolean)
  isNormal?: boolean;

  @Field(() => String)
  submitState?: string;

  @Field(() => Date)
  submitOfDate?: Date;

  @Field(() => String, { nullable: true })
  submitUserId?: string;

  @Field(() => TotalClassInfo, { nullable: true })
  classInfo?: TotalClassInfo;

  @Field(() => String, { nullable: true })
  memo?: string;

  @Field(() => String, { nullable: true })
  pcIp?: string;

  @Field(() => String, { nullable: true })
  cbcPatientNo?: string;

  @Field(() => String, { nullable: true })
  cbcPatientNm?: string;

  @Field(() => String, { nullable: true })
  cbcSex?: string;

  @Field(() => String, { nullable: true })
  cbcAge?: string;

  @Field(() => String, { nullable: true })
  img_drive_root_path?: string;
}

@InputType()
export class CreateRuningInfoDto {
  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  userId?: number;

  @Field(() => RunningInfoDtoItems)
  @ValidateNested({ each: true })
  @Type(() => RunningInfoDtoItems)
  runingInfoDtoItems: RunningInfoDtoItems;

  @Field(() => String)
  dayQuery: any;
}

@InputType()
export class UpdateRuningInfoDto {
  @Field(() => Int)
  @IsInt()
  userId: number;

  @Field(() => String)
  dayQuery: any;

  @IsArray()
  @Field(() => [RunningInfoDtoItems])
  @ValidateNested({ each: true })
  @Type(() => RunningInfoDtoItems)
  runingInfoDtoItems: RunningInfoDtoItems[];
}
