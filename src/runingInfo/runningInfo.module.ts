import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RunningInfoEntity } from './runningInfo.entity';
import { RunningInfoService } from './runningInfo.service';
import { RunningInfoController } from './runningInfo.controller';
import { LoggerService } from '../logger.service';
import { RedisModule, RedisModuleOptions } from '@nestjs-modules/ioredis';
import { RunningInfoResolver } from './runningInfo.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([RunningInfoEntity]),
    RedisModule.forRoot({
      type: 'single', // Redis의 단일 서버 유형을 명시합니다
      url: 'redis://localhost:6379', // Redis 연결 URL
    } as RedisModuleOptions),
  ],
  providers: [RunningInfoService, RunningInfoResolver, LoggerService],
  exports: [RunningInfoService, RunningInfoResolver],
  controllers: [RunningInfoController],
})
export class RunningInfoModule {}
