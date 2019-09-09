import { ITreezorBasePayload } from './treezor-base-payload.interface';

export interface ICreatePayoutParams extends ITreezorBasePayload {
  payoutTag?: string;
  walletId: number;
  bankaccountId?: number;
  beneficiaryId?: number;
  label?: string;
  amount: number;
  currency: string;
  supportingFileLink?: string;
}

export interface IPayout {
  payoutId: number;
  payoutTag: string;
  payoutStatus: string; // PENDING, CANCELED, VALIDATED
  payoutTypeId: number;
  payoutType: string; // Credit Transfer, Direct Debit
  walletId: number;
  payoutDate: string;
  walletEventName: string;
  walletAlias: string;
  userFirstname: string;
  userLastname: string;
  userId: number;
  bankaccountId: number;
  beneficiaryId: number;
  uniqueMandateReference: string;
  bankaccountIBAN: string;
  label: string;
  amount: string;
  currency: string;
  partnerFee: string;
  createdDate: string;
  modifiedDate: string;
  totalRows: number;
}

export interface IPayouts {
  payouts: IPayout[];
}
