import * as mime from 'mime-types';
import * as uuid from 'uuid';
import { Injectable } from '@nestjs/common';
import { File } from '../common/interfaces/file.interface';
import { AbstractStorageService } from './abstract-storage.service';

@Injectable()
export class LogoStorageService {
  constructor(
    private readonly fileStorageService: AbstractStorageService
  ) {}

  public async upload(file: File, companyId: string) {
    const fileExtension = mime.extension(file.mimetype);
    const filePath = `companies/${companyId}/logos/${uuid.v4()}.${fileExtension}`;

    return this.fileStorageService.upload(file, filePath);
  }
}
