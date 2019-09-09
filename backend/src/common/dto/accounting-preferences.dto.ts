import { AccountingPreferenceType } from '../entities/accounting-preference.entity';

export class AccountingPreferenceDto {
  id?: string;
  key: string;
  value: string;
  description?: string;
  type: AccountingPreferenceType;
  order?: number;
  enabled?: boolean;
  company?: any;
}
