import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from './src/user/entities/user.entity';
import { CellImgAnalyzed } from './src/settings/analysisDatabse/cellImgAnalyzed/entities/cell.entity';
import { GramRange } from './src/settings/analysisDatabse/gramRange/gramRange.entity';
import { ImagePrintEntity } from './src/settings/report/imagePrint/imagePrint.entity';
import { CbcCodeEntity } from './src/settings/report/cbcCode/cbcCode.entity';
import { FilePathSetEntity } from './src/settings/report/filrPathSet/filePathSetEntity';
import { RunningInfoEntity } from './src/runingInfo/runningInfo.entity';
import { ClassOrder } from './src/classOrder/classOrder';
import * as dotenv from 'dotenv';
import { DeviceEntity } from './src/device/device.entity';
dotenv.config(); // dotenv 설정 추가

export const createTypeOrmOptions = async (): Promise<TypeOrmModuleOptions> => {
  const options: TypeOrmModuleOptions = {
    type: 'mysql',
    host: '127.0.0.1',
    port: 3306,
    username: 'root',
    password: 'uimd5191!',
    database: 'mo_db_web',
    synchronize: false,
    migrations: ['src/migrations/**/*{.ts,.js}'],
    entities: [
      User,
      CellImgAnalyzed,
      GramRange,
      ImagePrintEntity,
      CbcCodeEntity,
      FilePathSetEntity,
      RunningInfoEntity,
      ClassOrder,
      DeviceEntity,
    ],
    extra: {
      connectionLimit: 20, // 커넥션 풀 크기 설정
      multipleStatements: true,
    },
  };

  return options;
};
