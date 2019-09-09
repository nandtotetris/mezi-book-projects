import * as uuid from 'uuid';
import * as moment from 'moment';
import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Mandate, MandateStatus } from '../entities/mandate.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../entities/company.entity';
import { TreezorService } from '../../payment/treezor.service';
import { MandateSequenceType, IMandate, MandateSddType, MandateOrigin, ICreateMandateParams } from '../../payment/interfaces/treezor/mandate.interface';
import { BankAccount } from '../entities/bank-account.entity';
import { Address } from '../entities/address.entity';
import { User } from '../entities/user.entity';
import { MandateRepository } from '../repositories/mandate.repository';
import { EmailMessage } from '../../notification/interface/email-message.interface';
import { EmailService } from '../../notification/email.service';
import { SignMandateEmailPaylaod } from '../../notification/interface/email-payload/sign-mandate.payload';
import { ConfirmMandateEmailPayload } from '../../notification/interface/email-payload/confirm-mandate.payload';

@Injectable()
export class MandatesService {
  constructor(
    @InjectRepository(Mandate)
    private readonly mandateRepository: MandateRepository,
    @InjectRepository(BankAccount)
    private readonly bankAccountRepository: Repository<BankAccount>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    private readonly emailService: EmailService,
    private readonly treezorService: TreezorService
  ) {}

  /**
   * Create a mandate
   *
   * @param   {User}              user           - Current user
   * @param   {string}            bankAccountId  - Bank account's id
   * @param   {string}            ip             - IP Address of current user
   *
   * @return  {Promise<Mandate>}                 - Returns created mandate
   */
  public async createMandate(user: User, bankAccountId: string, ip: string): Promise<Mandate> {
    const company: Company = user.currentCompany;
    if (!company) {
      throw new HttpException('api.error.company.not_found', HttpStatus.NOT_FOUND);
    }

    const bankAccount: BankAccount = await this.bankAccountRepository.findOne({ where: { id: bankAccountId }, relations: ['iban'] });
    if (!bankAccount) {
      throw new HttpException('api.error.bank_account.not_found', HttpStatus.NOT_FOUND);
    }

    let defaultAddress: Address|null =  null;
    if (company.addresses && company.addresses.length > 0) {
      defaultAddress = company.addresses[0];
    } else {
      // TODO: Add default param on query
      defaultAddress = await this.addressRepository.findOne({ where: { company }, order: { createdAt: 'DESC' } });
    }

    let debtorAddress: string = '';
    if (defaultAddress) {
      if (defaultAddress.address1) {
        debtorAddress = defaultAddress.address1;
       }

      if (defaultAddress.address2) {
         debtorAddress += ` / ${defaultAddress.address2}`;
       }
    }

    let treezorMandate: IMandate = null;
    const params: ICreateMandateParams = {
      sddType: MandateSddType.CORE,
      isPaper: true,
      debtorName: company.name || company.brandName || '',
      debtorAddress,
      debtorCity: (defaultAddress) ? defaultAddress.city : '',
      debtorZipCode: (defaultAddress) ? defaultAddress.zipcode.toString() : '',
      debtorCountry: (defaultAddress) ? defaultAddress.country : '',
      debtorIban: (bankAccount.iban) ? bankAccount.iban.iban : '',
      debtorBic: (bankAccount.iban) ? bankAccount.iban.bic : '',
      sequenceType: MandateSequenceType.RECURRENT,
      createdIp: ip,
      signatureDate: moment().format('YYYY-MM-DD'),
    };

    // Create mandate at Treezor
    try {
      treezorMandate = await this.treezorService.createMandate(params);
    } catch (err) {
      throw new HttpException(err.message, err.statusCode);
    }

    // Create mandate
    const mandate: Mandate = this.mandateRepository.create({
      bankAccount,
      treezorMandateId: treezorMandate.mandateId.toString(),
      rum: treezorMandate.uniqueMandateReference,
      status: MandateStatus.VALIDATED,
      signatory: user,
      signatoryIp: ip,
      signaturedAt: new Date()
    });

    await mandate.save();

    return mandate;
  }

