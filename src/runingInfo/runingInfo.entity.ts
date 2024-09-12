// runing-info.entity.ts

import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['slotId']) // Unique 제약 조건 추가
export class RuningInfoEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  lock_status?: boolean;

  @Column()
  traySlot?: string;

  @Column()
  slotNo: string;

  @Column()
  barcodeNo: string;

  @Column()
  patientId: string;

  @Column()
  patientNm: string;

  @Column()
  gender: string;

  @Column()
  birthDay: string;

  @Column()
  slotId: string;

  @Column()
  orderDttm: string;

  @Column()
  testType: string;

  @Column()
  analyzedDttm: string;

  @Column()
  tactTime: string;

  @Column()
  totalMoCount: string;

  @Column()
  cassetId: string;

  @Column()
  isNormal: string;

  @Column('json')
  moInfo: any[];

  @Column('json')
  moInfoAfter: any[];

  @Column()
  submitState?: string;

  @Column()
  submitOfDate?: Date;

  @Column()
  submitUserId?: string;

  @Column()
  moMemo?: string;

  @Column()
  pcIp?: string;

  @Column()
  cbcPatientNo?: string;

  @Column()
  cbcPatientNm?: string;

  @Column()
  cbcSex?: string;

  @Column()
  cbcAge?: string;

  @Column()
  img_drive_root_path?: string;
}
