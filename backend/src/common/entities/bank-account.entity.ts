import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { Company } from './company.entity';
import { Base } from './base.entity';
import { Iban } from './iban.entity';
import { Mandate } from './mandate.entity';

@Entity()
export class BankAccount extends Base {
  @Column()
  label: string;

  @Column({ default: true })
  default: boolean;

  @Column({ default: true })
  enabled: boolean;

  @ManyToOne(type => Company)
  company: Company;

  @ManyToOne(type => Iban)
  iban: Iban;

  @OneToMany(type => Mandate, mandate => mandate.bankAccount)
  mandates: Mandate[];
}
