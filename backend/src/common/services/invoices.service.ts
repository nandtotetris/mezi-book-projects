import * as uuid from 'uuid';
import { Injectable, HttpException, HttpStatus, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not } from 'typeorm';
import { Invoice, InvoiceStatus } from '../entities/invoice.entity';
import { CreateInvoiceDto } from '../dto/invoices.dto';
import { User } from '../entities/user.entity';
import { CompaniesService } from './companies.service';
import { List } from '../interfaces/common.interface';
import { Company, CompanyProvisionningStrategies } from '../entities/company.entity';
import { OcrService } from '../../ocr/ocr.service';
import { File } from '../interfaces/file.interface';
import { PartnersService } from './partners.service';
import { IbansService } from './ibans.service';
import { Iban } from '../entities/iban.entity';
import { IValidateIban } from '../interfaces/iban.interface';
import { EmailService } from '../../notification/email.service';
import { EmailMessage } from '../../notification/interface/email-message.interface';
import { ConfirmPaymentEmailPaylaod } from '../../notification/interface/email-payload/confirm-payment.payload';
import { Payment, PaymentStatus } from '../entities/payment.entity';
import { InvoiceStorageService } from '../../storage/invoice-storage.service';
import { RibStorageService } from '../../storage/rib-storage.service';
import { ZendeskService } from '../../notification/zendesk.service';
import { ZendeskTicketType, ZendesTicketPriority } from '../../notification/interface/zendesk-ticket.interface';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
    private readonly companiesService: CompaniesService,
    private readonly partnersService: PartnersService,
    private readonly ibansService: IbansService,
    private readonly emailService: EmailService,
    private readonly invoiceStorageService: InvoiceStorageService,
    private readonly ribStorageService: RibStorageService,
    private readonly zendeskService: ZendeskService,
  ) {}

  /**
   * Get IBAN from string
   *
   * @param   {string}  str  - The string to be parsed
   *
   * @return  {string}       - Returns the iban if it has been found
   */
  private extractIban(str: string): string | null {
    const ibanRegex: RegExp = /([A-Z]{2}[ \-]?[0-9]{2})(?=(?:[ \-]?[A-Z0-9]){9,30}$)((?:[ \-]?[A-Z0-9]{3,5}){2,7})([ \-]?[A-Z0-9]{1,3})?/gm;
    const m: any = ibanRegex.exec(str);

    if (m !== null) {
      const iban: string = m[0].replace(/\s/g, '');
      if (iban.length >= 14) {
        return iban;
      }
    }

    return null;
  }

  /**
   * Uploaded of the invoice
   *
   * @param   {Invoice}        invoice  - Invoice associated with the file
   * @param   {File}           file     - File to be uploaded
   *
   * @return  {Promise<void>}
   */
  private async importingInvoice(invoice: Invoice, file: File): Promise<void> {
    try {
      const { fileLocation } = await this.invoiceStorageService.upload(file, invoice.companyReceiver.id);
      invoice.status = InvoiceStatus.IMPORTED;
      invoice.filepath = fileLocation;
      invoice.importAt = new Date();
      await invoice.save();
      await this.scanningInvoice(invoice, fileLocation);
    } catch (err) {
      if (invoice.status !== InvoiceStatus.SCANNED) {
        invoice.status = InvoiceStatus.IMPORTED;
      }

      invoice.error = true;
      invoice.save();
      throw new Error(err);
    }
  }

  /**
   * Parse response of OCR
   */
  private async parseOcrInvoice(invoice: Invoice, body: any): Promise<Invoice> {
    if (!body || body.length === 0) {
      return invoice;
    }

    const [extract, raw]: [any, any] = body;
    invoice.ocrFeedback = { extract, raw };
    invoice.currency = extract.currency || null;
    invoice.total = extract.total || null;
    invoice.totalWoT = extract.totalWoT || null;
    invoice.invoiceDate = (extract.time) ? new Date(extract.time) : null;
    invoice.vatAmounts = extract.taxes || null;

    if (extract.vendorDatas) {
      const vendorDatas: any = extract.vendorDatas;
      if (vendorDatas.siren || vendorDatas.siret) {
        const result: any = await this.companiesService.searchCompanies(
          vendorDatas.siren || vendorDatas.siret,
        );
        if (result.total > 0) {
          invoice.ocrSirenFeedback = result.rows[0];
        }
      } else if (vendorDatas.name) {
        const result: any = await this.companiesService.searchCompanies(
          vendorDatas.name,
        );
        if (result.total > 0) {
          invoice.ocrSirenFeedback = result.rows[0];
        } else {
          invoice.ocrSirenFeedback = { name: vendorDatas.name };
        }
      }
    }

    if (raw && raw.pages && raw.pages.length > 0) {
      raw.pages.forEach((page: any) => {
        page.chunks.forEach((chunk: any) => {
          const tmpIban: string = this.extractIban(chunk.text);
          if (tmpIban) {
            invoice.ocrFeedback.iban = tmpIban;
          }
        });
      });
    }

    return invoice;
  }

  /**
   * Invoice scanning to extract data
   *
   * @param   {Invoice}        invoice   - Invoice to be scanned
   * @param   {string}         filePath  - Path to the file
   *
   * @return  {Promise<void>}
   */
  private async scanningInvoice(
    invoice: Invoice,
    filePath: string,
  ): Promise<void> {
    invoice.status = InvoiceStatus.SCANNING;
    await invoice.save();

    const type: string = 'jenji';
    const ocr: OcrService = new OcrService(type, {
      baseUrl: process.env.OCR_API_URL,
      username: process.env.OCR_USERNAME,
      apiKey: process.env.OCR_API_KEY,
    });

    // Load file in OCR
    try {
      await ocr.loadFile(filePath);
    } catch (err) {
      throw new Error(err);
    }

    // Get data from OCR and save
    try {
      const body = await ocr.getData();
      // Update Invoice with RawData
      invoice.status = InvoiceStatus.SCANNED;
      invoice.ocrPartner = type;
      invoice.ocrStatus = 'ok';
      invoice = await this.parseOcrInvoice(invoice, body);
      await invoice.save();
    } catch (err) {
      invoice.status = InvoiceStatus.SCANNED;
      invoice.error = true;
      invoice.ocrPartner = type;
      invoice.ocrFeedback = err.message;
      invoice.ocrStatus = 'error';
      await invoice.save();
      throw new HttpException(err.message, err.statusCode);
    }
  }

  /**
   * Upload a RIB and send notification
   *
   * @param   {File}             file       - RIB file
   * @param   {string}           invoiceId  - Current invoice's id
   *
   * @return  {Promise<string>}             - Returns the url to file
   */
  public async uploadRib(file: File, invoiceId: string): Promise<string> {
    if (!invoiceId) {
      throw new BadRequestException('api.error.invoice.missing');
    }

    const invoice: Invoice = await this.invoiceRepository.findOne({ where: { id: invoiceId } });
    if (!invoice) {
      throw new NotFoundException('api.error.invoice.not_found');
    }

    try {
      const { fileLocation } = await this.ribStorageService.upload(file, invoice.companyEmitter.id);

      const claimer: User = await this.companiesService.getClaimer(invoice.companyReceiver.id);

      this.zendeskService.createTicket({
        type: ZendeskTicketType.TASK,
        priority: ZendesTicketPriority.URGENT,
        requester: { name: claimer.fullName, email: claimer.email },
        subject: 'Vérification manuelle RIB',
        comment: { body: `L'entreprise ${invoice.companyEmitter.name || invoice.companyEmitter.brandName } a changé son IBAN pour recevoir le paiement de sa facture. Son RIB doit être vérifié manuellement.` },
      });

      return fileLocation;
    } catch (err) {
      throw new HttpException(err.message, err.statusCode);
    }
  }

  /**
   * Create a invoice
   *
   * @param   {User}              user  - Current user
   * @param   {CreateInvoiceDto}  data  - Invoice data
   *
   * @return  {Promise<Invoice>}        - Returns the created invoice
   */
  public async createInvoice(
    user: User,
    data: CreateInvoiceDto,
  ): Promise<Invoice> {
    const file: File = data.file ? await data.file : null;
    const invoice: Invoice = this.invoiceRepository.create();
    invoice.status = InvoiceStatus.IMPORTING;
    invoice.companyReceiver = await this.companiesService.getCurrentCompanyByUser(
      user,
    );
    invoice.importedBy = user;
    invoice.filename = file ? file.filename : null;
    await this.invoiceRepository.save(invoice);

    if (data.file) {
      try {
        await this.importingInvoice(invoice, file);
      } catch (err) {
        throw new HttpException(err.message, err.statusCode);
      }
    }

    return invoice;
  }

  /**
   * Create a invoice
   *
   * @param   {string}            id      - Invoice's ID
   * @param   {User}              user  - Current user
   * @param   {any}               data  - Invoice data
   * @return  {Promise<Invoice>}        - Returns the created invoice
   */
  public async createOrUpdateAR(
    user: User,
    id: string,
    data: any,
  ): Promise<Invoice> {
    const companyEmitter: Company = await this.companiesService.getCurrentCompanyByUser(
      user,
    );
    data.companyEmitter = companyEmitter;
    data.emitterId = user.id;
    if (data.companyEmitterDetails) {
      data.companyEmitterDetails.iban =
        companyEmitter && companyEmitter.treezorIban;
    }
    if (!data.companyReceiverDetails && !data.companyReceiverDetails.siren) {
      throw new HttpException(
        'api.error.company.siren',
        HttpStatus.BAD_REQUEST,
      );
    }
    const companyReceiver: Company = await this.companiesService.findOneBySiren(
      data.companyReceiverDetails.siren,
    );
    if (companyReceiver) {
      data.companyReceiver = companyReceiver;
      data.companyReceiverId = companyReceiver.id;
    }
    if (data.companyReceiverDetails) {
      data.companyReceiverDetails.iban =
        companyReceiver && companyReceiver.treezorIban;
    }
    let invoice: Invoice;
    if (id) {
      invoice = await this.invoiceRepository.findOne({
        id,
      });
      if (!invoice) {
        throw new HttpException(
          'api.error.invoice.not_found',
          HttpStatus.NOT_FOUND,
        );
      }

      if (!data.companyReceiver) {
        // remove invoice receiver when reset by frontend
        delete invoice.companyReceiver;
      }
      // if (data.companyReceiver) {
      //   await this.partnersService.createPartner(user, data.companyReceiver);
      // }
      this.invoiceRepository.merge(invoice, data);
    } else {
      invoice = await this.invoiceRepository.create();
      this.invoiceRepository.merge(invoice, data);

      if (!data.companyReceiver) {
        // remove invoice receiver when reset by frontend
        delete invoice.companyReceiver;
      }
      invoice.status = InvoiceStatus.AR_DRAFT;
    }

    invoice = await this.invoiceRepository.save(invoice);

    return invoice;
  }

  /**
   * Update invoice status
   *
   * @param   {string}            id      - Invoice's ID
   * @param   {InvoiceStatus}     status  - Invoice status
   *
   * @return  {Promise<Invoice>}          - Returns the modified invoice
   */
  public async updateStatus(
    id: string,
    status: InvoiceStatus,
  ): Promise<Invoice> {
    const invoice: Invoice = await this.invoiceRepository.findOne({ id });
    if (!invoice) {
      throw new HttpException(
        'api.error.invoice.not_found',
        HttpStatus.NOT_FOUND,
      );
    }

    invoice.status = status;
    await invoice.save();

    return invoice;
  }

  /**
   * Updating an invoice
   *
   * @param   {User}              user  - Current user
   * @param   {string}            id    - Invoice's ID
   * @param   {any}               data  - Invoice data
   *
   * @return  {Promise<Invoice>}        - Returns the modified invoice
   */
  public async updateInvoice(
    user: User,
    id: string,
    data: any,
  ): Promise<Invoice> {
    let invoice: Invoice = await this.invoiceRepository.findOne({
      id,
      companyReceiver: user.currentCompany,
    });
    if (!invoice) {
      throw new HttpException(
        'api.error.invoice.not_found',
        HttpStatus.NOT_FOUND,
      );
    }

    if (data.companyEmitter) {
      if (!data.companyEmitter.siren) {
        throw new HttpException(
          'api.error.company.siren',
          HttpStatus.BAD_REQUEST,
        );
      }

      let companyEmitter: Company = await this.companiesService.findOneBySiren(
        data.companyEmitter.siren,
      );
      if (!companyEmitter) {
        companyEmitter = await this.companiesService.createOrUpdateCompany(
          user,
          data.companyEmitter,
        );
      }

      data.companyEmitter = companyEmitter;
      invoice.status = InvoiceStatus.TO_PAY;
    } else { // remove invoice emitter when draftOcrSiren reset by frontend
      delete invoice.companyEmitter;
    }

    const { iban }: any = data;
    delete data.iban;

    this.invoiceRepository.merge(invoice, data);

    // Check IBAN
    if (iban) {
      const alreadyIban: Iban = await this.ibansService.findOneByIbanAndCompany(
        iban,
        invoice.companyEmitter,
      );
      invoice.iban = alreadyIban;
      if (!alreadyIban) {
        try {
          const res: IValidateIban = await this.ibansService.getApiValidateIban(
            iban,
          );
          res.iban = iban;
          invoice.iban = await this.ibansService.createIban(res, invoice, user);
        } catch (err) {
          throw new HttpException('api.error.iban.check', err.statusCode);
        }
      }
    } else {
      // delete iban if set to null
      invoice.iban = iban;
    }

    if (data.companyEmitter) {
      await this.partnersService.createPartner(user, data.companyEmitter);
    }

    invoice = await this.invoiceRepository.save(invoice);

    return invoice;
  }

  /**
   * Get invoices by company
   *
   * @param   {Company}        company  - Current company
   * @param   {any}            filters  - Filters the request (optional)
   * @param   {string}         orderBy  - Sort the request (optional)
   * @param   {number}         limit    - Number of returned invoices (optional)
   * @param   {number}         offset   - Start of pagination (optional)
   *
   * @return  {Promise<List>}           - Returns a list of invoices with the total number of invoices
   */
  public async findByCompany(
    company: Company,
    filters?: any,
    orderBy?: string,
    limit?: number,
    offset?: number,
  ): Promise<List> {
    // Refacto ?
    if (filters.status) {
      filters.status = In(filters.status);
    }

    const whereClause: any = Object.assign(
      { companyReceiver: company },
      filters,
    );
    const [invoices, total]: [
      Invoice[],
      number
    ] = await this.invoiceRepository.findAndCount({
      where: whereClause,
      order: {
        createdAt: 'DESC',
      },
      take: limit,
      skip: offset,
    });

    return {
      total,
      rows: invoices,
    };
  }

  /**
   * Get invoices by company
   *
   * @param   {Company}        company  - Emitter company
   * @param   {any}            filters  - Filters the request (optional)
   * @param   {string}         orderBy  - Sort the request (optional)
   * @param   {number}         limit    - Number of returned invoices (optional)
   * @param   {number}         offset   - Start of pagination (optional)
   *
   * @return  {Promise<List>}           - Returns a list of invoices with the total number of invoices
   */
  public async findByEmitterCompany(
    company: Company,
    filters?: any,
    orderBy?: string,
    limit?: number,
    offset?: number,
  ): Promise<List> {
    // Refacto ?
    if (filters.status) {
      filters.status = In(filters.status);
    }

    const whereClause: any = Object.assign(
      { companyEmitter: company, enabled: true },
      filters,
    );
    const [invoices, total]: [
      Invoice[],
      number
    ] = await this.invoiceRepository.findAndCount({
      where: whereClause,
      order: {
        createdAt: 'DESC',
      },
      take: limit,
      skip: offset,
    });

    return {
      total,
      rows: invoices,
    };
  }

  /**
   * Get a single invoice by ID and by currentCompany
   *
   * @param   {string}            id              - Invoice's ID
   * @param   {Company}           currentCompany  - Current company
   *
   * @return  {Promise<Invoice>}                  - Returns the found invoice
   */
  public async findOneByIdAndCurrentCompany(
    id: string,
    currentCompany: Company,
  ): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      id,
      companyReceiver: currentCompany,
    });

    if (!invoice) {
      throw new HttpException(
        'api.error.invoice.not_found',
        HttpStatus.NOT_FOUND,
      );
    }

    return invoice;
  }

  /**
   * Get a single invoice by ID and by currentCompany
   *
   * @param   {string}            id              - Invoice's ID
   * @param   {Company}           emitterCompany  - Emitter company
   *
   * @return  {Promise<>}                  - Returns the found invoice
   */
  public async findOneByIdAndEmitterCompany(
    id: string,
    currentCompany: Company,
  ): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      id,
      companyEmitter: currentCompany,
      enabled: true,
    });

    if (!invoice) {
      throw new HttpException(
        'api.error.invoice.not_found',
        HttpStatus.NOT_FOUND,
      );
    }

    return invoice;
  }

  /**
   * Get a single invoice by ID and by currentCompany
   *
   * @param   {string}            id              - Invoice's ID
   * @param   {Company}           currentCompany  - Current company
   *
   * @return  {Promise<Invoice>}                  - Returns the found invoice
   */
  public async findOneById(id: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      id,
    });

    if (!invoice) {
      throw new HttpException(
        'api.error.invoice.not_found',
        HttpStatus.NOT_FOUND,
      );
    }

    return invoice;
  }

  /**
   * Soft remove a single invoice
   *
   * @param   {User}              user  - Current user
   * @param   {string}            id    - Invoice's ID
   *
   * @return  {Promise<Invoice>}        - Returns the modified invoice
   */
  public async removeInvoice(user: User, id: string): Promise<Invoice> {
    const invoice: Invoice = await this.invoiceRepository.findOne({
      id,
      companyReceiver: user.currentCompany,
    });
    if (!invoice) {
      throw new HttpException(
        'api.error.invoice.not_found',
        HttpStatus.NOT_FOUND,
      );
    }

    invoice.enabled = false;
    await invoice.save();

    return invoice;
  }

  /**
   * Soft remove all invoices, useful when needing to remove all test invoices
   *
   * @return  {Promise<boolean>}        - Returns removed invoices
   */
  public async removeAll(): Promise<boolean> {
    const invoices: Invoice[] = await this.invoiceRepository.find({});
    invoices.forEach(invoice => {
      invoice.enabled = false;
    });
    await this.invoiceRepository.save(invoices);
    return true;
  }

  /**
   * Generate a payment code if the invoice is greater than 2000€
   *
   * @param   {User}              user       - Current user
   * @param   {string}            invoiceId  - Invoice's ID
   *
   * @return  {Promise<Invoice>}             - Returns the invoice with the generated code
   */
  public async generateCode(user: User, invoiceId: string): Promise<Invoice> {
    const invoice: Invoice = await this.findOneByIdAndCurrentCompany(
      invoiceId,
      user.currentCompany,
    );
    if (invoice.status !== InvoiceStatus.TO_PAY) {
      throw new HttpException(
        'api.error.invoice.invalid_status',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Generate code
    invoice.code = uuid
      .v4()
      .replace('-', '')
      .slice(0, 6);
    await invoice.save();

    const message: EmailMessage<ConfirmPaymentEmailPaylaod> = {
      To: [
        {
          Email: user.email,
          Name: user.fullName,
        },
      ],
      TemplateID: 705867,
      Subject: 'Validez votre paiement',
      Variables: {
        invoiceNumber: invoice.number || '',
        totalWithVat: invoice.total
          ? `${invoice.total} ${invoice.currency}`
          : `0 ${invoice.currency}`,
        paymentValidationCode: invoice.code,
      },
    };

    await this.emailService.send([message]);

    return invoice;
  }

  /**
   * Verify code of payment
   *
   * @param   {string}            invoiceId  - Invoice's ID
   * @param   {string}            code       - Code of payment
   *
   * @return  {Promise<Invoice>}             - Returns the invoice associated with the payment code
   */
  public async checkCode(invoiceId: string, code: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      id: invoiceId,
      code,
    });
    if (!invoice) {
      throw new HttpException(
        'api.error.invoice.invalid_code',
        HttpStatus.BAD_REQUEST,
      );
    }

    return invoice;
  }

  /**
   * Get total invoices sent
   *
   * @param   {Company}  myCompany      - The company of current user
   * @param   {Company}  targetCompany  - The target company
   *
   * @return  {Promise<number>}         - Return the total invoices sent
   */
  public async invoicesSent(
    myCompany: Company,
    targetCompany: Company,
  ): Promise<number> {
    const options: any = {
      companyEmitter: myCompany,
    };

    if (myCompany !== targetCompany) {
      options.companyReceiver = targetCompany;
    }

    return this.invoiceRepository.count(options);
  }

  /**
   * Get total invoices received
   *
   * @param   {Company}  myCompany      - The company of current user
   * @param   {Company}  targetCompany  - The target company
   *
   * @return  {Promise<number>}         - Return the total invoices received
   */
  public async invoicesReceived(
    myCompany: Company,
    targetCompany: Company,
  ): Promise<number> {
    const options: any = {
      companyReceiver: myCompany,
    };

    if (myCompany !== targetCompany) {
      options.companyEmitter = targetCompany;
    }

    return this.invoiceRepository.count(options);
  }

  /**
   * Find payment estimated balance for invoice
   *
   * @param   {Invoice}            invoice              - Invoice's ID
   *
   * @return  {Promise<number>}                           - Returns number amount
   */
  public async findEstimatedBalance(invoice: Invoice): Promise<number | null> {
    if (invoice.companyReceiver.provisionningStrategy === CompanyProvisionningStrategies.AUTOLOAD) {
      return null;
    }
    if (invoice.status !== InvoiceStatus.PLANNED) {
      return null;
    }

    const payments: Payment = await this.paymentsRepository.findOne({ where: { invoice, status: Not(PaymentStatus.CANCELLED) } });
    if (payments) {
      return payments.libeoEstimatedBalance;
    }

    return null;
  }

  /**
   * Find payment date for invoice
   *
   * @param   {Invoice}            invoice              - Invoice's ID
   *
   * @return  {Promise<Date>}                           - Returns the found invoice
   */
  public async findPaymentAt(invoice: Invoice): Promise<Date | null> {
    if (invoice.companyReceiver.provisionningStrategy === CompanyProvisionningStrategies.AUTOLOAD) {
      return null;
    }
    if (invoice.status !== InvoiceStatus.PLANNED) {
      return null;
    }

    const payments: Payment = await this.paymentsRepository.findOne({ where: { invoice, status: Not(PaymentStatus.CANCELLED) } });
    if (payments) {
      return payments.paymentAt;
    }

    return null;
  }
}
