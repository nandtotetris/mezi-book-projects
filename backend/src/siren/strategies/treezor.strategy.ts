import { Strategy, Companies } from '../interfaces/strategy.interface';
import { TreezorService } from '../../payment/treezor.service';
import { SearchCompaniesType, getPrefixTypeSearchCompanies } from '../utils.service';
import { ISearchParams, ISearch } from '../../payment/interfaces/treezor/business.interface';
import { HttpException, Injectable } from '@nestjs/common';

@Injectable()
export class TreezorStrategy implements Strategy {
  public readonly baseUrl: string = process.env.TREEZOR_API_URL;

  constructor(private readonly treezorService: TreezorService) {}

  /**
   * Call API Treezor
   *
   * @param   {ISearchParams}       data  - Data of search
   *
   * @return  {Promise<ISearch[]>}        - Returns a list of raw companies
   */
  private async callApi(data: ISearchParams): Promise<ISearch[]> {

    try {
      const { businesssearchs }: any = await this.treezorService.getBusinessSearchs(data);
      return businesssearchs;
    } catch (err) {
      throw new HttpException(err.message, err.code);
    }
  }

  /**
   * Search in API Treezor
   *
   * @param   {string}              q        - Name or Siret or Siren
   * @param   {string}              orderBy  - Sort the request (optional)
   * @param   {number}              limit    - Number of returned companies (optional)
   * @param   {number}              offset   - Start of pagination (optional)
   *
   * @return  {Promise<Companies>}           - Returns a list of companies
   */
  public async search(q: string, orderBy?: string, limit?: number, offset?: number): Promise<Companies> {
    // TODO: Change country
    const data: ISearchParams = { country: 'FR' };
    const prefix = getPrefixTypeSearchCompanies(q);
    if (prefix === SearchCompaniesType.QUERY) {
      data.nameClosestKeywords = q;
    } else {
      data.registrationNumber = q;
    }

    const res: ISearch[] = await this.callApi(data);
    const status = [ 'N', 'I', 'A', 'T', 'S', 'K', 'O' ];
    const companies: any = [];
    res.forEach(company => {
      if (status.includes(company.status) && company.officeType === 1) {
        const siren: any = (company.legalRegistrationNumber) ? company.legalRegistrationNumber.slice(0, 9) : null;
        companies.push({
          source: 'OFFICIAL_TREEZOR',
          siren,
          siret: company.legalRegistrationNumber,
          name: company.legalName,
          brandName: company.tradename,
          naf: company.activityType,
          nafNorm: null,
          numberEmployees: null,
          legalForm: null,
          category: null,
          incorporationAt: null,
          vatNumber: (siren) ? 'FR' + (12 + 3 * (siren % 97)) % 97 + siren : null,
          addresses: [],
        });
      }
    });

    let total: number = companies.length;
    if (companies.length > limit) {
      const nextResults: ISearch[] = await this.callApi(data);
      total += nextResults.length;
    }

    return {
      total,
      rows: companies,
    };
  }
}
