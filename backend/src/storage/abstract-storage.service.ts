import { File } from '../common/interfaces/file.interface';
import { StorageServiceInterface } from './storage-strategy.interface';
import { Logger } from '@nestjs/common';

export class AbstractStorageService implements StorageServiceInterface {
  constructor(public readonly logger: Logger) {
    if (this.constructor === AbstractStorageService) {
      throw new TypeError('Abstract class "AbstractStorageService" cannot be instantiated directly');
    }
  }

  uploadImplementation(file: File, filePath: string): Promise<{ fileLocation: string }> {
    throw new Error('NOT IMPLEMENTED');
  }

  public async upload(file: File, filePath: string): Promise<{ fileLocation: string }> {
    try {
      const fileLocation = await this.uploadImplementation(file, filePath);
      return fileLocation;
    } catch (err) {
      this.logger.error(`Error during the upload ${filePath}`);
    }
  }
}
