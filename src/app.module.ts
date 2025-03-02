import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createTypeOrmOptions } from '../ormconfig';
import { UserModule } from './user/user.module';
import { CellImgAnalyzedModule } from './settings/analysisDatabse/cellImgAnalyzed/cell.module';
import { GramRangeModule } from './settings/analysisDatabse/gramRange/gramRange.module';
import { ImagePrintModule } from './settings/report/imagePrint/imagePrint.module';
import { CbcCodeModule } from './settings/report/cbcCode/cbcCode.module';
import { FilePathSetModule } from './settings/report/filrPathSet/filePathSetModule';
import { JsonReaderModule } from './jsonReader/jsonReader.module';
import { RunningInfoModule } from './runingInfo/runningInfo.module';
import { ImagesController } from './images/images.controller';
import { ExcelService } from './excel/excel.service';
import { ExcelController } from './excel/excel.controller';

import { HttpExceptionFilter } from './utils/http-exception.filter';
import { ResponseInterceptor } from './utils/response.interceptor';
import { CombinedModule } from './combinedProtocol/combined.module';
import { LoggerService } from './logger.service';
import { FolderController } from './drivesFolder/drivesFolderController';
import { FoldersController } from './images/folders.controller';
import { PdfController } from './pdfDown/pdf.controller';
import { FileSystemController } from './fileSys/file-system.controller';
import { FileSystemService } from './fileSys/file-system.service';
import { IpModule } from './ipService/ipService.module';
import { ClassOrderModule } from './classOrder/classOrder.module';
// import { CacheInterceptor } from './interceptors/cache-control.interceptor';
import { DziReaderModule } from './dziReader/dziReader.module';
import { FileModule } from './file/file.module';
import { ImagesService } from './images/images.service';
import { Hl7Module } from './hl7/hl7.module';
import { DeviceModule } from './device/device.module';
import { DownloadModule } from './download/download.module';
import { RemainingCountController } from './settings/analysisDatabse/deviceController/remaining-count.controller';
import { RemainingCountService } from './settings/analysisDatabse/deviceController/remaining-count.service';
import { QualityCheckService } from './settings/qualityCheck/qualityCheck.service';
import { QualityCheckController } from './settings/qualityCheck/qualityCheck.controller';
import { BrowserModule } from './browserExit/browser.module';
import { UploadModule } from './upload/upload.module';
import { CbcModule } from './lisMakeData/cbc.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import * as path from 'path';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: createTypeOrmOptions,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: path.join(process.cwd(), 'src/schema.gql'),
      playground: true,
      path: 'api/graphql',
    }),
    UserModule,
    CellImgAnalyzedModule,
    GramRangeModule,
    ImagePrintModule,
    CbcCodeModule,
    FilePathSetModule,
    JsonReaderModule,
    RunningInfoModule,
    CombinedModule,
    IpModule,
    ClassOrderModule,
    DziReaderModule,
    FileModule,
    Hl7Module,
    DeviceModule,
    DownloadModule,
    BrowserModule,
    UploadModule,
    CbcModule,
  ],
  controllers: [
    AppController,
    FolderController,
    ImagesController,
    FoldersController,
    PdfController,
    FileSystemController,
    RemainingCountController,
    QualityCheckController,
    ExcelController,
  ],
  providers: [
    LoggerService,
    AppService,
    FileSystemService,
    ImagesService,
    RemainingCountService,
    QualityCheckService,
    ExcelService,
    {
      provide: 'APP_FILTER',
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: CacheInterceptor,
    // },
  ],
})
export class AppModule {}
