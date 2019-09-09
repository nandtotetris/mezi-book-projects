import { Module, Logger } from '@nestjs/common';
import { InvoiceStorageService } from './invoice-storage.service';
import { LocalStorageService } from './local-storage.service';
import { AbstractStorageService } from './abstract-storage.service';
import { AWSStorageService } from './aws-storage.service';
import { LogoStorageService } from './logo-storage.service';
import { RibStorageService } from './rib-storage.service';
import { ExportStorageService } from './export-storage.service';

const fileStorageServiceProvider = {
  provide: AbstractStorageService,
  useClass:
    process.env.NODE_ENV === 'development'
      ? LocalStorageService
      : AWSStorageService,
};

@Module({
  providers: [Logger, fileStorageServiceProvider, InvoiceStorageService, ExportStorageService, RibStorageService, LogoStorageService],
  exports: [fileStorageServiceProvider, InvoiceStorageService, ExportStorageService, RibStorageService, LogoStorageService],
})
export class StorageModule {}
