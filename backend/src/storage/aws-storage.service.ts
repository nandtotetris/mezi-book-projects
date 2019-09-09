import * as aws from 'aws-sdk';
import { Logger, Injectable, Inject } from '@nestjs/common';
import { ConfigService } from 'nestjs-config';
import { File } from '../common/interfaces/file.interface';
import { AbstractStorageService } from './abstract-storage.service';

@Injectable()
export class AWSStorageService extends AbstractStorageService {
  private readonly AWSS3Service: any;
  private readonly bucket: string;

  constructor(
    config: ConfigService,
    public readonly logger: Logger,
  ) {
    super(logger);
    const awsConfig = config.get('aws');
    this.bucket = awsConfig.bucket;
    this.AWSS3Service = new aws.S3({
      accessKeyId: awsConfig.accessKeyId,
      secretAccessKey: awsConfig.secretAccessKey
    });
  }

  public async uploadImplementation(file: File, filePath: string) {
    try {
      const { fileLocation } = await new Promise((resolve, reject) => {
        this.AWSS3Service.upload({
          Bucket: this.bucket,
          Key: filePath,
          Body: file.createReadStream(),
          ContentType: file.mimetype,
        }, (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve({
              fileLocation: data.Location
            });
          }
        });
      });
      return { fileLocation };
    } catch (err) {
      this.logger.error(`Error during upload: ${err.message}`);
      throw err;
    }
  }
}
