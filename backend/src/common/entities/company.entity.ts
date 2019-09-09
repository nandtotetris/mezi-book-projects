import { Entity, Column, OneToMany, ManyToOne } from 'typeorm';
import { Address } from './address.entity';
import { Contact } from './contact.entity';
import { Partner } from './partner.entity';
import { User } from './user.entity';
import { Base } from './base.entity';
import { encrypt } from '../value-transformer/encrypt.value-transformer';

export enum CompanyStatus {
  SELF = 'SELF',
  ALREADY = 'ALREADY',
  EXIST = 'EXIST',
  UNKNOWN = 'UNKNOWN',
}

export enum CompanyKycStatus {
  PENDING = 'PENDING',
  VALIDATED = 'VALIDATED',
  REFUSED = 'REFUSED',
}

export enum CompanyKycLevel {
  LIGHT = 'LIGHT',
  REGULAR = 'REGULAR',
  REFUSED = 'REFUSED',
}

export enum CompanySource {
  ORIGINAL = 'ORIGINAL',
  MANUAL = 'MANUAL',
}

export enum CompanyCategory {
  PME = 'PME',
  ETI = 'ETI',
  GE = 'GE',
}

export enum CompanyProvisionningStrategies {
  TOPUP = 'TOPUP',
  AUTOLOAD = 'AUTOLOAD',
}

@Entity()
export class Company extends Base {
  // No persist
  status: CompanyStatus = CompanyStatus.UNKNOWN;

  // TODO Company Information

  @Column({ nullable: true, unique: true, length: 9 })
  siren: string;

  @Column({ nullable: true, length: 14 })
  siret: string;

  @Column({
    nullable: true,
    type: 'simple-enum',
    enum: CompanySource,
    default: CompanySource.ORIGINAL,
  })
  source: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  brandName: string;

  @Column({ nullable: true })
  vatNumber: string;

  @Column({ nullable: true })
  templatePreference: number;

  @Column({ nullable: true })
  logoUrl: string;

  @Column({ nullable: true })
  naf: string;

  @Column({ nullable: true })
  nafNorm: string;

  @Column({ nullable: true })
  numberEmployees: string;

  @Column({ nullable: true })
  incorporationAt: Date;

  @Column({ nullable: true })
  legalForm: string;

  @Column({ nullable: true, type: 'simple-enum', enum: CompanyCategory })
  category: string;

  @Column({ nullable: true })
  slogan: string;

  @Column({ nullable: true })
  domainName: string;

  // TODO Treezor information

  @Column({ nullable: true })
  capital: number;

  @Column({ nullable: true })
  legalAnnualTurnOver: string;

  @Column({ nullable: true })
  legalNetIncomeRange: string;

  @Column({ nullable: true, transformer: encrypt })
  phone: string;

  // TODO Company Information end

  // TODO Treezor Identity

  @Column({ nullable: true })
  treezorEmail: string;

  @Column({ nullable: true })
  treezorUserId: number;

  @Column({ nullable: true })
  treezorWalletId: number;

  @Column({ nullable: true })
  treezorIban: string;

  @Column({ nullable: true })
  treezorBic: string;

  // TODO TreezorAccountFrozen
  @Column({ nullable: true, default: false })
  isFreezed: boolean;

  // TODO est-ce qu'on vire cet email ?
  @Column({ nullable: true })
  libeoEmail: string;

  @OneToMany(type => Address, address => address.company, { cascade: true })
  addresses: Address[];

  @OneToMany(type => Contact, contact => contact.company, { cascade: true })
  contacts: Contact[];

  @OneToMany(type => Partner, partner => partner.companyPartner)
  partners: Partner[];

  @ManyToOne(type => User)
  claimer: User;

  // TODO KYC information

  @Column({ nullable: true, type: 'simple-enum', enum: CompanyKycStatus })
  kycStatus: CompanyKycStatus;

  @Column({ nullable: true, type: 'simple-enum', enum: CompanyKycLevel })
  kycLevel: CompanyKycLevel;

  @Column({ nullable: true })
  kycComment: string;

  @Column({ nullable: true })
  kycStep: string;

  // TODO signature = KYC Signature

  @Column({ nullable: true, type: 'simple-json' })
  signature: any;

  @Column({ nullable: true, type: 'simple-enum', enum: CompanyProvisionningStrategies, default: CompanyProvisionningStrategies.TOPUP })
  provisionningStrategy: CompanyProvisionningStrategies;

  @Column({ nullable: true, default: 0 })
  sddeRefusedCount: number;

  // Virtual setter
  set treezorKycLevel(kycLevel: string) {
    switch (kycLevel) {
      case '1':
        this.kycLevel = CompanyKycLevel.LIGHT;
        break;
      case '2':
        this.kycLevel = CompanyKycLevel.REGULAR;
        break;
      case '4':
        this.kycLevel = CompanyKycLevel.REFUSED;
        break;
      default:
        break;
    }
  }
}
