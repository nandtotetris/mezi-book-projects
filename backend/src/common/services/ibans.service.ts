import * as rp from 'request-promise-native';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Iban, IbanStatus } from '../entities/iban.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IValidateIban, IBicCandidate } from '../interfaces/iban.interface';
import { Invoice } from '../entities/invoice.entity';
import { User } from '../entities/user.entity';
import { List } from '../interfaces/common.interface';
import { Company } from '../entities/company.entity';

@Injectable()
export class IbansService {
  constructor(
    @InjectRepository(Iban)
    private readonly ibanRepository: Repository<Iban>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) { }

  /**
   * Convert the keys of the object from SnakeCase to CamelCase
   *
   * @param   {any}  obj  - Object to be modified
   *
   * @return  {any}       - Return a object modified
   */
  private snakeToCamel(obj: any): any {
    const data = {};
    Object.keys(obj).forEach(k => {
      const key = k.replace(/([-_][a-z])/ig, ($1) => {
        return $1.toUpperCase()
          .replace('-', '')
          .replace('_', '');
      });

      data[key] = obj[k];
    });

    return data;
  }

  /**
   * Create a IBAN with the data of IBAN API
   *
   * @param   {IValidateIban} data     - Response of IBAN API
   * @param   {Invoice}       invoice  - Invoice
   * @param   {User}          user     - Current user (optional)
   *
   * @return  {Promise<Iban>}          - Return IBAN object created
   */
  public async createIban(data: IValidateIban, invoice: Invoice, user?: User): Promise<Iban> {
    const newIban: IValidateIban = data;
    const [itemBic]: IBicCandidate[] = newIban.bicCandidates;
    newIban.bic = itemBic.bic; // Get first BIC in bic_candidates
    newIban.readerCompany = invoice.companyReceiver; // ID of the company that has access to the iban. (not the one who holds the iban)
    newIban.company = invoice.companyEmitter || null; // ID of the company that owns the iban
    const iban: Iban = this.ibanRepository.create(newIban);
    iban.jsonIbanBic = data;
    delete iban.jsonIbanBic.iban;
    delete iban.jsonIbanBic.readerCompany;
    delete iban.jsonIbanBic.company;
    iban.createdBy = (user) ? user : invoice.importedBy;
    await this.ibanRepository.save(iban);

    return iban;
  }

  /**
   * Create a IBAN with the data of IBAN API for bank account
   *
   * @param   {IValidateIban} data     - Response of IBAN API
   * @param   {User}          user     - Response of IBAN API
   * @param   {Company}       company  - Current company (optinal)
   *
   * @return  {Promise<Iban>}       - Return IBAN object created
   */
  public async createIbanBankAccount(data: IValidateIban, user: User, company?: Company): Promise<Iban> {
    const newIban: IValidateIban = data;
    const [itemBic]: IBicCandidate[] = newIban.bicCandidates;
    newIban.bic = itemBic.bic; // Get first BIC in bic_candidates
    newIban.readerCompany = (company) ? company : user.currentCompany || null; // ID of the company that has access to the iban. (not the one who holds the iban)
    newIban.company = (company) ? company : user.currentCompany || null; // ID of the company that owns the iban
    const iban: Iban = this.ibanRepository.create(newIban);
    iban.jsonIbanBic = data;
    delete iban.jsonIbanBic.iban;
    delete iban.jsonIbanBic.readerCompany;
    delete iban.jsonIbanBic.company;
    iban.createdBy = user || null;
    await this.ibanRepository.save(iban);

    return iban;
  }

  /**
   * Call api of validatie iban
   *
   * @param   {string}                  iban  - IBAN
   *
   * @return  {Promise<IValidateIban>}        - Return of api
   */
  public async getApiValidateIban(iban: string): Promise<IValidateIban> {
    try {
      const res: any = await rp({
        uri: `${process.env.IBAN_API_URL}/${process.env.IBAN_API_VALIDATION_PATH}/${iban}`,
        json: true,
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(process.env.IBAN_API_USERNAME + ':' + process.env.IBAN_API_PASSWORD).toString('base64'),
          'Content-Type': 'application/json',
        },
      });

      return this.snakeToCamel(res);
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Checks if the iban is valid
   *
   * @param   {string}               iban  - Iban
   *
   * @return  {Promise<any>}               - Returns a status of iban
   */
  public async checkIban(iban: string): Promise<any> {
    let status: string = IbanStatus.PASSED;
    let bic: string = '';
    const res: IValidateIban = await this.getApiValidateIban(iban);

    if (res.result === IbanStatus.FAILED) {
      status = IbanStatus.FAILED;
    } else if (res.ibanListed === IbanStatus.BLACKLIST) {
      status = IbanStatus.BLACKLIST;
    } else if (res.ibanListed === IbanStatus.FAKE) {
      status = IbanStatus.FAKE;
    }

    if (res.bicCandidates.length > 0) {
      bic = res.bicCandidates[0].bic;
    }

    return {
      name: res.bank,
      iban,
      bic,
      status,
    };
  }

  /**
   * Get a iban for company
   *
   * @param   {string}         iban     - Current iban
   * @param   {Company}        company  - Current company user
   *
   * @return  {Promise<Iban>}           - Returns a iban
   */
  public async findOneByIbanAndCompany(iban: string, company: Company): Promise<Iban> {
    return this.ibanRepository.findOne({ iban, company });
  }

  /**
   * Get the iban from the company
   *
   * @param   {Company}        company  - Current company user
   *
   * @return  {Promise<List>}           - Returns a list of ibans
   */
  public async findByCompany(company: Company): Promise<List> {
    const [ibans, total]: [Iban[], number] = await this.ibanRepository.findAndCount({
      company,
    });

    return {
      total,
      rows: ibans,
    };
  }

  /**
   * Get the ibans by siren
   *
   * @param   {string}         siren  - Siren of company
   *
   * @return  {Promise<List>}         - Returns a list of ibans
   */
  public async findByCompanySiren(siren: string): Promise<List> {
    const company: Company = await this.companyRepository.findOne({ siren });
    const [ibans, total]: [Iban[], number] = await this.ibanRepository.findAndCount({ company });

    return {
      total,
      rows: ibans,
    };
  }
}
