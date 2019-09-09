import { Base } from './base.entity';
import { Column, ManyToOne, Entity } from 'typeorm';
import { Company } from './company.entity';

enum PayinType {
  SDDE = 'SDDE'
}

export enum PayinStatus {
  PENDING = 'PENDING',
  VALIDATED = 'VALIDATED',
  CANCELLED = 'CANCELLED'
}

@Entity()
export class Payin extends Base {
  @ManyToOne(type => Company)
  company: Company;

  @Column({ type: 'double precision' })
  amount: number;

  @Column()
  currency: string;

  @Column({ type: 'simple-enum', enum: PayinType, default: PayinType.SDDE })
  type: PayinType;

  @Column({ type: 'simple-enum', enum: PayinStatus, default: PayinStatus.PENDING })
  status: PayinStatus;

  @Column({ nullable: true })
  payinAt: Date;

  @Column({ nullable: true })
  treezorPayinId: number;

  @Column({ nullable: true })
  treezorCreatedAt: Date;

  @Column({ nullable: true })
  treezorValidationAt: Date;

  @Column({ nullable: true })
  treezorFundReceptionAt: Date;

  @Column({ nullable: true })
  treezorWalletId: number;

  @Column({ nullable: true })
  treezorResponse: string;
}
