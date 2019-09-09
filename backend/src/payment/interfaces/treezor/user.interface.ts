import { ITreezorBasePayload, SortOrder } from './treezor-base-payload.interface';

export interface ICreateUserParams extends ITreezorBasePayload {
  userTypeId: UserType;
  userTag?: string;
  parentUserId?: number;
  parentType?: UserParentType;
  specifiedUSPerson?: UserSpecifiedUSPerson;
  controllingPersonType?: UserControllingPersonType;
  employeeType?: UserEmployeeType;
  title?: UserTitle;
  firstname?: string;
  lastname?: string;
  middleNames?: string;
  birthday?: string;
  email?: string;
  address1?: string;
  address2?: string;
  postcode?: string;
  city?: string;
  state?: string;
  country?: string;
  phone?: string;
  mobile?: string;
  nationality?: string;
  nationalityOther?: string;
  placeOfBirth?: string;
  birthCountry?: string;
  occupation?: string;
  incomeRange?: string;
  legalName?: string;
  legalRegistrationNumber?: string;
  legalTvaNumber?: string;
  legalRegistrationDate?: Date;
  legalForm?: number;
  legalShareCapital?: number;
  legalSector?: string;
  legalAnnualTurnOver?: string;
  legalNetIncomeRange?: string;
  legalNumberOfEmployeeRange?: string;
  effectiveBeneficiary?: number;
  language?: string;
  taxNumber?: string;
  taxResidence?: string;
  position?: string;
  personalAssets?: string;
}

export interface IUpdateUserParams extends ITreezorBasePayload {
  userId: number;
  userTypeId: UserType;
  userTag?: string;
  parentUserId?: number;
  parentType?: UserParentType;
  specifiedUSPerson?: UserSpecifiedUSPerson;
  controllingPersonType?: UserControllingPersonType;
  employeeType?: UserEmployeeType;
  title?: UserTitle;
  firstname?: string;
  lastname?: string;
  middleNames?: string;
  birthday?: string;
  email?: string;
  address1?: string;
  address2?: string;
  postcode?: string;
  city?: string;
  state?: string;
  country?: string;
  phone?: string;
  mobile?: string;
  nationality?: string;
  nationalityOther?: string;
  placeOfBirth?: string;
  birthCountry?: string;
  occupation?: string;
  incomeRange?: string;
  legalName?: string;
  legalRegistrationNumber?: string;
  legalTvaNumber?: string;
  legalRegistrationDate?: Date;
  legalForm?: number;
  legalShareCapital?: number;
  legalSector?: string;
  legalAnnualTurnOver?: string;
  legalNetIncomeRange?: string;
  legalNumberOfEmployeeRange?: string;
  effectiveBeneficiary?: number;
  language?: string;
  taxNumber?: string;
  taxResidence?: string;
  position?: string;
  personalAssets?: string;
}

export interface IUserParams extends ITreezorBasePayload {
  userId?: number;
  userTypeId?: number;
  userStatus?: string;
  userTag?: string;
  specifiedUSPerson?: number;
  employeeType?: number;
  email?: string;
  name?: string;
  legalName?: string;
  parentUserId?: number;
  pageNumber?: number;
  pageCount?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
  createdDateFrom?: Date;
  createdDateTo?: Date;
  updatedDateFrom?: Date;
  updatedDateTo?: Date;
}

export interface IUser {
  userId: number;
  userTypeId: number;
  userStatus: string;
  userTag: string;
  parentUserId: number;
  parentType: string;
  controllingPersonType: number;
  employeeType: number;
  specifiedUSPerson: number;
  title: string;
  firstname: string;
  lastname: string;
  middleNames: string;
  birthday: string;
  email: string;
  address1: string;
  address2: string;
  postcode: string;
  city: string;
  state: string;
  country: string;
  countryName: string;
  phone: string;
  mobile: string;
  nationality: string;
  nationalityOther: string;
  placeOfBirth: string;
  placeCountry: string;
  occupation: string;
  incomeRange: string;
  legalName: string;
  legalNameEmbossed: string;
  legalRegistrationNumber: string;
  legalTvaNumber: string;
  legalRegistrationDate: string;
  legalForm: string;
  legalShareCapital: number;
  legalSector: string;
  legalAnnualTurnOver: string;
  legalNetIncomeRange: string;
  legalNumberOfEmployeeRange: string;
  effectiveBeneficiary: number;
  kycLevel: number;
  kycReview: number;
  kycReviewComment: string;
  isFreezed: number;
  language: string;
  optInMailing: number;
  sepaCreditorIdentifier: string;
  taxNumber: string;
  taxResidence: string;
  position: string;
  personalAssets: string;
  createdDate: string;
  modifiedDate: string;
  walletCount: number;
  payinCount: number;
  totalRows: number;
}

export enum UserParentType {
  SHAREHOLDER = 'shareholder',
  EMPLOYEE    = 'employee',
  LEADER      = 'leader',
}

export enum UserSpecifiedUSPerson {
  No  = 0,
  YES = 1,
}

export enum UserControllingPersonType {
  Shareholder        = 1,
  OTHER_RELATIONSHIP = 2,
  DIRECTOR           = 3,
  NONE               = 4,
}

export enum UserEmployeeType {
  LEADER   = 1,
  EMPLOYEE = 2,
  NONE     = 3,
}

export enum UserType {
  NATURAL_PERSON               = 1,
  BUSINESS_ENTITY              = 2,
  NO_GOVERNMENTAL_ORGANIZATION = 3,
  GOVERNMENTAL_ORGANIZATION    = 4,
}

export enum UserTitle {
  M    = 'M',
  MME  = 'MME',
  MLLE = 'MLLE',
}
