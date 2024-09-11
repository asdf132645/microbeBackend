// create-cellImg.dto.ts
export class CellImgAnalyzedDto {
  id: number;
  analysisType: string;
  LPCaptureCount: string;
  iaRootPath: string;
  isAlarm: boolean;
  alarmCount: string;
  keepPage: boolean;
  backupPath: string;
  backupStartDate: Date;
  backupEndDate: Date;
  autoBackUpMonth: string;
  autoBackUpStartDate: Date;
}
