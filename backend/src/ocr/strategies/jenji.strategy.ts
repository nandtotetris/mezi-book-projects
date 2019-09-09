import * as fs from 'fs';
import * as url from 'url';
import * as https from 'https';
import * as rp from 'request-promise-native';
import * as path from 'path';
import { Config } from '../interfaces/config.interface';
import { Strategy } from '../interfaces/strategy.interface';

export class JenjiStrategy implements Strategy {
  private readonly config: Config;
  private file: any;

  constructor(config: Config) {
    this.config = config;
  }

  /**
   * Get basic token for API call
   */
  private getBasicToken(): string {
    return Buffer.from(this.config.username + ':' + this.config.apiKey).toString('base64');
  }

  /**
   * Load file
   */
  public async loadFile(filePath: string): Promise<any> {
    if (filePath.indexOf('http://localhost') !== -1) {
      const localFilePath = filePath.replace('http://localhost:9000/static/', '');
      const completeFilePath = path.join(process.cwd(), '/public/static', localFilePath.substring(1, localFilePath.length));
      return new Promise((resolve, reject) => {
        this.file = fs.createReadStream(completeFilePath);
        this.file.on('open', resolve);
        this.file.on('error', reject);
      });
    } else {
      return new Promise((resolve, reject) => {
        https.get(filePath, res => {
          this.file = res;
          resolve();
        });
      });
    }
  }

  /**
   * Get data of API
   */
  public async getData(): Promise<any> {
    const defaultOptions = {
      json: true,
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + this.getBasicToken(),
        'Content-Type': 'multipart/form-data',
      },
      formData: {
        file: this.file,
      },
    };

    return Promise.all([
      rp(Object.assign({ uri: url.resolve(this.config.baseUrl, '/s/extract/multipart') }, defaultOptions)),
      rp(Object.assign({ uri: url.resolve(this.config.baseUrl, '/s/raw/multipart') }, defaultOptions)),
    ]);
  }
}
