/* tslint:disable */
export enum AddressOrder {
  createdAt_ASC = 'createdAt_ASC',
  createdAt_DESC = 'createdAt_DESC',
  updatedAt_ASC = 'updatedAt_ASC',
  updatedAt_DESC = 'updatedAt_DESC',
}

export enum ContactOrder {
  firstname_ASC = 'firstname_ASC',
  firstname_DESC = 'firstname_DESC',
  lastname_ASC = 'lastname_ASC',
  lastname_DESC = 'lastname_DESC',
  createdAt_ASC = 'createdAt_ASC',
  createdAt_DESC = 'createdAt_DESC',
  updatedAt_ASC = 'updatedAt_ASC',
  updatedAt_DESC = 'updatedAt_DESC',
}

export enum DocumentStatus {
  PENDING = 'PENDING',
  CANCELED = 'CANCELED',
  VALIDATED = 'VALIDATED',
}

export enum HistoryEvent {
  UPDATE_STATUS = 'UPDATE_STATUS',
}

export enum InvoiceStatus {
  IMPORTING = 'IMPORTING',
  IMPORTED = 'IMPORTED',
  SCANNING = 'SCANNING',
  SCANNED = 'SCANNED',
  TO_PAY = 'TO_PAY',
  PLANNED = 'PLANNED',
  PAID = 'PAID',
}

export enum KycStatus {
  PENDING = 'PENDING',
  VALIDATED = 'VALIDATED',
  REFUSED = 'REFUSED',
}

export enum PartnerOrder {
  createdAt_ASC = 'createdAt_ASC',
  createdAt_DESC = 'createdAt_DESC',
  updatedAt_ASC = 'updatedAt_ASC',
  updatedAt_DESC = 'updatedAt_DESC',
}

export enum Status {
  UNKNOWN = 'UNKNOWN',
  EXIST = 'EXIST',
  ALREADY = 'ALREADY',
  SELF = 'SELF',
}

export enum UserTitle {
  M = 'M',
  MME = 'MME',
  MLLE = 'MLLE',
}

export class AddressInput {
  siret?: string;
  address1?: string;
  address2?: string;
  zipcode?: number;
  city?: string;
  country?: string;
  companyId?: string;
}

export class BeneficiaryInput {
  userId?: number;
  title?: UserTitle;
  firstname?: string;
  lastname?: string;
  nationality?: string;
  placeOfBirth?: string;
  birthCountry?: string;
  birthday?: string;
  specifiedUSPerson?: number;
  incomeRange?: string;
  personalAssets?: string;
  occupation?: string;
  controllingPersonType?: number;
  employeeType?: number;
  isCurrentUser?: boolean;
  isHosted?: boolean;
  phone?: string;
  address1?: string;
  address2?: string;
  postcode?: string;
  city?: string;
  country?: string;
  taxResidence?: string;
  documents?: DocumentInput[];
}

export class CompanyInput {
  siren?: string;
  siret?: string;
  name?: string;
  brandName?: string;
  naf?: string;
  nafNorm?: string;
  numberEmployees?: string;
  legalForm?: string;
  category?: string;
  incorporationAt?: Date;
  vatNumber?: string;
  capital?: number;
  legalAnnualTurnOver?: string;
  legalNetIncomeRange?: string;
  phone?: string;
  addresses?: AddressInput[];
}

export class ContactEmailInput {
  id?: string;
  email: string;
}

export class ContactInput {
  firstname: string;
  lastname: string;
  companyId?: string;
  emails?: ContactEmailInput[];
}

export class DocumentInput {
  documentTypeId: number;
  name: string;
  file?: Upload;
}

export class EmailInput {
  email: string;
  visibleOnlyCompany?: number;
  contact: string;
}

export class InvoiceFilters {
  status?: InvoiceStatus[];
  enabled?: boolean;
}

export class InvoiceInput {
  file?: Upload;
}

export class PartnerInput {
  name?: string;
  companyInitiatorId: number;
  companyPartnerId: number;
}

export class SignInInput {
  email: string;
  password: string;
}

export class SignUpInput {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  cgu: boolean;
}

export class UpdateInvoiceInput {
  receiverTitle?: string;
  number?: string;
  iban?: string;
  currency?: string;
  total?: number;
  totalWoT?: number;
  dueDate?: Date;
  invoiceDate?: Date;
  companyEmitter?: CompanyInput;
  ocrSirenFeedback?: JSON;
  ocrFeedback?: JSON;
}

export class UserInput {
  firstname?: string;
  lastname?: string;
  email?: string;
}

export class Address {
  id?: string;
  siret?: string;
  address1?: string;
  address2?: string;
  zipcode?: number;
  city?: string;
  country?: string;
}

export class Addresses {
  total?: number;
  rows?: Address[];
}

export class Balance {
  walletId?: number;
  currentBalance?: number;
  authorizations?: number;
  authorizedBalance?: number;
  currency?: string;
  calculationDate?: string;
}

