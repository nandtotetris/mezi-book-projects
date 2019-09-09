import * as fs from 'fs';
import * as path from 'path';
import { JenjiStrategy } from './strategies/jenji.strategy';
import { HttpException, HttpStatus } from '@nestjs/common';

export class OcrService {
  private readonly strategy: any = null;
  private isLoadFile: boolean = false;

  constructor(type: string, config: any) {
    if (type === 'jenji') {
      this.strategy = new JenjiStrategy(config);
    }

    if (this.strategy === null) {
      throw new Error('api.error.ocr.strategy_not_found');
    }
  }

  /**
   * Load file
   */
  public async loadFile(filePath: string): Promise<any> {
    if (filePath.indexOf('http://localhost') !== -1) {
      const localFilePath = filePath.replace('http://localhost:9000/static/', '');
      const completeFilePath = path.join(process.cwd(), '/public/static', localFilePath.substring(1, localFilePath.length));
      if (!fs.existsSync(completeFilePath)) {
          throw new Error('api.error.ocr.file_not_found');
        }
      }

    try {
      await this.strategy.loadFile(filePath);
      this.isLoadFile = true;
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Get data of API call
   */
  public async getData(): Promise<any> {
    if (this.isLoadFile === false) {
      throw new Error('api.error.ocr.file_load');
    }

    return this.strategy.getData();
  }
}
