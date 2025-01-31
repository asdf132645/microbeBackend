import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Brackets,
  Between,
  In,
  Repository,
  EntityManager,
  DataSource,
} from 'typeorm';
import { RunningInfoEntity } from './runningInfo.entity';
import * as moment from 'moment';
import {
  CreateRuningInfoDto,
  UpdateRuningInfoDto,
} from './dto/runningInfoDtoItems';
import * as fs from 'fs';
import { LoggerService } from '../logger.service';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { exec } from 'child_process';

@Injectable()
export class RunningInfoService {
  constructor(
    private readonly logger: LoggerService,
    private readonly dataSource: DataSource, // 트랜잭션을 사용 하여 비동기 작업의 타이밍 문제를 해결
    @InjectRepository(RunningInfoEntity)
    private readonly runingInfoEntityRepository: Repository<RunningInfoEntity>,
    @InjectRedis() private readonly redis: Redis, // Redis 인스턴스 주입
  ) {}

  async addUniqueConstraintToSlotId() {
    try {
      const entityManager = this.runingInfoEntityRepository.manager;

      // UNIQUE 제약 조건이 이미 있는지 확인
      const checkQuery = `
      SELECT COUNT(*)
      FROM information_schema.TABLE_CONSTRAINTS tc
      JOIN information_schema.KEY_COLUMN_USAGE kcu
      ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
      WHERE tc.TABLE_SCHEMA = DATABASE() -- 현재 데이터베이스 선택
      AND tc.TABLE_NAME = 'runing_info_entity'
      AND tc.CONSTRAINT_TYPE = 'UNIQUE'
      AND kcu.COLUMN_NAME = 'slotId';
    `;

      const checkResult = await entityManager.query(checkQuery);

      // 제약 조건이 이미 존재하면 추가하지 않음
      if (checkResult[0]['COUNT(*)'] > 0) return;

      // UNIQUE 제약 조건 추가
      const addQuery = `
      ALTER TABLE runing_info_entity 
      ADD CONSTRAINT unique_slotId UNIQUE (slotId);
    `;

      await entityManager.query(addQuery);

      console.log('slotId에 UNIQUE 제약 조건이 추가되었습니다.');
    } catch (error) {
      console.log('오류 발생:', error.message);
    }
  }

  async create(createDto: CreateRuningInfoDto): Promise<RunningInfoEntity> {
    const { runingInfoDtoItems } = createDto;

    const analyzedDttm = moment(
      runingInfoDtoItems.analyzedDttm,
      'YYYYMMDDHHmm',
    );

    const startDttm = analyzedDttm.clone().subtract(1, 'hours');
    const endDttm = analyzedDttm.clone().add(1, 'hours');

    // 시작 시간과 끝 시간을 다시 문자열로 변환
    const startDttmStr = startDttm.format('YYYYMMDDHHmm');
    const endDttmStr = endDttm.format('YYYYMMDDHHmm');

    return await this.dataSource.transaction(async (manager) => {
      // 동일한 slotId와 analyzedDttm의 앞뒤 1시간 내의 데이터가 있는지 확인
      const existingEntity = await manager.findOne(RunningInfoEntity, {
        where: {
          slotId: runingInfoDtoItems.slotId, // 첫 번째 요소로 접근
          analyzedDttm: Between(startDttmStr, endDttmStr), // 1시간 범위 내에서 조회
        },
      });

      if (existingEntity) {
        console.log(
          '동일 슬롯아이디 및 1시간 범위 내 analyzedDttm 존재, 저장 x',
        );
        return null;
      }

      // 새로운 엔티티 생성
      const entity = manager.create(RunningInfoEntity, {
        ...runingInfoDtoItems, // 첫 번째 요소로 접근
      });

      // 엔티티 저장
      return await manager.save(entity);
    });
  }

  async findBySlotNo(slotId: string): Promise<RunningInfoEntity | undefined> {
    return this.runingInfoEntityRepository.findOne({ where: { slotId } });
  }

