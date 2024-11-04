import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { TotalClassInfo } from './types/class-info';

@Entity({ name: 'runing_info_entity' })
@ObjectType()
@Entity()
@Unique(['slotId']) // Unique 제약 조건 추가
export class RunningInfoEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => Boolean, { nullable: true }) // Boolean 타입으로 명시
  @Column({ type: 'boolean', nullable: true }) // boolean 타입 명시
  lock_status?: boolean;

  @Field(() => String, { nullable: true }) // Boolean 타입으로 명시
  @Column({ type: 'varchar', nullable: true }) // varchar로 명시
  traySlot?: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar' }) // varchar로 명시
  slotNo?: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar' }) // varchar로 명시
  barcodeNo?: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar' }) // varchar로 명시
  patientId?: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar' }) // varchar로 명시
  patientNm?: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar' }) // varchar로 명시
  gender?: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar' }) // varchar로 명시
  birthDay?: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar' }) // varchar로 명시
  slotId?: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar' }) // varchar로 명시
  orderDttm?: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar' }) // varchar로 명시
  testType?: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar' }) // varchar로 명시
  analyzedDttm?: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar' }) // varchar로 명시
  tactTime?: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar' }) // varchar로 명시
  cassetId?: string;

  @Field(() => Boolean, { nullable: true })
  @Column({ type: 'boolean' }) // varchar로 명시
  isNormal?: boolean;

  @Field(() => TotalClassInfo, { nullable: true })
  @Column('json', { nullable: true }) // JSON으로 저장
  classInfo?: TotalClassInfo;

  @Field(() => String, { nullable: true }) // Boolean 타입으로 명시
  @Column({ type: 'varchar', nullable: true }) // varchar로 명시
  submitState?: string;

  @Field({ nullable: true }) // nullable 옵션 추가
  @Column({ type: 'timestamp', nullable: true }) // Date 타입은 timestamp로 설정
  submitOfDate?: Date;

  @Field({ nullable: true }) // nullable 옵션 추가
  @Column({ type: 'varchar', nullable: true }) // varchar로 명시
  submitUserId?: string;

  @Field({ nullable: true }) // nullable 옵션 추가
  @Column({ type: 'varchar', nullable: true }) // varchar로 명시
  memo?: string;

  @Field({ nullable: true }) // nullable 옵션 추가
  @Column({ type: 'varchar', nullable: true }) // varchar로 명시
  pcIp?: string;

  @Field({ nullable: true }) // nullable 옵션 추가
  @Column({ type: 'varchar', nullable: true }) // varchar로 명시
  cbcPatientNo?: string;

  @Field({ nullable: true }) // nullable 옵션 추가
  @Column({ type: 'varchar', nullable: true }) // varchar로 명시
  cbcPatientNm?: string;

  @Field({ nullable: true }) // nullable 옵션 추가
  @Column({ type: 'varchar', nullable: true }) // varchar로 명시
  cbcSex?: string;

  @Field({ nullable: true }) // nullable 옵션 추가
  @Column({ type: 'varchar', nullable: true }) // varchar로 명시
  cbcAge?: string;

  @Field({ nullable: true }) // nullable 옵션 추가
  @Column({ type: 'varchar', nullable: true }) // varchar로 명시
  img_drive_root_path?: string;
}
