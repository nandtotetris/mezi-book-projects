import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, BaseEntity } from 'typeorm';
import { User } from './user.entity';
import { Company } from './company.entity';
import { encrypt } from '../value-transformer/encrypt.value-transformer';

export enum IbanStatus {
  PASSED    = 'passed',
  FAILED    = 'failed',
  BLACKLIST = 'blacklist',
  FAKE      = 'fake',
}

@Entity()
export class Iban extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, transformer: encrypt })
  iban: string;

  @ManyToOne(type => Company)
  readerCompany: Company;

  @Column({ nullable: true })
  treezorBeneficiaryId: number;

  @ManyToOne(type => User)
  createdBy: User;

  @ManyToOne(type => Company)
  company: Company;

  @Column({ nullable: true })
  result: string;

  @Column({ nullable: true })
  returnCode: number;

  @Column({ nullable: true })
  bic: string;

  @Column({ type: 'simple-json', nullable: true })
  bicCondidates: any;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  bankCode: string;

  @Column({ nullable: true })
  bank: string;

  @Column({ nullable: true })
  bankAddress: string;

  @Column({ nullable: true })
  branch: string;

  @Column({ nullable: true })
  branchCode: string;

  @Column({ nullable: true })
  inSclDirectory: string;

  @Column({ nullable: true })
  sct: string;

  @Column({ nullable: true })
  sdd: string;

  @Column({ nullable: true })
  cor1: string;

  @Column({ nullable: true })
  b2b: string;

  @Column({ nullable: true })
  scc: string;

  @Column({ type: 'simple-json', nullable: true })
  jsonIbanBic: any;

  @CreateDateColumn({ nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt: Date;
}
