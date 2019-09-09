import { ITreezorBasePayload, SortOrder } from './treezor-base-payload.interface';

export enum TransactionType {
  Payin          = 'Payin',
  Payout         = 'Payout',
  Transfer       = 'Transfer',
  TransferRefund = 'TransferRefund',
  PayinRefund    = 'PayinRefund',
  Discount       = 'Discount',
  Bill           = 'Bill',
}

export interface ITransaction {
  transactionId: number;
  walletDebitId: number;
  walletCreditId: number;
  transactionType: string;
  foreignId: number;
  name: string;
  description: string;
  valueDate: string;
  executionDate: string;
  amount: string;
  walletDebitBalance: string;
  walletCreditBalance: string;
  currency: string;
  createdDate: string;
  totalRows: number;
}

export interface ITransactionParams extends ITreezorBasePayload {
  transactionId?: number;
  transactionType?: TransactionType;
  walletId?: number;
  userId?: number;
  name?: string;
  description?: string;
  amount?: string;
  currency?: string;
  valueDate?: Date;
  executionDate?: Date;
  pageNumber?: number;
  pageCount?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
  createdDateFrom?: Date;
  createdDateTo?: Date;
}
