import { ITreezorBasePayload, SortOrder } from './treezor-base-payload.interface';

export interface IBeneficiaryParams extends ITreezorBasePayload {
  fields?: string[];
  filter?: string;
  id?: number;
  userId?: number;
  iban?: string;
  bic?: string;
  nickName?: string;
  name?: string;
  pageNumber?: number;
  pageCount?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
}

export interface ICreateBeneficiaryParams extends ITreezorBasePayload {
  body: {
    tag?: string,
    userId: number,
    nickName?: string,
    name?: string,
    address?: string,
    iban?: string,
    bic?: string,
    sepaCreditorIdentifier?: string,
    sddB2bWhitelist?: ISddB2bWhitelist[],
    sddCoreBlacklist?: string[],
    usableForSct?: boolean,
    fields?: string[],
  };
}

export interface ISddB2bWhitelist {
  uniqueMandateReference?: string;
  isRecurrent?: boolean;
  walletId?: number;
}

export interface IBeneficiary {
  id: number;
  tag: string;
  userId: number;
  nickName: string;
  name: string;
  address: string;
  iban: string;
  bic: string;
  sepaCreditorIdentifier: string;
  sddB2bWhitelist: ISddB2bWhitelist[];
  sddCoreBlacklist: string[];
  usableForSct: boolean;
  fields: string[];
}

export interface IBeneficiaries {
  beneficiaries: IBeneficiary[];
}
