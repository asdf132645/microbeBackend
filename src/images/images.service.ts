// images.service.ts

import { Injectable, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import * as sharp from 'sharp';
import * as Jimp from 'jimp';

@Injectable()
export class ImagesService {
  constructor() {}

  async getImageWbc(folder: string, imageName: string, res: Response) {
    if (!folder || !imageName) return res.status(HttpStatus.BAD_REQUEST).send('Invalid parameters');

    const absoluteImagePath = path.join(folder, imageName);

    try {
      if (!fs.existsSync(absoluteImagePath)) {
        console.error('File does not exist:', absoluteImagePath);
        return res.status(HttpStatus.NOT_FOUND).send('File not found');
      }

      const imageBuffer = await this.convertImageToWebP(absoluteImagePath);

      res.setHeader('Content-Type', 'image/webp');
      res.send(imageBuffer);

    } catch (error) {
      if (error.code === 'ENOENT') {
        return res.status(HttpStatus.NOT_FOUND).send('File not found');
      }

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Image processing failed');
    }
  }

  private convertImageToWebP = async (imagePath: string): Promise<Buffer> => {
    try {
      const image = await Jimp.read(imagePath);

      // 이미지 너비 조정 (높이는 비율에 맞게 자동 조정)
      const originalWidth = image.bitmap.width;
      const originalHeight = image.bitmap.height;
      const newWidth = 900;
      const newHeight = Math.round((originalHeight / originalWidth) * newWidth);

      // 이미지 리사이즈 및 WebP로 변환
      const resizedImage = image
        .resize(newWidth, newHeight)  // 너비 900으로 고정, 높이 비율 유지
        .quality(60);  // 품질 설정 (0-100, 낮을수록 파일 크기 감소)

      // WebP 버퍼로 변환
      const pngBuffer = await resizedImage.getBufferAsync(Jimp.MIME_PNG);
      return await sharp(pngBuffer).webp({ quality: 80}).toBuffer();
    } catch (error) {
      console.error('Image conversion error:', error);
      throw new Error(`Failed to convert image: ${error.message}`);
    }
  }

  async convertImageToJPEG(imagePath: string): Promise<Buffer> {
    const image = await Jimp.read(imagePath);
    const buffer = await image.quality(60).getBufferAsync(Jimp.MIME_JPEG); // JPEG로 변환, 품질 설정 예시로 80%
    return buffer;
  }
}
