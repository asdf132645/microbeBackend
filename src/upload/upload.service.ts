import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import * as fs from 'fs-extra';
import * as path from 'path';
import { RunningInfoEntity } from '../runingInfo/runningInfo.entity';
import { UploadDto } from './upload.dto';
import { LoggerService } from '../logger.service';
import { exec, spawn } from 'child_process';
import * as os from 'os';
import { CombinedService } from '../combinedProtocol/combined.service';

const userInfo = os.userInfo();

@Injectable()
export class UploadService {
  private moveResults = { success: 0, total: 0 };
  private readonly pythonScriptPath = `${userInfo.homedir}\\AppData\\Local\\Programs\\UIMD\\UIMD_download_upload_tool\\move_files.exe`;

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(RunningInfoEntity)
    private readonly runningInfoRepository: Repository<RunningInfoEntity>,
    private readonly logger: LoggerService,
    private readonly combinedService: CombinedService,
  ) {}

  private listDirectoriesInFolder = async (
    folderPath: string,
  ): Promise<string[]> => {
    const folderNamesArr = [];
    try {
      // 폴더 내 모든 파일과 디렉토리의 목록을 가져옵니다.
      const items = await fs.readdir(folderPath);

      // 각 항목의 경로를 생성하고, 디렉토리인지 확인합니다.
      for (const item of items) {
        const itemPath = path.join(folderPath, item);
        const stats = await fs.stat(itemPath);

        // 디렉토리인 경우 폴더 이름을 출력합니다.
        if (stats.isDirectory()) {
          folderNamesArr.push(item);
        }
      }

      return folderNamesArr;
    } catch (error) {
      this.logger.logic(`[Upload] Error reading directories: ${error}`);
      return [];
    }
  };

  private getInsertStatement = (filePath: string) => {
    const sql = fs.readFileSync(filePath, 'utf8');
    const statements = sql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    return statements.filter((s) => s.toUpperCase().startsWith('INSERT INTO'));
  };

  private getCreateTableStatement = (sql: string) => {
    // CREATE TABLE 부분 추출
    const createTableRegex =
      /CREATE TABLE `runing_info_entity` \(([\s\S]*?)\)\s*ENGINE=[^\s]+/;
    const match = sql.match(createTableRegex);

    let createTableStatement = match[0];

    createTableStatement = createTableStatement.replace(
      /CREATE TABLE `runing_info_entity`/,
      'CREATE TABLE IF NOT EXISTS `restore_runing_info_entity`',
    );

    const engineMatch = createTableStatement.match(/ ENGINE=InnoDB/);
    createTableStatement = createTableStatement.replace(engineMatch[0], ';');

    return createTableStatement;
  };

  private createTemporaryTable = async (filePath: string) => {
    let sql = fs.readFileSync(filePath, 'utf8');

    // DROP TABLE 구문을 제거
    const dropTableMatch = sql.match(
      /DROP TABLE IF EXISTS `runing_info_entity`;/,
    );
    if (dropTableMatch) {
      sql = sql.replace(dropTableMatch[0], '');
    }

    let createTableStatement = this.getCreateTableStatement(sql);
    createTableStatement = createTableStatement.replace(
      /CREATE TABLE `runing_info_entity`/,
      'CREATE TABLE IF NOT EXISTS `restore_runing_info_entity`',
    );
    await this.dataSource.query(createTableStatement);

    const insertStatements = this.getInsertStatement(filePath);
    for (let insertStatement of insertStatements) {
      insertStatement = insertStatement.replace(
        /INSERT INTO `runing_info_entity`/,
        'INSERT INTO `restore_runing_info_entity`',
      );
      await this.dataSource.query(insertStatement);
    }
  };

  private cleanNpmCache() {
    return new Promise((resolve, reject) => {
      exec('npm cache clean --force', (error, stdout, stderr) => {
        if (error) {
          return reject(error);
        }
        if (stderr) {
          console.log(`npm cache clean warning: ${stderr}`);
        }
        resolve(stdout);
      });
    });
  }

  private moveDataToDatabase = async () => {
    const restoreSql = `SELECT * FROM restore_runing_info_entity`;
    const items = await this.dataSource.query(restoreSql);

    const slotIds = items.map((item) => item?.slotId);

    const existingItems = await this.runningInfoRepository.find({
      where: { slotId: In(slotIds) },
      select: ['slotId'],
    });

    const existingSlotIdSet = new Set(existingItems.map((item) => item.slotId));

    const itemsToSave = items
      .filter((item) => !existingSlotIdSet.has(item?.slotId))
      .map((item) => ({
        slotNo: item.slotNo,
        traySlot: item.traySlot,
        testType: item.testType,
        barcodeNo: item.barcodeNo,
        patientId: item.patientId,
        patientNm: item.patientNm,
        gender: item.gender,
        birthDay: item.birthDay,
        slotId: item.slotId,
        orderDttm: item.orderDttm,
        analyzedDttm: item.analyzedDttm,
        tactTime: item.tactTime,
        isNormal: item.isNormal,
        cassetId: item.cassetId,
        memo: item.memo,
        classInfo: item.classInfo,
        submitState: item.submitState,
        submitOfDate: item.submitOfDate,
        submitUserId: item.submitUserId,
        pcIp: item.pcIp,
        cbcPatientNo: item.cbcPatientNo,
        cbcPatientNm: item.cbcPatientNm,
        cbcSex: item.cbcSex,
        cbcAge: item.cbcAge,
        img_drive_root_path: null,
        lock_status: 0,
      }));

    // 일괄 삽입 처리
    if (itemsToSave.length > 0) {
      await this.runningInfoRepository.save(itemsToSave);
    }
  };

  // 업로드 가능 여부 체크 함수
  private checkDuplicatedInDatabase = async () => {
    const restoreSql = `SELECT slotId, barcodeNo FROM restore_runing_info_entity`;

    const items = await this.dataSource.query(restoreSql);
    const slotIds = items.map((item) => item.slotId);
    const existingItemsInDB = await this.runningInfoRepository.find({
      where: { slotId: In(slotIds) },
    });

    const existingSlotIdSet = new Set(
      existingItemsInDB.map((item) => item.slotId),
    );

    const duplicatedSlotIdArr = [];
    const nonDuplicatedSlotIdArr = [];

    for (const item of items) {
      if (existingSlotIdSet.has(item.slotId)) {
        duplicatedSlotIdArr.push(item.barcodeNo);
      } else {
        nonDuplicatedSlotIdArr.push(item.barcodeNo);
      }
    }

    // 겹치는 데이터가 없는 경우 다음 Upload API를 호출하기 때문에 total값과 success값을 준비
    if (duplicatedSlotIdArr.length === 0) {
      this.moveResults.success = 0;
      this.moveResults.total = nonDuplicatedSlotIdArr.length;
    }

    return {
      duplicated: duplicatedSlotIdArr,
      nonDuplicated: nonDuplicatedSlotIdArr,
      totalMove: this.moveResults.total,
      successMove: this.moveResults.success,
    };
  };

  // Upload 할때 생성한 temp DB 테이블 삭제 함수
  private deleteTemporaryTable = async () => {
    const deleteTableSql = 'DROP TABLE IF EXISTS `restore_runing_info_entity`';
    await this.dataSource.query(deleteTableSql);
  };

  private deleteImageFolder = async (folderPath: string) => {
    if (await fs.pathExists(folderPath)) {
      try {
        fs.removeSync(folderPath);
      } catch (e) {
        this.logger.logic(`[Upload] Error(Remained Image Folder): ${e}`);
      }
    }
  };

  private updateImgDriveRootPath = async (
    availableIds: string[],
    destinationUploadPath: string,
  ) => {
    const convertedDestinationUploadPath = destinationUploadPath.replace(
      '\\',
      '\\\\',
    );
    for (const id of availableIds) {
      const query = `UPDATE runing_info_entity SET img_drive_root_path = '${convertedDestinationUploadPath}' WHERE (id = '${id}');`;
      await this.dataSource.query(query);
    }
  };

  // 이미지 이동은 파이썬 실행파일을 사용
  private runPythonScript(task: any, uploadType: string) {
    const { source, destination } = task;

    const convertedSource = source.replaceAll('\\', '/');
    const convertedDestination = destination.replaceAll('\\', '/');

    return new Promise((resolve, reject) => {
      const result = spawn(`${this.pythonScriptPath}`, [
        convertedSource,
        convertedDestination,
        uploadType,
      ]);

      // 표준 출력 (stdout) 로그 출력
      result.stdout.on('data', (data) => {
        console.log(`Output: ${data}`);
      });

      // 표준 에러 (stderr) 로그 출력
      result.stderr.on('data', (data) => {
        console.error(`Error: ${data}`);
      });

      // 프로세스가 완료되면 실행되는 콜백
      result.on('close', (code) => {
        this.moveResults.success++;
        console.log('close code', code);
        resolve(null);
      });

      // 프로세스 실행 에러 발생 시
      result.on('error', (err) => {
        reject(err);
      });
    });
  }

  private moveImages = async (
    fileNames: string[],
    originUploadPath: string,
    destinationUploadPath: string,
    uploadType: 'copy' | 'move',
  ) => {
    const availableFileNames = [];
    const availableIds = [];

    const processFileName = async (fileName: string) => {
      try {
        const items: any[] = await this.runningInfoRepository.find({
          where: { slotId: fileName },
        });

        if (Array.isArray(items) && items[0]?.slotId) {
          availableFileNames.push(fileName);
          availableIds.push(items[0].id);
        } else {
          console.log(`Unexpected data format for slotId: ${fileName}`);
        }
      } catch (error) {
        console.log(error);
      }
    };

    await Promise.all(fileNames.map((fileName) => processFileName(fileName)));

    const queue = availableFileNames.map((slotId) => {
      const sourcePath = path.join(originUploadPath, slotId);
      const targetFolderPath = path.join(destinationUploadPath, slotId);
      return { source: sourcePath, destination: targetFolderPath, uploadType };
    });

    this.moveResults.total = availableFileNames.length;

    const promises = queue.map(
      async (task) => await this.runPythonScript(task, uploadType),
    );

    await Promise.all(promises);

    return availableIds;
  };

  async uploadOperation(fileInfo: UploadDto): Promise<string> {
    const {
      fileName,
      destinationUploadPath,
      originUploadPath,
      uploadType,
    } = fileInfo;

    await this.deleteTemporaryTable();

    const uploadDateFolderName = path.join(originUploadPath, fileName);

    fs.access(uploadDateFolderName, fs.constants.R_OK);
    const entries = await fs.readdir(uploadDateFolderName, {
      withFileTypes: true,
    });

    const sqlFileName = entries
      .filter((entry) => entry.name.includes('.sql'))
      .map((file) => file.name)[0];
    const sqlFilePath = `${uploadDateFolderName}\\${sqlFileName}`;

    try {
      if (!(await fs.pathExists(destinationUploadPath))) {
        await fs.ensureDir(destinationUploadPath);
      }

      if (!(await fs.pathExists(uploadDateFolderName))) {
        return 'Upload folder does not exist';
      }

      if (!(await fs.pathExists(sqlFilePath))) {
        return 'Upload file does not exist';
      }

      if (!(await fs.pathExists(destinationUploadPath))) {
        await fs.ensureDir(destinationUploadPath);
      }

      await this.cleanNpmCache();

      const folderNamesArr =
        await this.listDirectoriesInFolder(uploadDateFolderName);

      await this.dataSource.query(`USE mo_db_web`);

      await this.createTemporaryTable(sqlFilePath);

      await this.moveDataToDatabase();

      // 폴더 이동 전에 DB에 있는 폴더들만 이동
      const availableIds = await this.moveImages(
        folderNamesArr,
        uploadDateFolderName,
        destinationUploadPath,
        uploadType,
      );

      await this.updateImgDriveRootPath(availableIds, destinationUploadPath);

      await this.deleteTemporaryTable();

      if (uploadType === 'move') {
        await this.deleteImageFolder(uploadDateFolderName);
      }

      this.combinedService.sendIsDownloadUploadFinished('upload');

      return 'Upload completed successfully';
    } catch (e) {
      console.log(e);
    }
  }

  async checkDuplicatedData(fileInfo: UploadDto): Promise<any> {
    const { fileName, destinationUploadPath, originUploadPath } =
      fileInfo;

    await this.deleteTemporaryTable();

    const uploadDateFolderName = path.join(originUploadPath, fileName);

    fs.access(uploadDateFolderName, fs.constants.R_OK);
    const entries = await fs.readdir(uploadDateFolderName, {
      withFileTypes: true,
    });

    const sqlFileName = entries
      .filter((entry) => entry.name.includes('.sql'))
      .map((file) => file.name)[0];

    const sqlFilePath = `${uploadDateFolderName}\\${sqlFileName}`;

    try {
      if (!(await fs.pathExists(destinationUploadPath))) {
        await fs.ensureDir(destinationUploadPath);
      }

      if (!(await fs.pathExists(uploadDateFolderName))) {
        return 'Download folder does not exist';
      }

      if (!(await fs.pathExists(sqlFilePath))) {
        return 'Download file does not exist';
      }

      await this.dataSource.query(`USE mo_db_web`);

      await this.createTemporaryTable(sqlFilePath);

      return await this.checkDuplicatedInDatabase();
    } catch (e) {
      this.logger.logic(`[UPLOAD] Error: ${e}`);
      return `Invalid access`;
    }
  }

  async checkPossibleUploadFile(
    fileInfo: Pick<UploadDto, 'originUploadPath'>,
  ): Promise<any> {
    const { originUploadPath } = fileInfo;

    // 백업 폴더 없을 경우
    if (!(await fs.pathExists(originUploadPath))) {
      return { success: false, message: 'Download folder does not exits' };
    }

    try {
      fs.access(originUploadPath, fs.constants.R_OK);
      const entries = await fs.readdir(originUploadPath, {
        withFileTypes: true,
      });

      const topLevelDirectories = entries
        .filter((entry) => entry.isDirectory())
        .map((dir) => dir.name);

      return topLevelDirectories;
    } catch (error) {
      return { success: false, message: 'Error reading download path' };
    }
  }
}
