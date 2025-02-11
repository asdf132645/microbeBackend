import {
  Controller,
  Get,
  Query,
  Res,
  HttpStatus,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
} from '@nestjs/common';
import { Response } from 'express';
import * as path from 'path';
import { FileInterceptor } from '@nestjs/platform-express';
import * as sharp from 'sharp';
import * as jimp from 'jimp';
import { ImagesService } from './images.service';
import * as fs from 'fs-extra';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Get()
  async getImage(
    @Query('folder') folder: string,
    @Query('imageName') imageName: string,
    @Res() res: Response,
  ) {
    if (!folder || !imageName) {
      return res.status(HttpStatus.BAD_REQUEST).send('Invalid parameters');
    }
    const absoluteImagePath = path.join(folder, imageName);

    try {
      const imageBuffer = await sharp(absoluteImagePath)
        .toFormat('webp', {
          quality: 10,
          nearLossless: true,
        })
        .resize({ width: 290, height: 290, fit: 'contain' })
        .toBuffer();
      // res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('Content-Type', 'image/webp');
      res.send(imageBuffer);
    } catch (error) {
      console.error('Error processing image:', error);
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send('Image processing error');
    }
  }

  @Get('print')
  async getPrintImage(
    @Query('folder') folder: string,
    @Query('imageName') imageName: string,
    @Res() res: Response,
  ) {
    if (!folder || !imageName) {
      return res.status(HttpStatus.BAD_REQUEST).send('Invalid parameters');
    }

    const absoluteImagePath = path.join(folder, imageName);
    try {
      // 파일 접근 - 1차 코드(되는 코드)
      fs.accessSync(absoluteImagePath, fs.constants.R_OK);
      const fileStream = fs.createReadStream(absoluteImagePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error('Error processing image:', error);
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send('Image processing error');
    }
  }

  @Get('getImageRealTime')
  getImageRealTime(
    @Query('folder') folder: string,
    @Query('imageName') imageName: string,
    @Res() res: Response,
  ) {
    if (!folder || !imageName) {
      return res.status(HttpStatus.BAD_REQUEST).send('Invalid parameters');
    }

    // 파일 경로를 절대 경로로 조합
    const absoluteImagePath = path.join(folder.replace(/\//g, '\\'), imageName);

    try {
      // 파일 접근 권한 확인
      fs.accessSync(absoluteImagePath, fs.constants.R_OK);
      sharp(absoluteImagePath)
        .resize({ width: 200 })
        .toBuffer()
        .then((imageBuffer) => {
          res.contentType('image/webp');
          res.send(imageBuffer);
        })
        .catch((error) => {
          res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .send('Image processing error');
        });
    } catch (error) {
      res
        .status(HttpStatus.NOT_FOUND)
        .send('File not found or permission issue');
    }
  }

  @Get('getStitchingImage')
  async getStitchingImage(
    @Query('folder') folder: string,
    @Query('imageName') imageName: string,
    @Res() res: Response,
  ) {
    if (!folder || !imageName) {
      return res.status(HttpStatus.BAD_REQUEST).send('Invalid parameters');
    }

    // 파일 경로를 절대 경로로 조합
    const absoluteImagePath = path.join(folder.replace(/\//g, '\\'), imageName);

    try {
      const image = await jimp.read(absoluteImagePath);
      const buffer = await image.getBufferAsync(jimp.MIME_PNG);
      const webpBuffer = await sharp(buffer)
        .toFormat('webp', { quality: 10, nearLossless: true })
        .toBuffer();

      res.setHeader('Content-Type', 'image/webp');
      res.send(webpBuffer);
    } catch (error) {
      console.error('Error processing image:', error);
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send('Image processing error');
    }
  }

  @Get('checkImageExists')
  checkImageExists(
    @Query('folder') folder: string,
    @Query('imageName') imageName: string,
    @Res() res: Response,
  ) {
    if (!folder || !imageName) {
      return res.status(HttpStatus.BAD_REQUEST).send('Invalid parameters');
    }

    // 파일 경로를 절대 경로로 조합
    const absoluteImagePath = path.join(folder.replace(/\//g, '\\'), imageName);

    try {
      // 파일 접근 권한 확인
      fs.accessSync(absoluteImagePath, fs.constants.R_OK);

      // 파일이 존재할 경우 200 OK 반환
      res.status(HttpStatus.OK).send('File exists');
    } catch (error) {
      // 파일이 없거나 권한 문제로 접근 불가할 경우 404 Not Found 반환
      res
        .status(HttpStatus.NOT_FOUND)
        .send('File not found or permission issue');
    }
  }

  @Get('getImageBySize')
  async getImageBySize(
    @Query('folder') folder: string,
    @Query('size') size: string,
    @Query('imageName') imageName: string,
    @Res() res: Response,
  ) {
    await this.imagesService.getImageBySize(folder, imageName, size, res);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(@UploadedFile() file) {
    // 저장할 디렉토리 설정
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    // 파일 저장
    const fileName = `${Date.now()}`;
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, file.buffer);

    // 저장된 파일 경로를 반환
    return { imagePath: filePath };
  }

  @Post('crop-image')
  async cropImage(@Body() requestBody: any, @Res() res: Response) {
    try {
      // 요청 바디로부터 좌표와 이미지 경로 가져오기
      const { startX, startY, endX, endY, originalImagePath, newImagePath } =
        requestBody;

      // 이미지 자르기
      await sharp(originalImagePath)
        .extract({
          left: startX,
          top: startY,
          width: endX - startX,
          height: endY - startY,
        })
        .toFile(newImagePath);

      // 저장한 새 이미지 경로 반환
      return res.status(200).send(newImagePath);
    } catch (error) {
      return res.status(500).send(error.message);
    }
  }
}