export class Beneficiaries {
  total?: number;
  rows?: Beneficiary[];
}

export class Beneficiary {
  userId?: number;
  userTypeId?: number;
  userStatus?: string;
  userTag?: string;
  parentUserId?: number;
  parentType?: string;
  specifiedUSPerson?: number;
  controllingPersonType?: number;
  employeeType?: number;
  title?: string;
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
  countryName?: string;
  phone?: string;
  mobile?: string;
  nationality?: string;
  nationalityOther?: string;
  placeOfBirth?: string;
  birthCountry?: string;
  occupation?: string;
  incomeRange?: string;
  legalName?: string;
  legalNameEmbossed?: string;
  legalRegistrationNumber?: string;
  legalTvaNumber?: string;
  legalRegistrationDate?: string;
  legalForm?: string;
  legalShareCapital?: number;
  legalSector?: string;
  legalAnnualTurnOver?: string;
  legalNetIncomeRange?: string;
  legalNumberOfEmployeeRange?: string;
  effectiveBeneficiary?: number;
  kycLevel?: number;
  kycReview?: number;
  kycReviewComment?: string;
  isFreezed?: number;
  language?: string;
  optInMailing?: number;
  sepaCreditorIdentifier?: string;
  taxNumber?: string;
  taxResidence?: string;
  position?: string;
  personalAssets?: string;
  createdDate?: string;
  modifiedDate?: string;
  walletCount?: number;
  payinCount?: number;
  documents?: Documents;
}

export class Companies {
  total?: number;
  rows?: Company[];
}

