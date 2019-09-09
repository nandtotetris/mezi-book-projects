import { ICreateWalletParams } from './interfaces/treezor/wallet.interface';
import { ICreateUserParams, IUpdateUserParams, IUserParams, IUser } from './interfaces/treezor/user.interface';
import { IBalanceParams } from './interfaces/treezor/balance.interface';
import { ITransactionParams } from './interfaces/treezor/transaction.interface';
import { IBusinessParams, IBusinesses, ISearchParams, ISearch } from './interfaces/treezor/business.interface';
import { IDocumentParams, IDocuments, IDocument } from './interfaces/treezor/document.interface';
import { ICreateBeneficiaryParams, IBeneficiary } from './interfaces/treezor/beneficiary.interface';
import { ICreatePayoutParams, IPayout } from './interfaces/treezor/payout.interface';
import { TreezorAPI, MutationMethod } from './treezor.api';
import { ICreateTaxResidenceParams, ITaxResidence, IUpdateTaxResidenceParams } from './interfaces/treezor/taxresidence.interface';
import { ICreateMandateParams, IMandate, IDeleteMandateParams, ICreateMandateMandatoryParams } from './interfaces/treezor/mandate.interface';
import { Injectable } from '@nestjs/common';
import { ICreatePayinParams, ITreezorPayin } from './interfaces/treezor/payin.interface';
import { InjectConfig, ConfigService } from 'nestjs-config';
import { TreezorConfig } from '../config/treezor';

@Injectable()
export class TreezorService {
  private readonly config: TreezorConfig;

  constructor(
    private readonly treezorApi: TreezorAPI,
    @InjectConfig() configService: ConfigService

  ) {
    this.config = configService.get('treezor');
  }

  /**
   * Create a single user
   */
  public async createUser(data: ICreateUserParams): Promise<any> {
    return this.treezorApi.mutation('/users', { body: data });
  }

  /**
   * Update a single user
   */
  public async updateUser(data: IUpdateUserParams): Promise<any> {
    return this.treezorApi.mutation(`/users/${data.userId}`, { body: data, method: MutationMethod.PUT });
  }

  /**
   * Change user's status to CANCELED
   */
  public async removeUser(data: any): Promise<IUser> {
    const { userId } = data;
    delete data.userId;

    return this.treezorApi.mutation(`/users/${userId}`, { body: data, method: MutationMethod.DELETE });
  }

  /**
   * Create a new tax residence
   */
  public async createTaxResidence(data: ICreateTaxResidenceParams): Promise<ITaxResidence> {
    return this.treezorApi.mutation('/taxResidences', { body: data });
  }

  /**
   * Update a residence already created
   */
  public async updateTaxResidence(data: IUpdateTaxResidenceParams): Promise<ITaxResidence> {
    const { taxResidenceId } = data;
    delete data.taxResidenceId;

    return this.treezorApi.mutation(`/taxResidences/${taxResidenceId}`, { body: data, method: MutationMethod.PUT });
  }

  /**
   * Create a single wallet for a user
   */
  public async createWallet(data: ICreateWalletParams): Promise<any> {
    return this.treezorApi.mutation('/wallets', { body: data, objectIdKey: 'walletId' });
  }

  /**
   * Create a document for a beneficiary
   */
  public async createDocument(data: any): Promise<any> {
    if (!data.file) {
      return null;
    }

    const file = await data.file;
    const base64 = new Promise((resolve, reject) => {
      const chunks = [];
      file.createReadStream()
      .on('error', reject)
      .on('data', (chunk: any) => chunks.push(chunk))
      .on('close', () => resolve(Buffer.concat(chunks).toString('base64')));
    });

    delete data.file;
    data.fileContentBase64 = await base64;

    return this.treezorApi.mutation('/documents', { form: data, objectIdKey: 'documentId', sign: false });
  }

  /**
   * Create a beneficiary bank account
   */
  public async createBeneficiary(data: ICreateBeneficiaryParams): Promise<IBeneficiary> {
    return this.treezorApi.mutation('/beneficiaries', { body: data });
  }

  /**
   * Create a new pay out in the system
   */
  public async createPayout(data: ICreatePayoutParams): Promise<IPayout> {
    return this.treezorApi.mutation('/payouts', { body: data });
  }

