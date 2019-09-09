import * as moment from 'moment';
import * as rp from 'request-promise-native';
import { fetch } from 'apollo-server-env';
import { Strategy, Companies, Company } from '../interfaces/strategy.interface';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SearchCompaniesType, getPrefixTypeSearchCompanies } from '../utils.service';
import { InjectConfig, ConfigService } from 'nestjs-config';

@Injectable()
export class SirenStrategy implements Strategy {
  constructor(
    @InjectConfig() config: ConfigService
  ) {
    const sirenConfig = config.get('siren');
    this.baseUrl = sirenConfig.SIREN_API_URL;
    this.endpoint = this.baseUrl + '/entreprises/sirene/V3';
    this.bearerToken = sirenConfig.SIREN_BEARER_TOKEN;
    this.basicToken = sirenConfig.SIREN_BASIC_TOKEN;

  }
  public readonly baseUrl: string = process.env.SIREN_API_URL;
  public readonly endpoint: string = this.baseUrl + '/entreprises/sirene/V3';
  private bearerToken: string = process.env.SIREN_BEARER_TOKEN;
  private readonly basicToken: string = process.env.SIREN_BASIC_TOKEN;

  /**
   * Serialize object of response API
   */
  private serialize(data: any): Company {
    const addressNumber: string = (data.adresseEtablissement.numeroVoieEtablissement) ? data.adresseEtablissement.numeroVoieEtablissement + ' ' : '';
    const addressNumberComplement: string = (data.adresseEtablissement.indiceRepetitionEtablissement) ? data.adresseEtablissement.indiceRepetitionEtablissement + ' ' : '';
    const addressStreet: string = (data.adresseEtablissement.typeVoieEtablissement && data.adresseEtablissement.libelleVoieEtablissement) ? data.adresseEtablissement.typeVoieEtablissement + ' ' + data.adresseEtablissement.libelleVoieEtablissement : '';

    return {
      source: 'OFFICIAL_SIREN',
      siren: data.siren || null,
      siret: data.siret || null,
      name: data.uniteLegale.denominationUniteLegale || null,
      naf: data.uniteLegale.activitePrincipaleUniteLegale || null,
      nafNorm: data.uniteLegale.nomenclatureActivitePrincipaleUniteLegale || null,
      brandName: data.uniteLegale.denominationUsuelle1UniteLegale || null,
      numberEmployees: data.uniteLegale.trancheEffectifsUniteLegale || null,
      legalForm: data.uniteLegale.categorieJuridiqueUniteLegale || null,
      category: data.uniteLegale.categorieEntreprise || null,
      incorporationAt: (data.dateCreationEtablissement) ? new Date(data.dateCreationEtablissement) : null,
      vatNumber: (data.siren) ? 'FR' + (12 + 3 * (data.siren % 97)) % 97 + data.siren : null,
      addresses: {
        total: 1,
        rows: [{
          siret: data.siret || null,
          address1: addressNumber + addressNumberComplement + addressStreet,
          address2: null,
          zipcode: data.adresseEtablissement.codePostalEtablissement || null,
          city: data.adresseEtablissement.libelleCommuneEtablissement || null,
          country: 'France',
        }],
      },
    };
  }

  /**
   * Refresh bearer token
   */
  private async refreshToken(): Promise<string> {
    const response: any = await fetch(this.baseUrl + '/token', {
      method: 'POST',
      credentials: 'include',
      body: 'grant_type=client_credentials',
      headers: {
        'Authorization': 'Basic ' + this.basicToken,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (response.status !== HttpStatus.OK) {
      throw new HttpException(response.statusText, response.status);
    }

    const { access_token }: any = await response.json();

    return access_token;
  }

  /**
   * Research on the SIRENE API
   */
  public async search(query: string, orderBy?: string, limit?: number, offset?: number): Promise<Companies> {
    const q = query;
    const date = moment().format('YYYY-MM-DD');
    const fields = [
      'siren',
      'siret',
      'denominationUniteLegale',
      'activitePrincipaleUniteLegale',
      'nomenclatureActivitePrincipaleUniteLegale',
      'denominationUsuelle1UniteLegale',
      'trancheEffectifsUniteLegale',
      'categorieJuridiqueUniteLegale',
      'categorieEntreprise',
      'dateCreationEtablissement',
      'numeroVoieEtablissement',
      'indiceRepetitionEtablissement',
      'typeVoieEtablissement',
      'libelleVoieEtablissement',
      'codePostalEtablissement',
      'libelleCommuneEtablissement',
    ];

    const prefix = getPrefixTypeSearchCompanies(query);
    let additionalConditions: string = ' AND etatAdministratifUniteLegale:"A" AND etatAdministratifUniteLegale:"A"';

    if (prefix !== SearchCompaniesType.SIRET) {
      additionalConditions += ' AND etablissementSiege:"true"';
    }

    if (prefix === SearchCompaniesType.QUERY) {
      let words = query.split(' ');
      const nbWords = words.length;
      words = words.map((word, index) => {
        if (index === 0) {
          return `${SearchCompaniesType.QUERY}:"*${word}"`;
        } else if (index === (nbWords - 1)) {
          return `${SearchCompaniesType.QUERY}:"${word}*"`;
        } else {
          return `${SearchCompaniesType.QUERY}:"*${word}"`;
        }
      });
      query = words.join(' AND ');
    } else {
      query = `${prefix}:"${query}"`;
    }

    const url: string = `${this.endpoint}/siret?q=${query}${additionalConditions}&champs=${fields.join()}&debut=${(offset || 0)}&nombre=${(limit || 10)}&date=${date}`;

    try {
      const response: any = await rp.get(url, {
        headers: {
          Authorization: 'Bearer ' + this.bearerToken,
        },
        timeout: 3000, // 3s
        json: true,
      });

      const companies: Company[] = [];
      let total: number = 0;

      if (response) {
        total = response.header.total;

        await response.etablissements.forEach(async (element, index) => {
          companies.push(this.serialize(element));
        });
      }

      return {
        total,
        rows: companies,
      };
    } catch (err) {
      if (err.error && err.error.code && (err.error.code === 'ETIMEDOUT' || err.error.code === 'ESOCKETTIMEDOUT')) {
        throw err;
      }

      if (err.statusCode === HttpStatus.UNAUTHORIZED) {
        this.bearerToken = await this.refreshToken();
        return this.search(q, orderBy, limit, offset);
      }

      throw new HttpException(err.message, err.statusCode);
    }
  }
}
