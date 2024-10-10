import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DownloadService } from './download.service';
import { DownloadController } from './download.controller';
import { RunningInfoEntity } from '../runingInfo/runningInfo.entity';
import { RedisModule, RedisModuleOptions } from '@nestjs-modules/ioredis';
import { LoggerService } from '../logger.service';
import { CombinedModule } from '../combinedProtocol/combined.module';

@Module({
  imports: [
    CombinedModule,
    TypeOrmModule.forFeature([RunningInfoEntity]),
    RedisModule.forRoot({
      type: 'single',
      url: 'redis://localhost:6379',
    } as RedisModuleOptions),
  ],
  providers: [DownloadService, LoggerService],
  controllers: [DownloadController],
})
export class DownloadModule {}
