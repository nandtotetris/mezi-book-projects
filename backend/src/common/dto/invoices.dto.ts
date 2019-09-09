import * as fs from 'fs';
import { Company } from '../entities/company.entity';
import { IsNotEmpty, IsString, IsCurrency, IsNumber, IsDate, Length } from 'class-validator';

interface File {
  createReadStream: fs.ReadStream;
  filename: string;
  mimetype: string;
  encoding: string;
}

export class CreateInvoiceDto {
  @IsNotEmpty()
  file: File;
}

export class UpdateInvoiceDto {
  @IsNotEmpty()
  @IsString()
  receiverTitle: string;

  @IsNotEmpty()
  @IsString()
  number: string;

  // @IsNotEmpty()
  // @IsString()
  // @Length(14, 34)
  // iban: string;

  @IsNotEmpty()
  @IsString()
  @IsCurrency()
  currency: string;

  @IsNotEmpty()
  @IsNumber()
  total: number;

  @IsNotEmpty()
  @IsNumber()
  totalWoT: number;

  @IsNotEmpty()
  @IsDate()
  dueDate: Date;

  @IsNotEmpty()
  @IsDate()
  invoiceDate: Date;

  @IsNotEmpty()
  companyEmitter: Company;
}
