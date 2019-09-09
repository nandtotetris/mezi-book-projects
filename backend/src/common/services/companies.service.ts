import * as fs from 'fs';
import * as path from 'path';
import * as shortid from 'shortid';
import { Injectable, HttpException, HttpStatus, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  Company,
  CompanyStatus,
  CompanyKycStatus,
} from '../entities/company.entity';
import { SirenService } from '../../siren/siren.service';
import { Partner } from '../entities/partner.entity';
import { User } from '../entities/user.entity';
import { Email } from '../entities/email.entity';
import { List } from '../interfaces/common.interface';
import { Contact } from '../entities/contact.entity';
import { CreateOrUpdateCompanyDto } from '../dto/companies.dto';
import { TreezorService } from '../../payment/treezor.service';
import { IDocument } from '../../payment/interfaces/treezor/document.interface';
import { ITaxResidence } from '../../payment/interfaces/treezor/taxresidence.interface';
import {
  IBusiness,
  IBusinesses,
} from '../../payment/interfaces/treezor/business.interface';
import { IComplementaryInfos } from '../interfaces/company.interface';
import { AccountingPreference, AccountingPreferenceType } from '../entities/accounting-preference.entity';
import { IUser, UserParentType } from '../../payment/interfaces/treezor/user.interface';
import { Mandate, MandateStatus } from '../entities/mandate.entity';
import { BankAccount } from '../entities/bank-account.entity';
import { ZendeskService } from '../../notification/zendesk.service';
import { ZendeskTicketType, ZendesTicketPriority } from '../../notification/interface/zendesk-ticket.interface';
import { File } from '../interfaces/file.interface';
import { LogoStorageService } from '../../storage/logo-storage.service';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(Partner)
    private readonly partnerRepository: Repository<Partner>,
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    @InjectRepository(Email)
    private readonly emailRepository: Repository<Email>,
    @InjectRepository(AccountingPreference)
    private readonly accountingPreferenceRepository: Repository<
      AccountingPreference
    >,
    @InjectRepository(BankAccount)
    private readonly bankAccountRepository: Repository<BankAccount>,
    @InjectRepository(Mandate)
    private readonly mandateRepository: Repository<Mandate>,
    private readonly sirenService: SirenService,
    private readonly treezorService: TreezorService,
    private readonly zendeskService: ZendeskService,
    private readonly logoStorageService: LogoStorageService,
  ) {}

  /**
   * Create accounting preferences
   *
   * @param   {Company}        company  - Current company user
   *
   * @return  {Promise<void>}
   */
  private async createAccountingPreferences(company: Company): Promise<void> {
    if (!company.claimer) {
      return;
    }

    await this.accountingPreferenceRepository.save([
      {
        enabled: true,
        order: 1,
        company,
        key: 'Journal de banque',
        value: 'BAN',
        description: null,
        type: AccountingPreferenceType.LEDGER_BANK,
      },
      {
        enabled: true,
        order: 0,
        company,
        key: 'Journal d\'achat',
        value: 'ACH',
        description: null,
        type: AccountingPreferenceType.LEDGER_PURCHASE,
      },
      {
        enabled: true,
        order: 2,
        company,
        key: 'Journal de vente',
        value: 'VEN',
        description: null,
        type: AccountingPreferenceType.LEDGER_SALES,
      },
      {
        enabled: true,
        order: 0,
        company,
        key: 'Compte TVA déductible',
        value: '445660',
        description: null,
        type: AccountingPreferenceType.VAT_ACCOUNT,
      },
      {
        enabled: true,
        order: 0,
        company,
        key: 'Compte banque Libeo',
        value: '512000',
        description: null,
        type: AccountingPreferenceType.BANK_ACCOUNT_TREEZOR,
      },
    ]);
  }

  private delay(ms: number): Promise<any> {
   return new Promise(res => setTimeout(res, ms));
  }

  /**
   * Create a wallet for the company at Treezor
   *
   * @param   {TreezorService}    treezor  - Instance of TreezorService
   * @param   {Company}           company  - Current company
   *
   * @return  {Promise<Company>}           - Returns the modified current company
   */
  private async createWallet(company: Company): Promise<Company> {
    if (company.treezorWalletId) {
      return company;
    }

    try {
      const wallet = await this.treezorService.createWallet({
        walletTypeId: 10,
        userId: company.treezorUserId,
        eventName: company.siren,
        tariffId: parseInt(process.env.TREEZOR_TARIFFID, 10),
        currency: 'EUR',
      });

      company.treezorWalletId = wallet.walletId || null;
      company.treezorIban = wallet.iban || null;
      company.treezorBic = wallet.bic || null;

      return company;
    } catch (err) {
      throw new HttpException(err.message, err.statusCode);
    }
  }

  /**
   * Create a moral user (company) at Treezor
   *
   * @param   {TreezorService}    treezor  - Instance of TreezorService
   * @param   {Company}           company  - Current company
   *
   * @return  {Promise<Company>}           - Returns the modified current company
   */
  private async createMoralUser(company: Company): Promise<Company> {
    if (company.treezorUserId) {
      return company;
    }

    try {
      const [address1] = company.addresses;
      const user = await this.treezorService.createUser({
        email: `payment.${shortid.generate()}@libeo.io`,
        userTypeId: 2,
        legalRegistrationNumber: company.siren,
        legalTvaNumber: company.vatNumber,
        legalName: company.name || company.brandName || '',
        legalForm: parseInt(company.legalForm, 10),
        legalRegistrationDate: company.incorporationAt,
        legalSector: company.naf,
        legalNumberOfEmployeeRange: company.numberEmployees || '0',
        legalAnnualTurnOver: company.legalAnnualTurnOver,
        legalNetIncomeRange: company.legalNetIncomeRange,
        phone: (company.phone) ? company.phone : '0000000000',
        address1: (address1) ? address1.address1 : null,
        city: (address1) ? address1.city : null,
        postcode: (address1) ? JSON.stringify(address1.zipcode) : null,
        country: 'FR',
      });
      company.treezorEmail = user.email || null;
      company.treezorUserId = user.userId || null;

      return company;
    } catch (err) {
      throw new HttpException(err.message, err.statusCode);
    }
  }

  /**
   * Create physical users with representatives
   *
   * @param   {TreezorService}  treezor  - Instance of TreezorService
   * @param   {Company}         company  - Current company
   *
   * @return  {Promise<void>}
   */
  private async createPhysicalUsers(company: Company): Promise<void> {
    let users = [];
    try {
      const { businessinformations } = await this.treezorService.getBusinessInformations({
        country: 'FR',
        registrationNumber: company.siren,
      });
      const [info] = businessinformations;
      if (info && info.users) {
        users = info.users;
      }
    } catch (err) {
      throw new HttpException(err.message, err.statusCode);
    }

    const promises = users.map(async user => {
      if (user.userTypeId !== 1) {
        return null;
      }

      try {
        return await this.treezorService.createUser({
          firstname: user.firstname || null,
          lastname: user.lastname || null,
          birthday: user.birthday || null,
          occupation: user.parentType || null,
          specifiedUSPerson: 0,
          parentUserId: company.treezorUserId,
          parentType: UserParentType.LEADER, // TODO: deprecated but required
          email: `payment.${shortid.generate()}@libeo.io`,
          userTypeId: 1,
        });
      } catch (err) {
        throw new HttpException(err.message, err.statusCode);
      }
    });

    try {
      await Promise.all(promises);
    } catch (err) {
      throw new HttpException(err.message, err.statusCode);
    }
  }

  /**
   * Hydrate the company with Treezor
   *
   * @param   {Company}  company  - Current company
   *
   * @return  {Company}           - Returns the hydrated company
   */
  private async hydrateCompanyWithTreezor(company: Company) {
    // Create a Treezor user for the company
    company = await this.createMoralUser(company);
    await company.save();
    // Delay for Treezor...
    await this.delay(300);
    // Create a Treezor wallet for the company
    company = await this.createWallet(company);
    await company.save();
    // Create the users with the representatives Treezor of the company
    await this.createPhysicalUsers(company);

    return company;
  }

  /**
   * Get the claimer of current company
   *
   * @param   {string}        companyId  - Company's id
   *
   * @return  {Promise<User}             - Returns the claimer user
   */
  public async getClaimer(companyId: string): Promise<User|null> {
    const company: Company = await this.companyRepository.findOne({ where: { id: companyId }, relations: ['claimer'] });
    if (!company) {
      throw new NotFoundException('api.error.company.not_found');
    }

    return company.claimer;
  }

  /**
   * Upload a logo for current company
   *
   * @param   {File}             file     - Logo file
   * @param   {Company}          company  - User's current company
   *
   * @return  {Promise<string>}           - Returns url to logo file
   */
  public async uploadLogo(file: File, company: Company): Promise<string> {
    try {
      const { fileLocation } = await this.logoStorageService.upload(file, company.id);
      company.logoUrl = fileLocation;
      await company.save();

      return fileLocation;
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  /**
   * Create a company shell
   *
   * @param   {User}              user  - Current user
   *
   * @return  {Promise<Company>}        - Returns created company
   */
  public async createCompanyShell(user: User): Promise<Company> {
    const company: Company = this.companyRepository.create();
    await this.companyRepository.save(company);
    user.currentCompany = company;
    await user.save();

    return company;
  }

  /**
   * Create or update a comapny
   *
   * @param   {User}                      user  - Current user
   * @param   {CreateOrUpdateCompanyDto}  data  - Data of company (optional)
   * @param   {string}                    id    - Company's id (optional)
   *
   * @return  {Promise<Company>}                - Returns created/updated company
   */
  public async createOrUpdateCompany(
    user: User,
    data?: CreateOrUpdateCompanyDto,
    id?: string,
  ): Promise<Company> {
    if (!data) {
      return this.createCompanyShell(user);
    }

    if (id) {
      let myCompany: Company = await this.companyRepository.findOne({ id });
      if (!myCompany) {
        throw new HttpException(
          'api.error.company.not_found',
          HttpStatus.NOT_FOUND,
        );
      }

      myCompany = Object.assign(myCompany, data);
      await this.companyRepository.save(myCompany);

      // Shell company
      if (!myCompany.siren) {
        const hydratedCompany = await this.hydrateCompanyWithTreezor(myCompany);
        return hydratedCompany;
      }

      return myCompany;
    }

    let company: Company = await this.findOneBySiren(data.siren);
    if (company) {
      throw new HttpException(
        'api.error.company.already',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Cast incorporationAt
    if (data && data.incorporationAt) {
      data.incorporationAt = new Date(+data.incorporationAt);
    }

    const currentCompany: Company = user.currentCompany;
    if (!currentCompany) {
      // Create and set currentCompany from a user (User without company)
      company = await this.companyRepository.create(data);
      company.claimer = user;
      company = await this.hydrateCompanyWithTreezor(company);
      user.currentCompany = company;
      await user.save();
    } else if (currentCompany.siren === null) {
      // Update currentCompany from a user (User with company shell)
      company = Object.assign(currentCompany, data);
      company.claimer = user;
      company = await this.hydrateCompanyWithTreezor(company);

    } else {
      // Create a new company without set currentCompany from user (User with company)
      company = await this.companyRepository.create(data);
      company.claimer = user;
      company = await this.hydrateCompanyWithTreezor(company);
    }

    // Create a email for contact
    const email: Email = new Email();
    email.email = user.email;
    email.visibleOnlyCompany = company.id;
    await this.emailRepository.save(email);

    // Create a contact for claimer user
    const contact: Contact = new Contact();
    contact.firstname = user.firstname;
    contact.lastname = user.lastname;
    contact.visibleOnlyCompany = company.id;
    contact.emails = [email];
    contact.user = user;
    contact.company = company;

    await this.contactRepository.save(contact);

    await this.createAccountingPreferences(company);

    return company;
  }

  /**
   * Search companies on a external API
   *
   * @param   {string}  query    - Parameter of search (name/siret/siren)
   * @param   {string}  orderBy  - Sort the request (optional)
   * @param   {number}  limit    - Number of returned companies (optional)
   * @param   {number}  offset   - Start of pagination (optional)
   *
   * @return  {Promise<any>}     - Returns a list of companies
   */
  public async searchCompanies(
    query: string,
    orderBy?: string,
    limit?: number,
    offset?: number,
  ): Promise<any> {
    return this.sirenService.search(query, orderBy, limit, offset);
  }

  /**
   * Get a company by id
   *
   * @param   {string}            id  - Company's id
   *
   * @return  {Promise<Company>}      - Returns the found company
   *
   * TODO: Move to repository
   */
  public async findOneById(id: string): Promise<Company> {
    return this.companyRepository.findOne({ id });
  }

  /**
   * Get a company by siren
   *
   * @param   {string}            siren  - Company's siren
   *
   * @return  {Promise<Company>}         - Returns the found company
   *
   * TODO: Move to repository
   */
  public async findOneBySiren(siren: string): Promise<Company> {
    return this.companyRepository.findOne({ siren });
  }

  /**
   * Get a company by siret
   *
   * @param   {string}            siret  - Company's siret
   *
   * @return  {Promise<Company>}         - Returns the found company
   *
   * TODO: Move to repository
   */
  public async findOneBySiret(siret: string): Promise<Company> {
    return this.companyRepository.findOne({ siret });
  }

  /**
   * Get current company by user
   *
   * @param   {User}              user  - Current user
   *
   * @return  {Promise<Company>}        - Returns the user's current company or shell company created for the user
   */
  public async getCurrentCompanyByUser(user: User): Promise<Company> {
    if (!user.currentCompany) {
      return this.createCompanyShell(user);
    }

    return user.currentCompany;
  }

  /**
   * Get a status for a company
   *
   * @param   {User}                    user     - Current user
   * @param   {Company}                 company  - Current company
   *
   * @return  {Promise<CompanyStatus>}           - Returns the status of the current company
   */
  public async getStatus(user: User, company: Company): Promise<CompanyStatus> {
    if (!user) {
      return null;
    }

    // If this is my company
    if (user.currentCompany && user.currentCompany.siren === company.siren) {
      return CompanyStatus.SELF;
    }

    // Get company
    const companyPartner: Company = await this.findOneBySiren(company.siren);

    // If it's one of my partners
    const nbPartners: number = await this.partnerRepository.count({
      companyInitiator: user.currentCompany,
      companyPartner,
    });
    if (nbPartners > 0) {
      return CompanyStatus.ALREADY;
    }

    // If it already exists
    if (companyPartner) {
      return CompanyStatus.EXIST;
    }

    // If it does not exist
    return CompanyStatus.UNKNOWN;
  }

  /**
   * Get companies by user
   *
   * @param   {User}           user     - Current user
   * @param   {string}         orderBy  - Sort the request (optional)
   * @param   {number}         limit    - Number of returned companies (optional)
   * @param   {number}         offset   - Start of pagination (optional)
   *
   * @return  {Promise<List>}           - Returns a list of companies
   *
   * TODO: Move to repository
   */
  public async findByUser(
    user: User,
    orderBy?: string,
    limit?: number,
    offset?: number,
  ): Promise<List> {
    const contacts: Contact[] = await this.contactRepository.find({
      user: { id: user.id },
    });
    if (contacts.length === 0) {
      return {
        total: 0,
        rows: [],
      };
    }

    const companyIds: string[] = contacts.map(contact => {
      if (contact.company) {
        return contact.company.id;
      }

      return null;
    });

    const [companies, total]: [
      Company[],
      number
    ] = await this.companyRepository.findAndCount({
      where: { id: In(companyIds) },
      take: limit,
      skip: offset,
    });

    return {
      total,
      rows: companies,
    };
  }

  /**
   * Get (Generate) a contact for a company
   *
   * @param   {Company}          company  - The user's current company
   *
   * @return  {Promise<string>}           - Returns the url of the company's contract
   */
  public async getContract(company: Company): Promise<string> {
    const rootDirectory: string = path.resolve(
      `${__dirname}/../../../public/static`,
    );
    const destinationDirectory: string = path.resolve(
      `${rootDirectory}/companies/${company.id}`,
    );

    if (!fs.existsSync(destinationDirectory)) {
      fs.mkdirSync(destinationDirectory, { recursive: true });
    }

    try {
      // We copy the contract but later we will have to generate it
      await fs.copyFileSync(
        `${rootDirectory}/contract/contract.pdf`,
        `${destinationDirectory}/contract.pdf`,
      );
    } catch (err) {
      throw new HttpException(
        'api.error.company.contract',
        HttpStatus.BAD_REQUEST,
      );
    }

    return `companies/${company.id}/contract.pdf`;
  }

  /**
   * Sign the contract of company
   *
   * @param   {User}              user  - Current user
   *
   * @return  {Promise<boolean>}        - Returns TRUE if the contract is signed
   */
  public async signContract(user: User): Promise<boolean> {
    let company: Company = user.currentCompany;
    if (!company) {
      throw new HttpException(
        'api.error.company.not_found',
        HttpStatus.NOT_FOUND,
      );
    }

    company.signature = {
      userId: user.id,
      signedAt: new Date(),
    };

    await company.save();

    const { users } = await this.treezorService.getBeneficiaries({
      userTypeId: 1,
      userStatus: 'VALIDATED',
      parentUserId: company.treezorUserId,
    });

    let sendKyc: boolean = true;
    users.forEach((physicalUser: any) => {
      if (
        physicalUser.country === 'US' ||
        physicalUser.birthCountry === 'US' ||
        physicalUser.nationality === 'US'
      ) {
        sendKyc = false;
      }
    });

    if (!sendKyc) {
      company = await this.companyRepository.findOne({ where: { id: company.id }, relations: ['claimer'] });
      await this.zendeskService.createTicket({
        type: ZendeskTicketType.INCIDENT,
        priority: ZendesTicketPriority.HIGH,
        requester: { name: company.claimer.fullName, email: company.claimer.email },
        subject: 'KYC FATCA',
        comment: { body: `Le KYC necessite des documents complémentaires pour l'entreprise ${company.name}` },
      });
    }

    return true;
  }

  /**
   * Create a physical beneficiary with his documents at Treezor
   *
   * @param   {User}          user  - Current user
   * @param   {any}           data  - Data of beneficiary
   *
   * @return  {Promise<any>}        - Returns the physical beneficiary created with his documents
   */
  public async createBeneficiary(user: User, data: any): Promise<any> {
    const company: Company = user.currentCompany;
    if (!company) {
      throw new NotFoundException('api.error.company.not_found');
    }

    const { documents } = data;
    let beneficiary = null;

    data.userTag = {};
    if (data.isCurrentUser) {
      data.userTag.userId = user.id;
    }

    if (data.isHosted) {
      data.userTag.isHosted = true;
    }

    data.userTag = JSON.stringify(data.userTag);
    delete data.isCurrentUser;
    delete data.isHosted;
    delete data.documents;
    const { taxResidence } = data;
    delete data.taxResidence;
    data.userTypeId = 1;
    data.parentUserId = company.treezorUserId;
    data.parentType = 'leader'; // TODO: Deprecated but required by Treezor
    if (!data.userId) {
      data.email = `payment.${shortid.generate()}@libeo.io`;
    }

    try {
      beneficiary = data.userId
        ? await this.treezorService.updateUser(data)
        : await this.treezorService.createUser(data);
    } catch (err) {
      throw new BadRequestException(err.message, err);
    }

    // Create or Update and return the tax residence
    if (taxResidence) {
      data.taxResidence = await this.createOrUpdateTaxResidence(
        beneficiary.userId,
        taxResidence,
        beneficiary.country,
      );
    }

    if (!documents) {
      return beneficiary;
    }

    const promiseDocuments: any[] = documents.map(document => {
      document.userId = beneficiary.userId;
      return this.treezorService.createDocument(document);
    });

    try {
      beneficiary.documents = await Promise.all(promiseDocuments);
    } catch (err) {
      throw new BadRequestException(err.message, err);
    }

    return beneficiary;
  }

  /**
   * Remove a beneficiary at Treezor
   *
   * @param   {Company}       company  - Current company
   * @param   {number}        userId   - Treezor user's id
   *
   * @return  {Promise<IUser>}         - Returns removed beneficiary
   */
  public async removeBeneficiary(
    company: Company,
    userId: number,
  ): Promise<IUser> {
    try {
      return await this.treezorService.removeUser({ userId, origin: 'USER' });
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.BAD_GATEWAY);
    }
  }

  /**
   * Get a tax residence at Treezor
   *
   * @param   {number}                  userId   - User's id residence
   * @param   {string}                  country  - Country of the resident
   *
   * @return  {Promise<ITaxResidence>}           - Retuns a tax residence
   */
  public async getTaxResidence(
    userId: number,
    country: string,
  ): Promise<ITaxResidence> {
    try {
      return await this.treezorService.getTaxResidence(userId, country);
    } catch (err) {
      throw new HttpException(err.message, err.statusCode);
    }
  }

  /**
   * Create or update a tax residence at Treezor
   *
   * @param   {number}        userId      - User's id residence
   * @param   {string}        taxPayerId  - Tax payer's id
   * @param   {string}        country     - Country of the resident
   *
   * @return  {Promise<any>}              - Returns a tax residence
   */
  public async createOrUpdateTaxResidence(
    userId: number,
    taxPayerId: string,
    country: string,
  ): Promise<any> {
    let taxResidence: any = null;

    try {
      taxResidence = await this.treezorService.getTaxResidence(userId, country);
    } catch (err) {
      throw new HttpException(err.message, err.statusCode);
    }

    if (!taxResidence) {
      try {
        taxResidence = await this.treezorService.createTaxResidence({
          country,
          taxPayerId: taxPayerId ? taxPayerId : null,
          userId,
          liabilityWaiver: !taxPayerId ? true : false,
        });
      } catch (err) {
        throw new HttpException(err.message, err.statusCode);
      }
    }

    taxPayerId = taxPayerId ? taxPayerId : '';
    if (
      taxResidence &&
      (taxResidence.taxPayerId !== taxPayerId ||
        taxResidence.country !== country)
    ) {
      try {
        taxResidence = await this.treezorService.updateTaxResidence({
          taxResidenceId: taxResidence.id,
          country,
          taxPayerId: taxPayerId ? taxPayerId : null,
          userId,
          liabilityWaiver: !taxPayerId ? true : false,
        });
      } catch (err) {
        throw new HttpException(err.message, err.statusCode);
      }
    }

    return taxResidence;
  }

  /**
   * Remove a document at Treezor
   *
   * @param   {number}              documentId  - Document's ID Treezor
   *
   * @return  {Promise<IDocument>}              - Returns a document cancelled
   */
  public async removeDocument(documentId: number): Promise<IDocument> {
    try {
      // TODO: Check if my document
      return await this.treezorService.deleteDocument(documentId);
    } catch (err) {
      throw new HttpException(err.message, err.statusCode);
    }
  }

  /**
   * Get all representatives of current company at Treezor
   *
   * @param   {Company}        company  - User's current company
   *
   * @return  {Promise<List>}           - Returns a list of representatives
   */
  public async getRepresentatives(company: Company): Promise<List> {
    if (!company || !company.siren) {
      return {
        total: 0,
        rows: [],
      };
    }

    let info = null;

    try {
      const {
        businessinformations,
      } = await this.treezorService.getBusinessInformations({
        country: 'FR',
        registrationNumber: company.siren,
      });
      if (businessinformations && businessinformations.length > 0) {
        info = businessinformations[0];
      } else {
        return {
          total: 0,
          rows: [],
        };
      }
    } catch (err) {
      throw new HttpException(err.message, err.statusCode);
    }

    const users = info.users;

    return {
      total: users.length,
      rows: users,
    };
  }

  /**
   * Get all physical beneficiaries bank accounts at Treezor
   *
   * @param   {Company}        company  - User's current company
   * @param   {number}         limit    - Number of returned companies (optional)
   * @param   {number}         page     - Current page (optional)
   *
   * @return  {Promise<List>}           - Returns a list of physical beneficiaries
   */
  public async getBeneficiaries(
    company: Company,
    limit?: number,
    page?: number,
  ): Promise<List> {
    if (!company || !company.treezorUserId) {
      return {
        total: 0,
        rows: [],
      };
    }

    try {
      const { users } = await this.treezorService.getBeneficiaries({
        userTypeId: 1,
        userStatus: 'VALIDATED',
        parentUserId: company.treezorUserId,
      });
      return {
        total: users.length,
        rows: users,
      };
    } catch (err) {
      throw new HttpException(err.message, err.statusCode);
    }
  }

  /**
   * Get all documents of physical beneficiary at Treezor
   *
   * @param   {number}         userId  - Treezor user's id
   * @param   {number}         limit   - Number of returned companies (optional)
   * @param   {number}         page    - Current page (optional)
   *
   * @return  {Promise<List>}          - Returns a list of documents
   */
  public async getDocuments(
    userId: number,
    limit?: number,
    page?: number,
  ): Promise<List> {
    try {
      const { documents } = await this.treezorService.getDocuments({
        userId,
        pageCount: limit,
        pageNumber: page,
      });
      return {
        total: documents.length,
        rows: documents,
      };
    } catch (err) {
      throw new HttpException(err.message, err.statusCode);
    }
  }

  /**
   * Update KYC status of company
   *
   * @param   {User}              user    - Current user
   * @param   {CompanyKycStatus}  status  - The new status of KYC
   *
   * @return  {Promise<Company>}          - Returns the modified company
   */
  public async updateKycStatus(
    user: User,
    status: CompanyKycStatus,
  ): Promise<Company> {
    const company: Company = user.currentCompany;
    if (!company) {
      throw new HttpException(
        'api.error.company.not_found',
        HttpStatus.NOT_FOUND,
      );
    }

    company.kycStatus = status;
    await company.save();

    return company;
  }

  /**
   * Save current KYC step
   *
   * @param   {Company}           company  - Current company
   * @param   {string}            step     - Current KYC step
   *
   * @return  {Promise<Company>}           - Return the updated current company
   */
  public async updateKycStep(company: Company, step: string): Promise<Company> {
    if (!company) {
      throw new HttpException(
        'api.error.company.not_found',
        HttpStatus.NOT_FOUND,
      );
    }

    company.kycStep = step;
    await company.save();

    return company;
  }

  /**
   * Get all already known business information at Treezor
   *
   * @param   {string}            siren  - Siren of company
   *
   * @return  {Promise<Company>}         - Returns the company with additional information
   */
  public async getCompanyComplementaryInfos(
    siren: string,
  ): Promise<IComplementaryInfos> {
    try {
      const {
        businessinformations,
      }: IBusinesses = await this.treezorService.getBusinessInformations({
        country: 'FR',
        registrationNumber: siren,
      });

      const [info]: IBusiness[] = businessinformations;
      const complementaryInfos: IComplementaryInfos = {
        capital: Number(info.legalShareCapital) || null,
        legalAnnualTurnOver: info.legalAnnualTurnOver || null,
        numberEmployees: info.legalNumberOfEmployeeRange || null,
        legalNetIncomeRange: info.legalNetIncomeRange || null,
        phone: (info.phone) ? info.phone.split(' ').join('') : null,
        addresses: {
          total: 1,
          rows: [{
            siret: (info.legalRegistrationNumber) ? info.legalRegistrationNumber.slice(0, 9) : null,
            address1: info.address1 || null,
            address2: null,
            zipcode: info.postcode || null,
            city: info.city || null,
            country: 'France',
          }],
        }
      };

      return complementaryInfos;
    } catch (err) {
      throw new HttpException(err.message, err.statusCode);
    }
  }

  public async getSignedMandate(company: Company): Promise<Mandate> {
    // TODO: create a custom repository for companies
    const bankAccount: BankAccount = await this.bankAccountRepository.findOne({
      company,
      default: true,
    });
    if (!bankAccount) {
      throw new Error('Bank account not found');
    }

    const mandate: Mandate = await this.mandateRepository.findOne({
      bankAccount,
      status: MandateStatus.SIGNED,
    });
    if (!mandate) {
      throw new Error('Mandate not found');
    }

    return mandate;
  }
}
