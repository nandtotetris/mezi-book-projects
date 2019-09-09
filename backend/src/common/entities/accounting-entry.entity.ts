import { Base } from './base.entity';
import { Entity, Column, ManyToOne } from 'typeorm';
import { Company } from './company.entity';
import { Export } from './export.entity';
import { AccountingPreference } from './accounting-preference.entity';

export enum AccountingEntryType {
  INVOICE = 'INVOICE',
  PAYMENT = 'PAYMENT',
}

export enum AccountingEntryPostingType {
  CREDIT = 'CREDIT',
  DEBIT  = 'DEBIT',
}

@Entity()
export class AccountingEntry extends Base {
  @ManyToOne(type => Company)
  company: Company;

  @ManyToOne(type => AccountingPreference)
  ledger: AccountingPreference;

  @ManyToOne(type => AccountingPreference)
  account: AccountingPreference;

  @Column({ nullable: true, type: 'simple-enum', enum: AccountingEntryPostingType })
  postingType: AccountingEntryPostingType;

  @Column({ nullable: true })
  entryDate: Date;

  @Column({ nullable: true })
  entryRef: string;

  @Column({ nullable: true })
  entryLabel: string;

  @Column({ nullable: true, type: 'double precision' })
  entryAmount: number;

  @Column({ nullable: true })
  entryCurrency: string;

  @Column({ nullable: true, type: 'simple-enum', enum: AccountingEntryType })
  entryType: AccountingEntryType;

  @ManyToOne(type => Export, { nullable: true })
  export: Export;
}
