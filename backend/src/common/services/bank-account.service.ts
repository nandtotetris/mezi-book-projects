import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BankAccount } from '../entities/bank-account.entity';
import { Repository, Not } from 'typeorm';
import { Company } from '../entities/company.entity';
import { List } from '../interfaces/common.interface';
import { CreateOrUpdateBankAccountDto } from '../dto/bank-account.dto';
import { Iban } from '../entities/iban.entity';
import { IbansService } from './ibans.service';
import { IValidateIban } from '../interfaces/iban.interface';
import { User } from '../entities/user.entity';
import { Mandate, MandateStatus } from '../entities/mandate.entity';

@Injectable()
export class BankAccountService {
  constructor(
    @InjectRepository(BankAccount)
    private readonly bankAccountRepository: Repository<BankAccount>,
    @InjectRepository(Mandate)
    private readonly mandateRepository: Repository<Mandate>,
    private readonly ibansService: IbansService,
  ) {}

  /**
   * Create or update a bank account
   *
   * @param   {Company}                       company  - Current user
   * @param   {User}                          user     - Current user
   * @param   {CreateOrUpdateBankAccountDto}  data     - Data of bank account
   * @param   {string}                        id       - Bank account's id
   *
   * @return  {Promise<BankAccount>}                   - Returns a bank account object created/updated
   */
  public async createOrUpdateBankAccount(company: Company, user: User, data: CreateOrUpdateBankAccountDto, id?: string): Promise<BankAccount> {
    if (!company) {
      throw new HttpException('api.error.company.not_found', HttpStatus.NOT_FOUND);
    }

    let bankAccount: BankAccount = null;

    if (id) {
      bankAccount = await this.bankAccountRepository.findOne({ where: { id }, relations: ['company', 'iban', 'mandates'] });
      if (!bankAccount) {
        throw new HttpException('api.error.bank_account.not_found', HttpStatus.NOT_FOUND);
      }

      bankAccount.label = data.label;
      return bankAccount.save();
    }

    let defaultBankAccount = false;
    const nbBankAccount: number = await this.bankAccountRepository.count({ company, default: true });
    if (nbBankAccount === 0) {
      defaultBankAccount = true;
    }

    bankAccount = this.bankAccountRepository.create({ label: data.label, company, default: defaultBankAccount });

    // Check IBAN
    if (data.iban) {
      const alreadyIban: Iban = await this.ibansService.findOneByIbanAndCompany(data.iban, company);
      bankAccount.iban = alreadyIban;
      if (!alreadyIban) {
        try {
          const res: IValidateIban = await this.ibansService.getApiValidateIban(data.iban);
          res.iban = data.iban;
          bankAccount.iban = await this.ibansService.createIbanBankAccount(res, user, (!user) ? company : null);
        } catch (err) {
          const logger = new Logger();
          logger.error(err.message);
          throw new HttpException('api.error.iban.check', err.statusCode);
        }
      }
    }

    return this.bankAccountRepository.save(bankAccount);
  }

  /**
   * Get all bank account from company
   *
   * @param   {Company}        company  - Current company user
   *
   * @return  {Promise<List>}           - Returns a list of bank accounts
   */
  public async getBankAccounts(company: Company): Promise<List> {
    const [ bankAccounts, total ]: [ BankAccount[], number ] = await this.bankAccountRepository.findAndCount({ where: { company }, relations: ['company', 'iban', 'mandates'] });

    return {
      total,
      rows: bankAccounts,
    };
  }

  /**
   * Get a bank account from company
   *
   * @param   {Company}               company  - Current company user
   * @param   {string}                id       - Bank account's id
   *
   * @return  {Promise<BankAccount>}           - Returns a bank account
   */
  public async getBankAccount(company: Company, id: string): Promise<BankAccount> {
    const bankAccount: BankAccount = await this.bankAccountRepository.findOne({ where: { id, company }, relations: ['company', 'iban', 'mandates'] });
    if (!bankAccount) {
      throw new HttpException('api.error.bank_account.not_found', HttpStatus.NOT_FOUND);
    }

    return bankAccount;
  }

  /**
   * Change the bank account by default of current company user
   *
   * @param   {Company}                 company  - Current company user
   * @param   {string}                  id       - Bank account's id
   *
   * @return  {Promise<BankAccount[]>}           - Returns the accounts updated
   */
  public async changeDefaultBankAccount(company: Company, id: string): Promise<BankAccount[]> {
    const bankAccount: BankAccount = await this.bankAccountRepository.findOne({ where: { id, company }, relations: ['company', 'iban', 'mandates'] });
    if (!bankAccount) {
      throw new HttpException('api.error.bank_account.not_found', HttpStatus.NOT_FOUND);
    }

    const result: BankAccount[] = [bankAccount];
    const defaultBankAccount: BankAccount = await this.bankAccountRepository.findOne({ where: { company, default: true, id: Not(bankAccount.id) }, relations: ['company', 'iban', 'mandates'] });
    if (defaultBankAccount) {
      defaultBankAccount.default = false;
      await defaultBankAccount.save();
      result.push(defaultBankAccount);
    }

    bankAccount.default = true;
    await bankAccount.save();

    return result;
  }

  /**
   * Remove a bank account without active mandates
   *
   * @param   {Company}               company  - Current company user
   * @param   {string}                id       - Bank account's id
   *
   * @return  {Promise<BankAccount>}           - Returns a removed bank account
   */
  public async removeBankAccount(company: Company, id: string): Promise<BankAccount> {
    if (!company) {
      throw new HttpException('api.error.company.not_found', HttpStatus.NOT_FOUND);
    }

    const bankAccount: BankAccount = await this.bankAccountRepository.findOne({ where: { id, company, enabled: true }, relations: ['company', 'iban', 'mandates'] });
    if (!bankAccount) {
      throw new HttpException('api.error.bank_account.not_found', HttpStatus.NOT_FOUND);
    }

    const nbdefaultBankAccounts = await this.bankAccountRepository.count({ id: Not(bankAccount.id), company, default: false });
    if (bankAccount.default === true && nbdefaultBankAccounts > 0) {
      throw new HttpException('api.error.bank_account.default', HttpStatus.BAD_REQUEST);
    }

    const nbActiveMandates: number = await this.mandateRepository.count({ bankAccount, status: MandateStatus.SIGNED });
    if (nbActiveMandates > 0) {
      throw new HttpException('api.error.bank_account.active_mandate', HttpStatus.BAD_REQUEST);
    }

    bankAccount.enabled = false;
    await bankAccount.save();

    return bankAccount;
  }
}
