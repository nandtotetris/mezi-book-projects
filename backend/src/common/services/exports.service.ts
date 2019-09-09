import * as fastcsv from 'fast-csv';
import * as fs from 'fs';
import * as uuid from 'uuid';
import * as path from 'path';
import * as moment from 'moment';
import { Repository } from 'typeorm';
import { Injectable, HttpException, HttpStatus, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Export } from '../entities/export.entity';
import { Company } from '../entities/company.entity';
import { AccountingEntry } from '../entities/accounting-entry.entity';
import { AccountingEntryRepository } from '../repositories/accounting-entry.repository';
import { List } from '../interfaces/common.interface';
import { ExportStorageService } from '../../storage/export-storage.service';
import { File } from '../interfaces/file.interface';

@Injectable()
export class ExportsService {
  constructor(
    @InjectRepository(Export)
    private readonly exportRepository: Repository<Export>,
    @InjectRepository(AccountingEntry)
    private readonly accountingEntryRepository: AccountingEntryRepository,
    private readonly exportStorageService: ExportStorageService,
  ) {}

  /**
   * Generate CSV
   *
   * @param   {Company}  company  - Current company user
   *
   * @return  {Promise<string>}   - Returns url of export file
   */
  public async generate(company: Company): Promise<string> {
    if (!company) {
      throw new NotFoundException('api.error.company.not_found');
    }

    const fileName: string = `export-${uuid.v4()}.csv`;
    const headers: string[] = ['Date', 'Code journal', 'Libellé journal', 'Code compte', 'Label écriture', 'Ref écriture', 'Sens', 'Montant', 'Devise'];
    const accountingEntries: AccountingEntry[] = await this.accountingEntryRepository.findByCompanyAndExportIdEmpty(company);
    const data = accountingEntries.map(entry => {
      return [
        moment(entry.entryDate).format('DD/MM/YYYY'),
        (entry.ledger && entry.ledger.value) ? entry.ledger.value : '',
        (entry.ledger && entry.ledger.key) ? entry.ledger.key : '',
        (entry.account && entry.account.value) ? entry.account.value : '',
        entry.entryLabel || '',
        entry.entryRef || '',
        entry.postingType || '',
        entry.entryAmount || 0,
        entry.entryCurrency || '',
      ];
    });

    data.unshift(headers);

    try {
      await new Promise((resolve, reject) => {
        fastcsv
          .writeToPath(path.resolve(fileName), data, { headers: true })
          .on('error', reject)
          .on('finish', resolve);
      });
    } catch (err) {
      throw new BadRequestException('api.error.export.generate');
    }

    try {
      const createReadStream = () => {
        return fs.createReadStream(fileName);
      };
      const file: File = { createReadStream, filename: fileName, mimetype: 'text/csv', encoding: null };
      const { fileLocation } = await this.exportStorageService.upload(file, company.id);
      await fs.unlinkSync(fileName);
      await this.exportRepository.save(this.exportRepository.create({
        company,
        enabled: true,
        fileLink: fileLocation,
      }));

      return fileLocation;
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  /**
   * Get all export by company
   *
   * @param   {Company}        company  - Current company user
   * @param   {string}         orderBy  - Order, in which entities should be ordered (Optional)
   * @param   {number}         limit    - Limit (paginated) - max number of entities should be taken (Optional)
   * @param   {number}         offset   - Offset (paginated) where from entities should be taken (Optional)
   *
   * @return  {Promise<List>}           - Returns a list of export
   */
  public async findByCompany(company: Company, orderBy?: string, limit?: number, offset?: number): Promise<List> {
    if (!company) {
      throw new HttpException('api.error.company.not_found', HttpStatus.NOT_FOUND);
    }

    const [ rows, total ]: [ Export[], number ] = await this.exportRepository.findAndCount({ where: { company }, relations: ['company'], skip: offset, take: limit });

    return {
      total,
      rows,
    };
  }
}
