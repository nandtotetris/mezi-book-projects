import { ITreezorBasePayload } from './treezor-base-payload.interface';

export interface ICreateWalletParams extends ITreezorBasePayload {
  walletTypeId: WalletType;
  tariffId: number;
  userId: number;
  jointUserId?: number;
  walletTag?: string;
  currency: string;
  load?: number;
  eventName: string;
  eventAlias?: string;
  eventDate?: Date;
  eventMessage?: string;
  eventPayinStartDate?: Date;
  eventPayinEndDate?: Date;
}

export interface IWallet {
  walletId: number;
  walletTypeId: number;
  walletStatus: string;
  codeStatus: number;
  informationStatus: string;
  walletTag: string;
  userId: number;
  userLastname: string;
  userFirstname: string;
  jointUserId: number;
  tariffId: number;
  eventName: string;
  eventAlias: string;
  eventDate: string;
  eventMessage: string;
  eventPayinStartDate: string;
  eventPayinEndDate: string;
  contractSigned: number;
  bic: string;
  iban: string;
  urlImage: string;
  currency: string;
  createdDate: string;
  modifiedDate: string;
  payinCount: number;
  payoutCount: number;
  transferCount: number;
  solde: number;
  authorizedBalance: number;
  totalRows: number;
}

export enum WalletStatus {
  VALIDATED = 'validated',
  CANCELLED = 'cancelled',
  PENDING   = 'pending',
}

export enum WalletType {
  ElectronicMoneyWallet = 9,
  PaymentAccountWallet  = 10,
  MirrorWallet          = 13,
  ElectronicMoneyCard   = 14,
}