  async update(updateDto: UpdateRuningInfoDto): Promise<RunningInfoEntity[]> {
    const { runingInfoDtoItems } = updateDto;

    const updatedItems: RunningInfoEntity[] = [];
    for (const item of runingInfoDtoItems) {
      const existingEntity = await this.runingInfoEntityRepository.findOne({
        where: { id: item.id },
      });

      if (existingEntity) {
        // 엔터티의 속성 업데이트
        existingEntity.slotNo = item.slotNo;
        existingEntity.barcodeNo = item.barcodeNo;
        existingEntity.patientId = item.patientId;
        existingEntity.patientNm = item.patientNm;
        existingEntity.gender = item.gender;
        existingEntity.birthDay = item.birthDay;
        existingEntity.slotId = item.slotId;
        existingEntity.orderDttm = item.orderDttm;
        existingEntity.testType = item.testType;
        existingEntity.cbcPatientNo = item.cbcPatientNo;
        existingEntity.cbcPatientNm = item.cbcPatientNm;
        existingEntity.cbcSex = item.cbcSex;
        existingEntity.cbcAge = item.cbcAge;
        existingEntity.tactTime = item.tactTime;
        existingEntity.cassetId = item.cassetId;
        existingEntity.isNormal = item.isNormal;
        existingEntity.memo = item.memo;
        existingEntity.classInfo = item.classInfo;
        existingEntity.lock_status = item.lock_status;
        existingEntity.pcIp = item.pcIp;
        existingEntity.submitState = item.submitState;
        existingEntity.submitOfDate = item.submitOfDate;
        existingEntity.submitUserId = item.submitUserId;
        existingEntity.img_drive_root_path = item.img_drive_root_path;

        await this.runingInfoEntityRepository.save(existingEntity);
        updatedItems.push(existingEntity);
      }
    }

    return updatedItems;
  }

  async delete(ids: string[], rootPaths: string[]): Promise<boolean> {
    await this.cleanBrowserCache();

    try {
      const result = await this.runingInfoEntityRepository.delete({
        id: In(ids),
      });

      if (result.affected > 0) {
        await Promise.all(
          rootPaths.map(async (rootPath) => {
            try {
              await exec(`rmdir /s /q "${rootPath}"`);
              console.log(
                `Folder at ${rootPath} has been deleted successfully`,
              );
            } catch (error) {
              console.error(
                `Failed to delete folder at ${rootPath}:`,
                error.message,
              );
            }
          }),
        );
        return true;
      }
    } catch (error) {
      console.error('Error while deleting entities:', error);
      return false; // 삭제 실패
    }
  }