  /**
   * Change pay out status to CANCELED. A VALIDATED pay out can't be canceled
   */
  public async deletePayout(payoutId: number): Promise<any> {
    return this.treezorApi.mutation(`/payouts/${payoutId}`, { method: MutationMethod.DELETE });
  }

  /**
   * Create a new pay in in the system
   */
  public async createPayin(data: ICreatePayinParams): Promise<ITreezorPayin> {
    data.paymentMethodId = 21;
    data.messageToUser = data.messageToUser.slice(0, 140);
    return this.treezorApi.mutation('/payins', { body: data });
  }

  /**
   * Deactivate a payin in the system
   */
  public async deletePayin(payinId: number): Promise<any> {
    return this.treezorApi.mutation(`/payins/${payinId}`, { method: MutationMethod.DELETE });
  }

  /**
   * Remove a document from the system
   *
   * @param   {number}              documentId  - Document's internal id
   *
   * @return  {Promise<IDocument>}              - Return a document cancelled
   */
  public async deleteDocument(documentId: number): Promise<IDocument> {
    return this.treezorApi.mutation(`/documents/${documentId}`, { method: MutationMethod.DELETE });
  }

  /**
   * Get all transactions
   */
  public async getTransactions(params: ITransactionParams): Promise<any> {
    return this.treezorApi.query('/transactions', { qs: params });
  }

  /**
   * Get all balances
   */
  public async getBalances(params: IBalanceParams): Promise<any> {
    return this.treezorApi.query('/balances', { qs: params });
  }

  /**
   * Get business informations with siren
   */
  public async getBusinessInformations(params: IBusinessParams): Promise<IBusinesses> {
    return this.treezorApi.query('/businessinformations', { qs: params, sign: false });
  }

  /**
   * Get all users
   */
  public async getBeneficiaries(params: IUserParams): Promise<any> {
    return this.treezorApi.query('/users', { qs: params });
  }

  /**
   * Get a beneficiary bank account from the system
   */
  public async getBeneficiary(beneficiaryId: number): Promise<any> {
    return this.treezorApi.query(`/beneficiaries/${beneficiaryId}`, {})
      .then(res => {
        const { beneficiaries } = res;
        const [ beneficiary ] = beneficiaries;
        Promise.resolve(beneficiary);
      });
  }

  /**
   * Get all documents
   */
  public async getDocuments(params: IDocumentParams): Promise<IDocuments> {
    return this.treezorApi.query('/documents', { qs: params });
  }

  /**
   * Get a single user
   */
  public async getUser(params: any): Promise<any> {
    const { userId } = params;
    delete params.userId;

    return this.treezorApi.query(`/users/${userId}`, { qs: params })
      .then(res => {
        const { users } = res;
        const [ user ] = users;
        Promise.resolve(user);
      });
  }

  /**
   * Read the informations of a residence that match with id
   */
  public async getTaxResidence(userId: number, country: string): Promise<any> {
    return this.treezorApi.query(`/taxResidences`, { qs: { userId } })
      .then(res => {
        const { taxResidences } = res;

        Promise.resolve(taxResidences.find((taxResidence: any) => {
          if (country === taxResidence.country && !taxResidence.isDeleted) {
            return taxResidence;
          }
        }));
      });
  }

  /**
   * Perform a KYC review for given user
   */
  public async kycReview(data: any): Promise<any> {
    const { userId } = data;
    delete data.userId;

    return this.treezorApi.mutation(`/users/${userId}/Kycreview/`, { body: data, method: MutationMethod.PUT });
  }

  /**
   * Create a mandate
   */
  public createMandate(data: ICreateMandateParams): Promise<IMandate> {
    const body: ICreateMandateMandatoryParams = {
      ...data,
      userId: this.config.treezorAccountLibeo
    };

    return this.treezorApi.mutation('/mandates', { body });
  }

  /**
   * Delete a mandate
   */
  public deleteMandate(data: IDeleteMandateParams): Promise<IMandate> {
    const { mandateId } = data;
    delete data.mandateId;

    return this.treezorApi.mutation(`/mandates/${mandateId}`, { body: data, method: MutationMethod.DELETE });
  }

  /**
   * Get some business information
   */
  public getBusinessSearchs(data: ISearchParams): Promise<ISearch[]> {
    return this.treezorApi.query('/businesssearchs', { qs: data });
  }
}
