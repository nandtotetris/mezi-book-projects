import { Entity, ManyToOne, Column } from 'typeorm';
import { Base } from './base.entity';
import { Company } from './company.entity';

export enum AccountingPreferenceType {
  LEDGER_BANK          = 'LEDGER_BANK',
  LEDGER_PURCHASE      = 'LEDGER_PURCHASE',
  LEDGER_SALES         = 'LEDGER_SALES',
  LEDGER_MISC          = 'LEDGER_MISC',
  VAT_ACCOUNT          = 'VAT_ACCOUNT',
  VENDOR_ACCOUNT       = 'VENDOR_ACCOUNT',
  PURCHASE_ACCOUNT     = 'PURCHASE_ACCOUNT',
  BANK_ACCOUNT         = 'BANK_ACCOUNT',
  BANK_ACCOUNT_TREEZOR = 'BANK_ACCOUNT_TREEZOR',
}

@Entity()
export class AccountingPreference extends Base {
  @ManyToOne(type => Company, { nullable: true })
  company: Company;

  @Column()
  key: string;

  @Column()
  value: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'simple-enum', enum: AccountingPreferenceType, default: AccountingPreferenceType.LEDGER_PURCHASE })
  type: AccountingPreferenceType;

  @Column({ default: true })
  enabled: boolean;

  @Column({ default: 0 })
  order: number;
}
