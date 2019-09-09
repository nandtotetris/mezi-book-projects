import { File } from '../common/interfaces/file.interface';

export interface StorageServiceInterface {
  uploadImplementation(file: File, filePath: string): Promise<{ fileLocation: string }>;
}
