export enum MandateSequenceType {
  ONE_OFF = 'one-off',
  RECURRENT = 'recurrent'
}

export enum MandateSddType {
  CORE = 'core',
  B2B = 'b2b'
}

export enum MandateOrigin {
  CREDITOR = 'CREDITOR',
  DEBITOR = 'DEBITOR'
}

export interface ICreateMandateParams {
  sddType?:	MandateSddType;
  isPaper?: boolean;
  debtorName: string;
  debtorAddress: string;
  debtorCity: string;
  debtorZipCode: string;
  debtorCountry: string;
  debtorIban: string;
  debtorBic?: string;
  sequenceType: MandateSequenceType;
  createdIp: string;
  signatureDate?: string;
}

export type ICreateMandateMandatoryParams = ICreateMandateParams & {
  userId: string;
};

export interface IDeleteMandateParams {
  mandateId: string;
  origin: MandateOrigin;
}

export interface IMandate {
  mandateId?: number;
  title?: string;
  legalInformations?: string;
  uniqueMandateReference?: string;
  mandateStatus?: string;
  userId?: number;
  debtorName?: string;
  debtorAddress?: string;
  debtorCity?: string;
  debtorZipCode?: string;
  debtorCountry?: string;
  debtorIban?: string;
  debtorBic?: string;
  sequenceType?: string;
  creditorName?: string;
  sepaCreditorIdentifier?: string;
  creditorAddress?: string;
  creditorCity?: string;
  creditorZipCode?: string;
  creditorCountry?: string;
  signatureDate?: string;
  debtorSignatureIp?: string;
  signed?: number;
  debtorIdentificationCode?: string;
  debtorReferencePartyName?: string;
  debtorReferenceIdentificationCode?: string;
  creditorReferencePartyName?: string;
  creditorReferenceIdentificationCode?: string;
  contractIdentificationNumber?: string;
  contractDescription?: string;
  isPaper?: boolean;
  sddType?: string;
  revocationSignatureDate?: string;
  createdIp?: string;
  createdDate?: string;
  modifiedDate?: string;
}
