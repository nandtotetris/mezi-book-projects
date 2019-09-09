import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Company } from './company.entity';
import { User } from './user.entity';
import { Iban } from './iban.entity';
import { AccountingPreference } from './accounting-preference.entity';

export enum InvoiceStatus {
  IMPORTING = 'IMPORTING',
  IMPORTED = 'IMPORTED',
  SCANNING = 'SCANNING',
  SCANNED = 'SCANNED',
  TO_PAY = 'TO_PAY',
  PLANNED = 'PLANNED',
  AR_DRAFT = 'AR_DRAFT',
  PAID = 'PAID',
}

export enum InvoiceExtension {
  JPG = 'image/jpg',
  JPEG = 'image/jpeg',
  GIF = 'image/gif',
  PNG = 'image/png',
  BMP = 'image/bmp',
  PDF = 'application/pdf',
}

@Entity()
export class Invoice extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(type => Company, { eager: true })
  companyEmitter: Company;

  @ManyToOne(type => Company, { nullable: false, eager: true })
  companyReceiver: Company;

  @ManyToOne(type => User, { eager: true })
  importedBy: User;

  @Column({
    type: 'simple-enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.IMPORTING,
  })
  status: InvoiceStatus;

  @Column({ nullable: true })
  receiverTitle: string | null;

  @Column({ nullable: true })
  emitterTitle: string | null;

  @Column({ nullable: true })
  number: string | null;

  @Column({ nullable: true })
  filepath: string | null;

  @Column({ nullable: true })
  filename: string | null;

  @ManyToOne(type => Iban, { eager: true })
  @JoinColumn()
  iban: Iban;

  @Column({ nullable: true })
  currency: string;

  @Column({ nullable: true, type: 'double precision' })
  total: number;

  @Column({ nullable: true, type: 'double precision' })
  totalWoT: number;

  @Column({ nullable: true })
  importAt: Date;

  @Column({ nullable: true })
  dueDate: Date;

  @Column({ nullable: true })
  invoiceDate: Date;

  @Column({ nullable: true, type: 'simple-json' })
  vatAmounts: any;

  @Column({ nullable: true, default: true })
  enabled: boolean;

  @Column({ nullable: true, default: false })
  error: boolean;

  @Column({ nullable: true })
  ocrStatus: string;

  @Column({ nullable: true })
  ocrPartner: string;

  @Column({ type: 'simple-json', nullable: true })
  ocrSirenFeedback: any;

  @Column({ type: 'simple-json', nullable: true })
  ocrFeedback: any;

  @Column({ nullable: true })
  code: string;

  @ManyToOne(type => User, { nullable: true })
  codeValidatedBy: User;

  @Column({ nullable: true })
  codeValidatedAt: Date;

  @ManyToOne(type => AccountingPreference, { eager: true, nullable: true })
  purchaseAccount: AccountingPreference;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // AR related fields
  @Column({ nullable: true })
  companyEmitterId: string;

  @Column({ type: 'simple-json', nullable: true })
  companyEmitterDetails: any;

  @Column({ type: 'simple-json', nullable: true })
  companyEmitterContactDetails: any;

  @Column({ nullable: true })
  companyReceiverId: string;

  @Column({ type: 'simple-json', nullable: true })
  companyReceiverDetails: any;

  @Column({ nullable: true })
  documentType: string;

  @Column({ nullable: true })
  invoiceDescription: string;

  @Column({ nullable: true, type: 'double precision' })
  discount: number;

  @Column({ type: 'int', nullable: true })
  templateId: number;

  @Column({ type: 'simple-json', nullable: true })
  displayLegalNotice: any;

  @Column({ type: 'simple-json', nullable: true })
  products: any;

  @Column({ nullable: true })
  arCreatedById: string;

  @Column({ nullable: true })
  source: string;
}