  /**
   * Signed a mandate
   *
   * @param   {Company}           company    - Current company user
   * @param   {string}            mandateId  - Mandate's id
   * @param   {string}            code       - Validation code to sign the mandate
   *
   * @return  {Promise<Mandate>}             - Returns a signed mandate
   */
  public async signedMandate(user: User, mandateId: string, code: string): Promise<Mandate> {
    if (!user.currentCompany) {
      throw new HttpException('api.error.company.not_found', HttpStatus.NOT_FOUND);
    }

    const mandate: Mandate = await this.mandateRepository.findOneWithRelationships(mandateId, user.currentCompany);
    if (!mandate) {
      throw new HttpException('api.error.mandate.not_found', HttpStatus.NOT_FOUND);
    }

    if (mandate.validationCode !== code) {
      throw new HttpException('api.error.mandate.invalid_code', HttpStatus.BAD_REQUEST);
    }

    mandate.status = MandateStatus.SIGNED;
    await mandate.save();

    const message: EmailMessage<ConfirmMandateEmailPayload> = {
      From: {
        Email: 'lucas@libeo.io',
        Name: 'Service Client Libeo',
      },
      To: [{
        Email: user.email,
        Name: user.fullName,
      }],
      TemplateID:  823915,
      TemplateLanguage: true,
      Subject: 'Confirmation : mandat de prélèvement SEPA activé',
      Variables: {
        fullName: user.fullName,
        bankAccountLabel: mandate.bankAccount.label,
        mandateRum: mandate.rum,
      },
    };

    await this.emailService.send([message]);

    return mandate;
  }

  /**
   * Get a mandate by ID
   *
   * @param   {Company}           company    - Current company user
   * @param   {string}            mandateId  - Mandate's id
   *
   * @return  {Promise<Mandate>}             - Returns a mandate
   */
  public async getMandate(company: Company, mandateId: string): Promise<Mandate> {
    const mandate: Mandate = await this.mandateRepository.findOneWithRelationships(mandateId, company);

    if (!mandate) {
      throw new HttpException('api.error.mandate.not_found', HttpStatus.NOT_FOUND);
    }

    return mandate;
  }

  /**
   * Generate a code for a mandate
   *
   * @param   {User}              user       - Current user
   * @param   {string}            mandateId  - Mandate's id
   *
   * @return  {Promise<Mandate>}             - Returns the mandate
   */
  public async generateCodeMandate(user: User, mandateId: string): Promise<Mandate> {
    const mandate: Mandate = await this.mandateRepository.findOneWithRelationships(mandateId, user.currentCompany);
    if (!mandate) {
      throw new HttpException('api.error.mandate.not_found', HttpStatus.NOT_FOUND);
    }

    if (mandate.status !== MandateStatus.VALIDATED) {
      throw new HttpException('api.error.mandate.invalid_status', HttpStatus.BAD_REQUEST);
    }

    // Generate code
    const code: string = uuid.v4().replace('-', '').slice(0, 6);
    mandate.validationCode = code;
    await mandate.save();

    const message: EmailMessage<SignMandateEmailPaylaod> = {
      To: [{
        Email: user.email,
        Name: user.fullName,
      }],
      TemplateID:  824526,
      Subject: 'Signez le mandat de prélèvement SEPA',
      Variables: {
        fullName: user.fullName,
        bankAccountLabel: mandate.bankAccount.label,
        mandateSignatureCode: code,
      },
    };

    await this.emailService.send([message]);

    return mandate;
  }

  /**
   * Remove a mandate in Treezor
   *
   * @param   {Company}           company    - Current company user
   * @param   {string}            mandateId  - Mandate's id
   *
   * @return  {Promise<Mandate>}             - Returns a removed mandate
   */
  public async removeMandate(company: Company, mandateId: string): Promise<Mandate> {
    if (!company) {
      throw new HttpException('api.error.company.not_found', HttpStatus.NOT_FOUND);
    }

    const mandate: Mandate = await this.mandateRepository.findOneWithRelationships(mandateId, company);
    if (!mandate) {
      throw new HttpException('api.error.mandate.not_found', HttpStatus.NOT_FOUND);
    }

    if (mandate.status === MandateStatus.CANCELED) {
      throw new HttpException('api.error.mandate.invalid_status', HttpStatus.NOT_FOUND);
    }

    if (mandate.status !== MandateStatus.SIGNED) {
      throw new HttpException('api.error.mandate.invalid_status', HttpStatus.BAD_REQUEST);
    }

    try {
      await this.treezorService.deleteMandate({ mandateId: mandate.treezorMandateId, origin: MandateOrigin.CREDITOR });
    } catch (err) {
      throw new HttpException(err.message, err.statusCode);
    }

    mandate.status = MandateStatus.CANCELED;
    await mandate.save();

    return mandate;
  }
}
