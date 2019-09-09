import { Entity, Column, ManyToOne } from 'typeorm';
import { Base } from './base.entity';
import { BankAccount } from './bank-account.entity';
import { User } from './user.entity';

export enum MandateStatus {
  PENDING = 'PENDING',
  VALIDATED = 'VALIDATED',
  SIGNED = 'SIGNED',
  CANCELED = 'CANCELED',
}

@Entity()
export class Mandate extends Base {
  @ManyToOne(type => BankAccount, bankAccount => bankAccount.mandates)
  bankAccount: BankAccount;

  @Column({ nullable: true })
  treezorMandateId: string;

  @Column({ nullable: true })
  rum: string;

  @Column({ nullable: true })
  filePath: string;

  @Column({ type: 'simple-enum', enum: MandateStatus, nullable: true })
  status: MandateStatus;

  @ManyToOne(type => User)
  signatory: User;

  @Column({ nullable: true })
  signatoryIp: string;

  @Column({ nullable: true })
  validationCode: string;

  @Column({ nullable: true })
  signaturedAt: Date;
}
