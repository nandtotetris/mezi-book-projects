import * as uuid from 'uuid';
import * as mime from 'mime-types';
import { Injectable } from '@nestjs/common';
import { File } from '../common/interfaces/file.interface';
import { AbstractStorageService } from './abstract-storage.service';

@Injectable()
export class InvoiceStorageService {
  constructor(
    private readonly fileStorageService: AbstractStorageService
  ) {}

  public async upload(file: File, companyId: string) {
    const fileExtension = mime.extension(file.mimetype);
    const filePath = `companies/${companyId}/invoices/${uuid.v4()}.${fileExtension}`;

    return this.fileStorageService.upload(file, filePath);
  }
}
