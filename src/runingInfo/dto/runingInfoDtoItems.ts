// runing-info.dto.ts

import { IsArray, IsInt, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class RuningInfoDtoItems {
  id: number;
  testType: string;
  lock_status: boolean;
  traySlot: string;
  barcodeNo: string;
  slotNo: string;
  analyzedDttm: string;
  tactTime: string;
  submitState: string;
  submitOfDate: Date;
  patientId: string;
  patientNm: string;
  gender: string;
  birthDay: string;
  slotId: string;
  orderDttm: string;
  totalMoCount: string;
  moInfo: any[];
  cassetId: string;
  isNormal: string;
  submitUserId?: string;
  moMemo?: string;
  pcIp: string;
  cbcPatientNo?: string;
  cbcPatientNm?: string;
  cbcSex?: string;
  cbcAge?: string;
  img_drive_root_path?: string;
}

export class CreateRuningInfoDto {
  @IsInt()
  @IsOptional()
  userId?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RuningInfoDtoItems)
  runingInfoDtoItems: RuningInfoDtoItems;

  dayQuery: any;
}

export class UpdateRuningInfoDto {
  @IsInt()
  userId: number;

  dayQuery: any;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RuningInfoDtoItems)
  runingInfoDtoItems: RuningInfoDtoItems[];
}
