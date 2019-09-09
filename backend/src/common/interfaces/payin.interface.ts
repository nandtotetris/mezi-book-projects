import { Company } from '../entities/company.entity';

export interface CreatePayinPayload {
  company: Company;
  amount: number;
  currency: string;
  payinAt: Date;
}
