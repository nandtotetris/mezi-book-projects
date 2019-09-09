import { Company } from '../entities/company.entity';

export interface IBicCandidate {
  bic: string;
  zip: string;
  city: string;
  wwwcount: number;
  sampleurl: string;
}

export interface IValidateIban {
  iban: string;
  result: string;
  returnCode: number;
  checks: string[];
  bicCandidates: IBicCandidate[];
  allBicCandidates: IBicCandidate[];
  country: string;
  bankCode: string;
  bankAndBranchCode: string;
  bank: string;
  bankAddress: string;
  bankStreet: string;
  bankCity: string;
  bankState: string;
  bankPostalCode: string;
  bankUrl: string;
  branch: string;
  branchCode: string;
  inSclDirectory: string;
  sct: string;
  sdd: string;
  cor1: string;
  b2b: string;
  scc: string;
  sctInst: string;
  sctInstReadinessDate: string;
  accountNumber: string;
  accountValidationMethod: string;
  accountValidation: string;
  lengthCheck: string;
  accountCheck: string;
  bankCodeCheck: string;
  ibanChecksumCheck: string;
  dataAge: string;
  ibanListed: string;
  ibanWwwOccurrences: string;
  wwwSeenFrom: Date;
  wwwSeenUntil: Date;
  ibanUrl: string;
  urlRank: string;
  urlCategory: string;
  urlMinDepth: string;
  wwwProminence: string;
  ibanReportedToExist: number;
  ibanLastReported: string;
  ibanCandidate: string;
  IBANformat: string;
  formatcomment: string;
  balance: number;
  bic: string;
  readerCompany: Company;
  company: Company;
}
