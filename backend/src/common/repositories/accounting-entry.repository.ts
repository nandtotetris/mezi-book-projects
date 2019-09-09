import { Repository, EntityRepository, IsNull } from 'typeorm';
import { AccountingEntry } from '../entities/accounting-entry.entity';
import { Company } from '../entities/company.entity';

@EntityRepository(AccountingEntry)
export class AccountingEntryRepository extends Repository<AccountingEntry> {
  /**
   * Get accounting entry by company and export empty
   *
   * @param   {Company}                company  - Current company user
   *
   * @return  {Promise<AccountingPreference[]>}           - Returns a list of accounting entry
   */
  public async findByCompanyAndExportIdEmpty(company: Company): Promise<AccountingEntry[]> {
    return this.find({ where: { company, export: IsNull() }, relations: ['ledger', 'account'] });
  }
}
