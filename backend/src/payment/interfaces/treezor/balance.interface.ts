import { ITreezorBasePayload } from './treezor-base-payload.interface';

export interface IBalanceParams extends ITreezorBasePayload {
  walletId?: number;
  userId?: number;
}

export interface IBalance {
  walletId: number;
  currentBalance: number;
  authorizations: number;
  authorizedBalance: number;
  currency: string;
  calculationDate: string;
}
