import * as fs from 'fs';
import * as path from 'path';
import { File } from '../common/interfaces/file.interface';
import { AbstractStorageService } from './abstract-storage.service';

const ensureDirectoryExistence = (filePath: string) => {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }

  fs.mkdirSync(dirname, { recursive: true });
};

export class LocalStorageService extends AbstractStorageService {
  public async uploadImplementation(file: File, filePath: string) {
    const uri = path.join('/static', filePath);
    const localFilePath = path.join(process.cwd(), '/public', uri);
    ensureDirectoryExistence(localFilePath);
    const fsStream = fs.createWriteStream(localFilePath);

    try {
      await new Promise((resolve, reject) => {
        file.createReadStream()
          .pipe(fsStream)
          .on('error', reject)
          .on('finish', resolve);
      });
      const baseUrl = `http://localhost:${process.env.PORT || 9000}`;

      return Promise.resolve({fileLocation: `${baseUrl}${uri}`});
    } catch (err) {
      throw new Error(err);
    }
  }
}
