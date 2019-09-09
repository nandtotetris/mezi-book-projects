import { ITreezorBasePayload } from './treezor-base-payload.interface';

export interface IBusinessParams extends ITreezorBasePayload {
  country: string;
  externalId?: string;
  registrationNumber?: string;
  vatNumber?: string;
}

export interface IBusinesses {
  businessinformations: IBusiness[];
}

export interface IBusiness {
  legalName: string;
  legalRegistrationNumber: string;
  legalRegistrationDate: string;
  legalForm: string;
  legalShareCapital: number;
  legalSector: string;
  legalAnnualTurnOver: string;
  legalNetIncomeRange: string;
  legalNumberOfEmployeeRange: string;
  phone: string;
  email: string;
  address1: string;
  postcode: string;
  city: string;
  state: string;
  country: string;
  status: string;
  tradename: string;
  users: IRepresentative[];
}

export interface IRepresentative {
  firstname: string;
  lastname: string;
  fullnames: string;
  birthday: string;
  parentType: string;
}

export interface ISearchParams {
  country?: string;
  nameExact?: string;
  nameMatchBeginning?: string;
  nameClosestKeywords?: string;
  registrationNumber?: string;
  vatNumber?: string;
  phoneNumber?: string;
  addressStreet?: string;
  addressCity?: string;
  addressPostalCode?: string;
}

export interface ISearch {
  legalName: string;
  phone: string;
  legalTvaNumber: string;
  legalRegistrationNumber: string;
  status: string;
  officeType: number;
  safeNumber: string;
  activityType: string;
  externalId: string;
  address1: string;
  postcode: string;
  city: string;
  state: string;
  country: string;
  tradename: string;
}
