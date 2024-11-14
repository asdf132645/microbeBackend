import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Put,
  Delete,
  Param,
  UseInterceptors,
} from '@nestjs/common';
import { RunningInfoService } from './runningInfo.service';
import {
  CreateRuningInfoDto,
  UpdateRuningInfoDto,
} from './dto/runningInfoDtoItems';
import { RunningInfoEntity } from './runningInfo.entity';
import * as moment from 'moment';
import { RedisCacheInterceptor } from '../cache/cache.interceptor';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Controller('runningInfo')
export class RunningInfoController {
  constructor(
    private readonly runingInfoService: RunningInfoService,
    @InjectRedis() private readonly redis: Redis, // Redis 인스턴스 주입
  ) {}

  @Get('pageUpDown')
  async getPageUpDown(
    @Query('id') id: string,
    @Query('step') step: string,
    @Query('type') type: string,
    @Query('dayQuery') dayQuery: string,
  ): Promise<Partial<RunningInfoEntity> | null> {
    // console.log('pageUpDown', dayQuery);
    await this.redis.del(dayQuery); // 해당 쿼리로 생성된 캐시 삭제
    return this.runingInfoService.getUpDownRunnInfo(
      Number(id),
      Number(step),
      type,
    );
  }

  @Get('clearPcIpState')
  async clearPcIpAndState(
    @Query('oldPcIp') oldPcIp: string,
    @Query('dayQuery') dayQuery: string,
  ): Promise<void> {
    await this.redis.del(dayQuery); // 해당 쿼리로 생성된 캐시 삭제
    await this.runingInfoService.clearPcIpAndState(oldPcIp);
  }

  @Get('updatePcIpState')
  async updatePcIpAndState(
    @Query('oldPcIp') oldPcIp: string,
    @Query('newEntityId') newEntityId: number,
    @Query('newPcIp') newPcIp: string,
    @Query('dayQuery') dayQuery: string,
  ): Promise<void> {
    await this.redis.del(dayQuery); // 해당 쿼리로 생성된 캐시 삭제
    await this.runingInfoService.updatePcIpAndState(
      oldPcIp,
      newEntityId,
      newPcIp,
    );
  }

  @Post('create')
  async create(
    @Body() createDto: CreateRuningInfoDto,
  ): Promise<RunningInfoEntity | null> {
    // await this.redis.del(updateDto?.dayQuery);
    // 반환 타입에 null 추가
    // runingInfoDtoItems가 객체일 경우, slotNo의 중복 확인 로직 (데이터베이스 조회)
    await this.redis.flushall(); // 모든 키 삭제
    const slotId = createDto.runingInfoDtoItems.slotId;

    // slotNo로 기존 엔티티 조회
    const existingEntity = await this.runingInfoService.findBySlotNo(slotId);

    if (existingEntity) {
      // 중복된 slotNo가 이미 존재하면 저장하지 않고 종료
      console.log(`중복된 slotId: ${slotId}가 이미 존재합니다..`);
      return null; // 저장하지 않고 null을 반환
    }

    // 중복이 없을 경우 엔티티 생성
    const createdEntity = await this.runingInfoService.create(createDto);
    // console.log(createdEntity);

    return createdEntity;
  }

  @Delete('delete')
  async deleteMultiple(@Body() req: any): Promise<{ success: boolean }> {
    await this.runingInfoService.redisAllClear(); // 해당 쿼리로 생성된 캐시 삭제

    const result = await this.runingInfoService.delete(
      req.ids,
      req.img_drive_root_path,
    );
    return { success: result };
  }

  @Put('update')
  async update(
    @Body() updateDto: UpdateRuningInfoDto,
  ): Promise<RunningInfoEntity[]> {
    await this.redis.del(updateDto?.dayQuery);
    // 데이터베이스 업데이트 수행
    const updatedEntities = await this.runingInfoService.update(updateDto);

    // 캐시 무효화
    await this.redis.flushall(); // 모든 키 삭제

    return updatedEntities;
  }

  @Get('detail/:id')
  @UseInterceptors(RedisCacheInterceptor)
  async getRunningInfoById(
    @Param('id') id: string,
  ): Promise<RunningInfoEntity | null> {
    return this.runingInfoService.getRunningInfoById(Number(id));
  }

  @Get('classInfoDetail/:id')
  @UseInterceptors(RedisCacheInterceptor)
  async getRunningInfoDetailById(
    @Param('id') id: string,
  ): Promise<RunningInfoEntity | null> {
    return this.runingInfoService.getRunningInfoClassDetail(Number(id));
  }

  @Get('classInfoDetailSelectQuery/:id')
  @UseInterceptors(RedisCacheInterceptor)
  async getRunningInfoClassInfoByIdDetail(
    @Param('id') id: string,
  ): Promise<RunningInfoEntity | null> {
    return this.runingInfoService.getRunningInfoClassInfo(Number(id));
  }

  @Get('classInfoMenuDetailSelectQuery/:id')
  @UseInterceptors(RedisCacheInterceptor)
  async getRunningInfoClassInfoMenuByIdDetail(
    @Param('id') id: string,
  ): Promise<RunningInfoEntity | null> {
    return this.runingInfoService.getRunningInfoClassInfoMenu(Number(id));
  }

  @Get('removePageAllData')
  async removePageAllDataApi(): Promise<void> {
    await this.redis.flushall(); // 모든 키 삭제
  }

  @Get('getAll')
  @UseInterceptors(RedisCacheInterceptor)
  async findAllWithPagingAndFilter(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Query('startDay') startDay?: string,
    @Query('endDay') endDay?: string,
    @Query('barcodeNo') barcodeNo?: string,
    @Query('patientId') patientId?: string,
    @Query('patientNm') patientNm?: string,
    @Query('title') titles?: string,
    @Query('testType') testType?: string,
  ): Promise<{ data: RunningInfoEntity[]; total: number; page: number }> {
    // 입력된 날짜 문자열을 Date 객체로 변환
    const startDate = startDay ? moment(startDay).toDate() : undefined;
    const endDate = endDay ? moment(endDay).toDate() : undefined;

    // titles 문자열을 쉼표로 분리하여 배열로 변환
    let titlesArray: string[] | undefined;
    if (titles) {
      titlesArray = titles.split(',');
    }

    // RuningInfoService를 호출하여 결과를 가져옵니다.
    const result = await this.runingInfoService.findAllWithPagingAndFilter(
      page,
      pageSize,
      startDate,
      endDate,
      barcodeNo,
      patientId,
      patientNm,
      titlesArray,
      testType,
    );

    return { data: result.data, total: result.total, page };
  }
}
