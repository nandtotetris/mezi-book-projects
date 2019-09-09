export interface Strategy {
  readonly baseUrl: string;
  search(q: string, orderBy?: string, limit?: number, offset?: number): Promise<Companies>;
}

export interface Company {
  source?: string;
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
  addresses?: Addresses;
}

export interface Address {
  siret: string;
  address1: string;
  address2: string;
  zipcode: number;
  city: string;
  country: string;
}

export interface Companies {
  total: number;
  rows: Company[];
}

export interface Addresses {
  total: number;
  rows: Address[];
}