  async findAllWithPagingAndFilter(
    page: number,
    pageSize: number,
    startDay?: Date,
    endDay?: Date,
    barcodeNo?: string,
    patientId?: string,
    patientNm?: string,
    titles?: string[],
    testType?: string,
  ): Promise<{ data: RunningInfoEntity[]; total: number }> {
    const queryBuilder =
      this.runingInfoEntityRepository.createQueryBuilder('runInfo');

    const startFormatted = startDay
      ? `${startDay.getFullYear()}${(startDay.getMonth() + 1).toString().padStart(2, '0')}${startDay.getDate().toString().padStart(2, '0')}000000000`
      : undefined;
    const endFormatted = endDay
      ? `${endDay.getFullYear()}${(endDay.getMonth() + 1).toString().padStart(2, '0')}${endDay.getDate().toString().padStart(2, '0')}235959999`
      : undefined;

    if (startFormatted || endFormatted) {
      queryBuilder.andWhere(
        startFormatted && endFormatted
          ? 'runInfo.analyzedDttm BETWEEN :startDay AND :endDay'
          : startFormatted
            ? 'runInfo.analyzedDttm >= :startDay'
            : 'runInfo.analyzedDttm <= :endDay',
        {
          startDay: startFormatted,
          endDay: endFormatted,
        },
      );
    }

    queryBuilder.orderBy('runInfo.analyzedDttm', 'DESC');

    if (barcodeNo) {
      queryBuilder.andWhere('runInfo.barcodeNo LIKE :barcodeNo', {
        barcodeNo: `%${barcodeNo}%`,
      });
    }

    if (patientId) {
      queryBuilder.andWhere('runInfo.patientId LIKE :patientId', {
        patientId: `%${patientId}%`,
      });
    }

    if (patientNm) {
      queryBuilder.andWhere('runInfo.patientNm LIKE :patientNm', {
        patientNm: `%${patientNm}%`,
      });
    }

    if (testType) {
      queryBuilder.andWhere('runInfo.testType = :testType', { testType });
    }

    if (titles && titles.length > 0) {
      const orConditions = titles
        .map((title, index) => {
          const titleParam = `title${index}`;
          return `
            (JSON_SEARCH(runInfo.classInfo, 'one', :${titleParam}, NULL, '$[*].title') IS NOT NULL
            AND (
              SELECT COUNT(*)
              FROM JSON_TABLE(
                runInfo.classInfo,
                '$[*]' COLUMNS(
                  title VARCHAR(255) PATH '$.title',
                  count INT PATH '$.count'
                )
              ) AS jt
              WHERE jt.title = :${titleParam}
                AND jt.count > 0
            ) > 0)
          `;
        })
        .join(' OR ');

      const params = titles.reduce((acc, title, index) => {
        acc[`title${index}`] = title;
        return acc;
      }, {});

      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where(orConditions, params);
        }),
      );
    }

    // eslint-disable-next-line prefer-const
    let [data, total] = await queryBuilder.getManyAndCount();
    if (pageSize && page) {
      data = data.slice((page - 1) * pageSize, page * pageSize);
    }

    return { data, total };
  }

  async clearPcIpAndSetStateFalse(pcIp: string): Promise<void> {
    try {
      console.log(pcIp);
      // PC IP가 주어진 값인 엔터티를 선택
      const entityWithPcIp = await this.runingInfoEntityRepository.findOne({
        where: { pcIp },
      });

      if (!entityWithPcIp) {
        console.error(`Entity with PC IP ${pcIp} not found`);
        return;
      }

      // PC IP를 빈 문자열로 변경
      entityWithPcIp.pcIp = '';

      // 상태를 false로 변경
      entityWithPcIp.lock_status = false;

      // 변경된 엔터티를 저장
      await this.runingInfoEntityRepository.save(entityWithPcIp);
    } catch (error) {
      console.error(
        'Error while clearing PC IP and setting state to false:',
        error,
      );
    }
  }

  async getRunningInfoById(id: number): Promise<RunningInfoEntity | null> {
    const entity = await this.runingInfoEntityRepository.findOne({
      where: { id },
    });
    return entity || null;
  }

  async getRunningInfoClassDetail(
    id: number,
  ): Promise<RunningInfoEntity | null> {
    const entityManager: EntityManager =
      this.runingInfoEntityRepository.manager;

    const query = `
      SELECT 
        id,
        slotId,
        testType,
        barcodeNo,
        patientId,
        cbcPatientNo,
        cbcPatientNm,
        submitState,
        cbcSex,
        cbcAge,
        analyzedDttm,
        classInfo,
        img_drive_root_path,
      FROM 
        runing_info_entity
      WHERE 
        id = ?`;

    const result = await entityManager.query(query, [id]);

    if (result.length > 0) {
      return result[0] as RunningInfoEntity;
    } else {
      return null;
    }
  }

  async getRunningInfoClassInfo(id: number): Promise<RunningInfoEntity | null> {
    const entityManager: EntityManager =
      this.runingInfoEntityRepository.manager;

    const query = `
      SELECT 
        id,
        classInfo,
        testType,
        submitState,
        img_drive_root_path
      FROM 
        runing_info_entity
      WHERE 
        id = ?`;

    const result = await entityManager.query(query, [id]);

    if (result.length > 0) {
      return result[0] as RunningInfoEntity;
    } else {
      return null;
    }
  }

  async getRunningInfoClassInfoMenu(
    id: number,
  ): Promise<RunningInfoEntity | null> {
    const entityManager: EntityManager =
      this.runingInfoEntityRepository.manager;

    const query = `
      SELECT 
        id,
        lock_status,
        classInfo,
        testType,
        img_drive_root_path
      FROM 
        runing_info_entity
      WHERE 
        id = ?`;

    const result = await entityManager.query(query, [id]);

    if (result.length > 0) {
      return result[0] as RunningInfoEntity;
    } else {
      return null;
    }
  }

  async getUpDownRunnInfo(
    id: number,
    step: number,
    type: string,
  ): Promise<Partial<RunningInfoEntity> | null> {
    const entityManager: EntityManager =
      this.runingInfoEntityRepository.manager;

    // 현재 엔티티를 찾기
    const currentEntityQuery = `
      SELECT 
        id
      FROM 
        runing_info_entity
      WHERE 
        id = ?`;

    const currentEntityResult = await entityManager.query(currentEntityQuery, [
      id,
    ]);

    if (currentEntityResult.length === 0) {
      return null;
    }

    let newEntityQuery = '';
    if (type === 'up') {
      // 현재 id보다 큰 id를 가진 항목 중 step번째 항목 찾기
      newEntityQuery = `
        SELECT 
          id,
          testType,
          lock_status,
          traySlot,
          barcodeNo,
          patientId,
          patientNm,
          analyzedDttm,
          tactTime,
          submitState,
          submitOfDate,
          slotNo,
          cassetId,
          slotId,
          orderDttm,
          gender,
          birthDay,
          isNormal,
          classInfo,
          submitUserId,
          memo,
          pcIp,
          cbcPatientNo,
          cbcPatientNm,
          cbcSex,
          cbcAge,
          img_drive_root_path
        FROM 
          runing_info_entity
        WHERE 
          id > ?
        ORDER BY 
          id ASC
        LIMIT 1 OFFSET ?`;
    } else if (type === 'down') {
      // 현재 id보다 작은 id를 가진 항목 중 step번째 항목 찾기
      newEntityQuery = `
        SELECT 
          id,
          analyzedDttm,
          barcodeNo,
          birthDay,
          cassetId,
          cbcAge,
          cbcPatientNm,
          cbcPatientNo,
          cbcSex,
          gender,
          img_drive_root_path,
          isNormal,
          lock_status,
          orderDttm,
          patientId,
          patientNm,
          pcIp,
          slotId,
          slotNo,
          submitOfDate,
          submitState,
          submitUserId,
          tactTime,
          testType,
          traySlot,
          classInfo,
          memo
        FROM 
          runing_info_entity
        WHERE 
          id < ?
        ORDER BY 
          id DESC
        LIMIT 1 OFFSET ?`;
    }

    const newEntityResult = await entityManager.query(newEntityQuery, [
      id,
      step - 1,
    ]);

    if (newEntityResult.length > 0) {
      const result = newEntityResult[0];
      return {
        id: result.id,
        analyzedDttm: result.analyzedDttm,
        barcodeNo: result.barcodeNo,
        birthDay: result.birthDay,
        cassetId: result.cassetId,
        cbcAge: result.cbcAge,
        cbcPatientNm: result.cbcPatientNm,
        cbcPatientNo: result.cbcPatientNo,
        cbcSex: result.cbcSex,
        gender: result.gender,
        img_drive_root_path: result.img_drive_root_path,
        isNormal: result.isNormal,
        lock_status: result.lock_status,
        orderDttm: result.orderDttm,
        patientId: result.patientId,
        patientNm: result.patientNm,
        pcIp: result.pcIp,
        slotId: result.slotId,
        slotNo: result.slotNo,
        submitOfDate: result.submitOfDate,
        submitState: result.submitState,
        submitUserId: result.submitUserId,
        tactTime: result.tactTime,
        testType: result.testType,
        traySlot: result.traySlot,
        classInfo: result.classInfo,
        memo: result.memo,
      } as Partial<RunningInfoEntity>;
    } else {
      return null;
    }
  }

  async updatePcIpAndState(
    oldPcIp: string,
    newEntityId: number,
    newPcIp: string,
  ): Promise<void> {
    // 동일한 pcIp를 가진 모든 엔티티 업데이트
    await this.runingInfoEntityRepository.update(
      { pcIp: oldPcIp },
      { pcIp: '', lock_status: false },
    );

    // 새로운 엔티티 업데이트
    await this.runingInfoEntityRepository.update(
      { id: newEntityId },
      { pcIp: newPcIp, lock_status: true },
    );
  }

  async clearPcIpAndState(oldPcIp: string): Promise<void> {
    await this.runingInfoEntityRepository.update(
      { pcIp: oldPcIp },
      { pcIp: '', lock_status: false },
    );
  }

  async redisAllClear(): Promise<void> {
    this.redis.flushall();
  }

  private cleanBrowserCache() {
    return new Promise((resolve, reject) => {
      exec(
        'powershell.exe -Command "Get-ChildItem \\"$env:LOCALAPPDATA\\Microsoft\\Edge\\User Data\\" -Directory | ForEach-Object { Remove-Item -Path \\"$($_.FullName)\\Cache\\Cache_Data\\f_*\\" -Recurse -ErrorAction SilentlyContinue }"',
        (error, stdout, stderr) => {
          if (error) {
            return reject(error);
          }
          if (stderr) {
            console.log(`browser cache clean warning: ${stderr}`);
          }
          resolve(stdout);
        },
      );
    });
  }
}
