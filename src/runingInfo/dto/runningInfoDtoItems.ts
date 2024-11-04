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

  @Field(() => Boolean, { nullable: true })
  lock_status?: boolean;

  @Field(() => String, { nullable: true })
  @IsString()
  traySlot?: string;

  @Field(() => String, { nullable: true })
  slotNo?: string;

  @Field(() => String, { nullable: true })
  barcodeNo?: string;

  @Field(() => String, { nullable: true })
  patientId?: string;

  @Field(() => String, { nullable: true })
  patientNm?: string;

  @Field(() => String, { nullable: true })
  gender?: string;

  @Field(() => String, { nullable: true })
  birthDay?: string;

  @Field(() => String, { nullable: true })
  slotId?: string;

  @Field(() => String, { nullable: true })
  orderDttm?: string;

  @Field(() => String, { nullable: true })
  testType?: string;

  @Field(() => String, { nullable: true })
  analyzedDttm?: string;

  @Field(() => String, { nullable: true })
  tactTime?: string;

  @Field(() => String, { nullable: true })
  cassetId?: string;

  @Field(() => Boolean, { nullable: true })
  isNormal?: boolean;

  @Field(() => String, { nullable: true })
  submitState?: string;

  @Field(() => Date, { nullable: true })
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
