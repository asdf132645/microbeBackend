// cell-img-analyzed.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('cell_img_analyzed_setting')
export class CellImgAnalyzed {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1, description: '세포 이미지 분석 ID' })
  id: number;

  @Column()
  @ApiProperty({ example: '01', description: 'Analysis 타입' })
  analysisType: string;

  @Column()
  @ApiProperty({ example: '20', description: '저배율 이미지 캡처 카운트' })
  LPCaptureCount: string;

  @Column()
  @ApiProperty({ example: '', description: 'IA 루트 경로' })
  iaRootPath: string;

  @Column()
  @ApiProperty({ example: false, description: '알람 여부' })
  isAlarm: boolean;

  @Column()
  @ApiProperty({ example: '0', description: '알람 카운트' })
  alarmCount: string;

  @Column()
  @ApiProperty({ example: false, description: '페이지 유지 여부' })
  keepPage: boolean;

  @Column()
  @ApiProperty({ example: '', description: '백업 경로' })
  backupPath: string;

  @Column({ type: 'date' })
  @ApiProperty({ example: '0000-00-00', description: '백업 시작 날짜' })
  backupStartDate: Date;

  @Column({ type: 'date' })
  @ApiProperty({ example: '0000-00-00', description: '백업 종료 날짜' })
  backupEndDate: Date;

  @Column()
  @ApiProperty({ example: '1', description: '자동 백업 날짜' })
  autoBackUpMonth: string;

  @Column({ type: 'date' })
  @ApiProperty({ example: '0000-00-00', description: '자동 저장 시작 날짜' })
  autoBackUpStartDate: Date;
}
