// combined.module.ts

import { Module } from '@nestjs/common';
import { CombinedService } from './combined.service';
import { LoggerService } from '../logger.service';
import { RunningInfoModule } from '../runingInfo/runningInfo.module';
import { BrowserService } from '../browserExit/browser.service';

@Module({
  imports: [RunningInfoModule],
  providers: [CombinedService, LoggerService, BrowserService],
  exports: [CombinedService, LoggerService, BrowserService],
})
export class CombinedModule {}
