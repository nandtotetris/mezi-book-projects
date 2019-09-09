import * as uuid from 'uuid';
import { Injectable } from '@nestjs/common';
import { File } from '../common/interfaces/file.interface';
import { AbstractStorageService } from './abstract-storage.service';

@Injectable()
export class ExportStorageService {
  constructor(
    private readonly fileStorageService: AbstractStorageService
  ) {}

  public async upload(file: File, companyId: string) {
    const filePath = `company/${companyId}/exports/${uuid.v4()}.csv`;

    return this.fileStorageService.upload(file, filePath);
  }
}
