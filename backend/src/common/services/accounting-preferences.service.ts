import { Repository, In, FindConditions } from 'typeorm';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { List } from '../interfaces/common.interface';
import { AccountingPreferenceDto } from '../dto/accounting-preferences.dto';
import { AccountingPreference, AccountingPreferenceType } from '../entities/accounting-preference.entity';
import { Company } from '../entities/company.entity';

@Injectable()
export class AccountingPreferencesService {
  constructor(
    @InjectRepository(AccountingPreference)
    private readonly accountingPreferenceRepository: Repository<AccountingPreference>,
  ) {}

  /**
   * Create or update accounting preferences
   *
   * @param   {Company}          currentCompany  - Current company user
   * @param   {AccountingPreferenceDto[]}  data            - Date of accounting preferences
   *
   * @return  {Promise<List>}                    - Returns a list of accounting preferences
   */
  public async createOrUpdateAccountingPreferences(currentCompany: Company, data: AccountingPreferenceDto[]): Promise<List> {
    const input: AccountingPreference[] = [];
    data.forEach(accountingPreference => {
      accountingPreference.company = currentCompany;
      input.push(this.accountingPreferenceRepository.create(accountingPreference));
    });

    try {
      await this.accountingPreferenceRepository.save(input);
    } catch (err) {
      throw new HttpException('api.error.accounting-preference.save', HttpStatus.BAD_REQUEST);
    }

    const [ accountingPreferences, total ]: [ AccountingPreference[], number ] = await this.accountingPreferenceRepository.findAndCount({ company: currentCompany });

    return {
      total,
      rows: accountingPreferences,
    };
  }

  /**
   * Get the accounting preferences of company by types
   *
   * @param   {Company}                     currentCompany  - Current company
   * @param   {AccountingPreferenceType[]}  types           - Type of accounting preferences (optional)
   * @param   {boolean}                     defaultOptions  - Get default options (optional)
   *
   * @return  {Promise<List>}                               - Returns a list of accounting preferences
   */
  public async findByTypes(currentCompany: Company, types?: AccountingPreferenceType[], defaultOptions?: boolean): Promise<List> {
    if (!currentCompany) {
      throw new HttpException('api.error.company.not_found', HttpStatus.NOT_FOUND);
    }

    const where: FindConditions<AccountingPreference> = { company: currentCompany };
    const orWhere: FindConditions<AccountingPreference> = { company: null };

    if (types) {
      where.type = In(types);
      orWhere.type = In(types);
    }

    const whereClause: FindConditions<AccountingPreference[]> = [where];
    if (defaultOptions) {
      whereClause.push(orWhere);
    }

    const [ accountingPreferences, total ]: [ AccountingPreference[], number ] = await this.accountingPreferenceRepository.findAndCount({
      where: whereClause,
      relations: ['company'],
      order: {
        order: 'ASC',
      },
    });

    return {
      total,
      rows: accountingPreferences,
    };
  }
}
