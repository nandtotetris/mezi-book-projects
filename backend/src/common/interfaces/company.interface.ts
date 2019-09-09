export interface Company {
  readonly createdAt: string;
  readonly source: string;
  readonly name: string;
  readonly siret: string;
  readonly siren: string;
  readonly naf: string;
  readonly incorporationAt: string;
  readonly legalForm: string;
  readonly addressHqId: string;
}

export interface IComplementaryInfos {
  capital: number;
  legalAnnualTurnOver: string;
  numberEmployees: string;
  legalNetIncomeRange: string;
  phone: string;
  addresses?: object;
}
