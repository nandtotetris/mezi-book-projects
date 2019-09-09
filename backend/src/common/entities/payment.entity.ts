import { Entity, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { Invoice } from './invoice.entity';
import { User } from './user.entity';
import { Base } from './base.entity';
import { Payin } from './payin.entity';

// List of payment statuses
export enum PaymentStatus {
  REQUESTED                          = 'REQUESTED',
  BEING_PROCESSED                    = 'BEING_PROCESSED',
  TREEZOR_PENDING                    = 'TREEZOR_PENDING',
  TREEZOR_SYNC_KO_NOT_ENOUGH_BALANCE = 'TREEZOR_SYNC_KO_NOT_ENOUGH_BALANCE',
  TREEZOR_SYNC_KO_MISC               = 'TREEZOR_SYNC_KO_MISC',
  TREEZOR_WH_KO_NOT_ENOUGH_BALANCE   = 'TREEZOR_WH_KO_NOT_ENOUGH_BALANCE',
  TREEZOR_WH_KO_MISC                 = 'TREEZOR_WH_KO_MISC',
  TREEZOR_WH_VALIDATED               = 'TREEZOR_WH_VALIDATED',
  CANCELLED                          = 'CANCELLED',
}

// List of payment statuses to retrieve active payments
export const getStatusLibeoBalance = [
  PaymentStatus.REQUESTED,
  PaymentStatus.BEING_PROCESSED,
  PaymentStatus.TREEZOR_SYNC_KO_NOT_ENOUGH_BALANCE,
  PaymentStatus.TREEZOR_SYNC_KO_MISC,
  PaymentStatus.TREEZOR_WH_KO_NOT_ENOUGH_BALANCE,
  PaymentStatus.TREEZOR_WH_KO_MISC,
];

@Entity()
export class Payment extends Base {
  // Invoice attached to the payment
  @ManyToOne(type => Invoice)
  invoice: Invoice;

  // Payment status
  @Column({ type: 'simple-enum', enum: PaymentStatus, default: PaymentStatus.REQUESTED })
  status: PaymentStatus;

  // Amount of the transfer
  @Column({ nullable: true, type: 'double precision' })
  amount: number;

  // ISO Code of the payment currency
  @Column({ nullable: true })
  currency: string;

  // Specifies the balance estimated by Libeo once the payment has been made
  @Column({ nullable: true, type: 'double precision' })
  libeoEstimatedBalance: number;

  // ID of the user who requested the payment
  @ManyToOne(type => User)
  paymentRequestUser: User;

  // Cancellation date (if existing)
  @Column({ nullable: true })
  cancellationRequestAt: Date;

  // ID of the user who requested the cancellation of the payment
  @ManyToOne(type => User, { nullable: true })
  cancellationRequestUser: User;

  // Deferred payment date
  @Column({ nullable: true })
  paymentAt: Date;

  // Date sent to Treezor
  @Column({ nullable: true })
  treezorRequestAt: Date;

  // ID returned by Treezor for the payment
  @Column({ nullable: true })
  treezorPayoutId: number;

  // Date on which payment was made
  @Column({ nullable: true })
  treezorValidationAt: Date;

  // ID Treezor of the wallet to be debited
  @Column({ nullable: true })
  treezorPayerWalletId: number;

  // ID Treezor of the beneficiary's bank account
  @Column({ nullable: true })
  treezorBeneficiaryId: number;

  @OneToOne(type => Payin, { onDelete: 'SET NULL' })
  @JoinColumn()
  payin: Payin;
}
