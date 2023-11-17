import { BufferedFile } from '@/common/types/buffer';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { MinioClient, MinioService } from 'nestjs-minio-client';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MinioClientService {
  private readonly logger: Logger;
  private readonly baseBucket: string;

  constructor(
    private readonly minio: MinioService,
    private readonly configService: ConfigService,
  ) {
    this.logger = new Logger('MinioStorageService');
    this.baseBucket = this.configService.get('MINIO_BUCKET');
  }

  public get client(): MinioClient {
    return this.minio.client;
  }

  public async upload(
    file: BufferedFile,
    baseBucket: string = this.baseBucket,
  ) {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new HttpException('Unsupported file type', HttpStatus.BAD_REQUEST);
    }

    const tempFilename = Date.now().toString();
    const hashedFileName = crypto
      .createHash('md5')
      .update(tempFilename)
      .digest('hex');
    const ext = file.originalname.substring(file.originalname.lastIndexOf('.'));
    const filename = hashedFileName + ext;

    await new Promise<void>((resolve, reject) => {
      this.client.putObject(baseBucket, filename, file.buffer, (err) => {
        if (err) {
          reject(
            new HttpException('Error uploading file', HttpStatus.BAD_REQUEST),
          );
        } else {
          resolve();
        }
      });
    });

    return {
      url: `${this.configService.get('MINIO_DOMAIN')}:${this.configService.get(
        'MINIO_PORT',
      )}/${this.baseBucket}/${filename}`,
    };
  }

  public async delete(
    objectName: string,
    baseBucket: string = this.baseBucket,
  ) {
    await new Promise<void>((resolve, reject) => {
      this.client.removeObject(baseBucket, objectName, (err) => {
        if (err) {
          reject(
            new HttpException('Error deleting file', HttpStatus.BAD_REQUEST),
          );
        } else {
          resolve();
        }
      });
    });
  }
}