export class Company {
  id?: string;
  siren?: string;
  siret?: string;
  name?: string;
  brandName?: string;
  naf?: string;
  nafNorm?: string;
  numberEmployees?: string;
  legalForm?: string;
  category?: string;
  incorporationAt?: Date;
  vatNumber?: string;
  source?: string;
  treezorEmail?: string;
  treezorUserId?: number;
  treezorWalletId?: number;
  treezorIban?: string;
  treezorBic?: string;
  claimer?: User;
  status?: Status;
  kycStatus?: KycStatus;
  kycStep?: string;
  capital?: number;
  legalAnnualTurnOver?: string;
  legalNetIncomeRange?: string;
  phone?: string;
  invoicesSent?: number;
  invoicesReceived?: number;
  contacts?: Contacts;
  addresses?: Addresses;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ComplementaryInfos {
  capital?: number;
  legalAnnualTurnOver?: string;
  numberEmployees?: string;
  legalNetIncomeRange?: string;
  phone?: string;
}

export class Contact {
  id?: string;
  firstname?: string;
  lastname?: string;
  user?: User;
  company?: Company;
  emails?: Emails;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Contacts {
  total?: number;
  rows?: Contact[];
}

export class Document {
  documentId?: number;
  documentTag?: string;
  documentStatus?: DocumentStatus;
  documentTypeId?: number;
  documentType?: string;
  residenceId?: number;
  clientId?: number;
  userId?: number;
  userLastname?: string;
  userFirstname?: string;
  fileName?: string;
  temporaryUrl?: string;
  temporaryUrlThumb?: string;
  createdDate?: string;
  modifiedDate?: string;
}

export class Documents {
  total?: number;
  rows?: Document[];
}

export class Email {
  id?: string;
  email?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Emails {
  total?: number;
  rows?: Email[];
}

export class Histories {
  total?: number;
  rows?: History[];
}

export class History {
  id?: string;
  event?: HistoryEvent;
  params?: JSON;
  user?: User;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Iban {
  id?: string;
  iban?: string;
  readerCompany?: Company;
  treezorBeneficiaryId?: number;
  createdBy?: User;
  company?: Company;
  result?: string;
  returnCode?: number;
  bic?: string;
  bicCondidates?: JSON;
  country?: string;
  bankCode?: string;
  bank?: string;
  bankAddress?: string;
  branch?: string;
  branchCode?: string;
  inSclDirectory?: string;
  sct?: string;
  sdd?: string;
  cor1?: string;
  b2b?: string;
  scc?: string;
  jsonIbanBic?: JSON;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Invoice {
  id?: string;
  status?: string;
  filename?: string;
  filepath?: string;
  importAt?: Date;
  importedBy?: User;
  createdBy?: User;
  companyEmitter?: Company;
  companyReceiver?: Company;
  number?: string;
  iban?: Iban;
  currency?: string;
  total?: number;
  totalWoT?: number;
  dueDate?: Date;
  invoiceDate?: Date;
  receiverTitle?: string;
  emitterTitle?: string;
  enabled?: boolean;
  error?: boolean;
  ocrStatus?: string;
  ocrPartner?: string;
  ocrSirenFeedback?: JSON;
  ocrFeedback?: JSON;
  history?: Histories;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Invoices {
  total?: number;
  rows?: Invoice[];
}

export abstract class IMutation {
  abstract signin(input: SignInInput): User | Promise<User>;

  abstract signup(input: SignUpInput): User | Promise<User>;

  abstract logout(): boolean | Promise<boolean>;

  abstract createAddress(input?: AddressInput): Address | Promise<Address>;

  abstract createBeneficiary(
    input: BeneficiaryInput,
  ): Beneficiary | Promise<Beneficiary>;

  abstract removeBeneficiary(id: number): Beneficiary | Promise<Beneficiary>;

  abstract createCompany(input?: CompanyInput): Company | Promise<Company>;

  abstract signContract(): boolean | Promise<boolean>;

  abstract updateKycStatus(status?: KycStatus): Company | Promise<Company>;

  abstract updateKycStep(step?: string): Company | Promise<Company>;

  abstract removeDocument(id: number): Document | Promise<Document>;

  abstract createContact(input?: ContactInput): Contact | Promise<Contact>;

  abstract updateContact(
    id: string,
    input: ContactInput,
  ): Contact | Promise<Contact>;

  abstract createEmail(input: EmailInput): Email | Promise<Email>;

  abstract updateEmail(id: string, input: EmailInput): Email | Promise<Email>;

  abstract createInvoice(input?: InvoiceInput): Invoice | Promise<Invoice>;

  abstract updateInvoice(
    id: string,
    input: UpdateInvoiceInput,
  ): Invoice | Promise<Invoice>;

  abstract updateInvoiceStatus(
    id: string,
    status: InvoiceStatus,
  ): Invoice | Promise<Invoice>;

  abstract removeInvoice(id: string): Invoice | Promise<Invoice>;

  abstract generateCode(invoiceId: string): Invoice | Promise<Invoice>;

  abstract createPartner(input: CompanyInput): Company | Promise<Company>;

  abstract payout(
    invoiceId: string,
    date?: string,
    code?: string,
  ): Invoice | Promise<Invoice>;

  abstract payoutContacts(
    invoiceId: string,
    contactIds?: string[],
  ): boolean | Promise<boolean>;

  abstract refreshConfirmationTokenUser(email: string): User | Promise<User>;

  abstract activateUser(confirmationToken: string): boolean | Promise<boolean>;
}

export class Partner {
  id?: string;
  name?: string;
  companyInitiator?: Company;
  companyPartner?: Company;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Partners {
  total?: number;
  rows?: Partner[];
}

export abstract class IQuery {
  abstract balance(): Balance | Promise<Balance>;

  abstract checkBalance(invoiceId: string): boolean | Promise<boolean>;

  abstract beneficiaries(
    limit?: number,
    page?: number,
  ): Beneficiaries | Promise<Beneficiaries>;

  abstract taxResidence(
    userId?: number,
    country?: string,
  ): TaxResidence | Promise<TaxResidence>;

  abstract searchCompanies(
    query: string,
    limit?: number,
    offset?: number,
  ): Companies | Promise<Companies>;

  abstract contract(): string | Promise<string>;

  abstract company(): Company | Promise<Company>;

  abstract representatives(): Representatives | Promise<Representatives>;

  abstract companyWithComplementaryInfos(
    siren: string,
  ): ComplementaryInfos | Promise<ComplementaryInfos>;

  abstract invoices(
    filters?: InvoiceFilters,
    limit?: number,
    offset?: number,
  ): Invoices | Promise<Invoices>;

  abstract invoice(id: string): Invoice | Promise<Invoice>;

  abstract partners(
    orderBy?: PartnerOrder,
    limit?: number,
    offset?: number,
  ): Companies | Promise<Companies>;

  abstract partner(id?: string): Company | Promise<Company>;

  abstract transactions(
    limit?: number,
    page?: number,
  ): Transactions | Promise<Transactions>;

  abstract me(): User | Promise<User>;

  abstract temp__(): boolean | Promise<boolean>;
}

export class Representative {
  firstname?: string;
  lastname?: string;
  fullnames?: string;
  birthday?: string;
  parentType?: string;
  userTypeId?: number;
}

export class Representatives {
  total?: number;
  rows?: Representative[];
}

export class TaxResidence {
  id?: number;
  userId?: number;
  country?: string;
  taxPayerId?: string;
  liabilityWaiver?: boolean;
  createdDate?: string;
  lastUpdate?: string;
  deletedDate?: string;
  isDeleted?: boolean;
}

export class Transaction {
  transactionId?: number;
  walletDebitId?: number;
  walletCreditId?: number;
  transactionType?: string;
  foreignId?: number;
  name?: string;
  description?: string;
  valueDate?: string;
  executionDate?: string;
  amount?: string;
  walletDebitBalance?: string;
  walletCreditBalance?: string;
  currency?: string;
  createdDate?: string;
}

export class Transactions {
  total?: number;
  rows?: Transaction[];
}

export class User {
  id?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  token?: string;
  lastLogin?: Date;
  lastCguAccept?: Date;
  currentCompany?: Company;
  companies?: Companies;
  createdAt?: Date;
  updatedAt?: Date;
}

export type Date = any;
export type JSON = any;
export type Upload = any;
