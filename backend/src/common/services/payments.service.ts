import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment, PaymentStatus } from '../entities/payment.entity';
import { InvoicesService } from './invoices.service';
import { Company, CompanyKycStatus } from '../entities/company.entity';
import { Invoice, InvoiceStatus } from '../entities/invoice.entity';
import { User } from '../entities/user.entity';
import { BalancesService } from './balances.service';
import { TreezorService } from '../../payment/treezor.service';
import { Iban } from '../entities/iban.entity';
import { IBeneficiary } from '../../payment/interfaces/treezor/beneficiary.interface';
import { Cron, NestSchedule } from 'nest-schedule';
import { PaymentRepository } from '../repositories/payment.repository';
import { Repository, In } from 'typeorm';
import { IBalance } from '../../payment/interfaces/treezor/balance.interface';
import { ContactsService } from './contacts.service';
import { Contact } from '../entities/contact.entity';
import { PaymentNotification } from '../entities/payment-notification.entity';
import { PaymentsWorkflow } from '../workflow/payments.workflow';
import { ZendeskService } from '../../notification/zendesk.service';
import { ZendeskTicketType, ZendesTicketPriority } from '../../notification/interface/zendesk-ticket.interface';
import { Payin, PayinStatus } from '../entities/payin.entity';
import { List } from '../interfaces/common.interface';

@Injectable()
export class PaymentsService extends NestSchedule {
  constructor(
    @InjectRepository(PaymentRepository)
    private readonly paymentRepository: PaymentRepository,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(PaymentNotification)
    private readonly paymentNotificationRepository: Repository<PaymentNotification>,
    private readonly invoicesService: InvoicesService,
    private readonly balancesService: BalancesService,
    private readonly contactsService: ContactsService,
    private readonly treezorService: TreezorService,
    private readonly paymentsWorkflow: PaymentsWorkflow,
    private readonly zendeskService: ZendeskService,
  ) {
    super();
  }

  /**
   * Send an email to the selected contacts
   *
   * @param   {Company}           currentCompany  - Current company
   * @param   {[type]}            invoiceId       - Invoice's id
   * @param   {string[]}          contactIds      - Contact's ids
   *
   * @return  {Promise<boolean>}
   */
  public async payoutContacts(user: User, invoiceId: string, contactIds: string[]): Promise<boolean> {
    const invoice: Invoice = await this.invoicesService.findOneByIdAndCurrentCompany(invoiceId, user.currentCompany);
    if (!invoice) {
      throw new HttpException('api.error.invoice.not_found', HttpStatus.NOT_FOUND);
    }

    const contacts: Contact[] = await this.contactsService.findByCompanyAndIds(invoice.companyEmitter, contactIds, user.currentCompany);

    if (contacts.length === 0) {
      return false;
    }

    await Promise.all(contacts.map(async contact => {
      const paymentNotification: PaymentNotification = this.paymentNotificationRepository.create({
        contact,
        invoice,
        createdBy: user,
      });

      await paymentNotification.save();
    }));

    return true;
  }

  /**
   * Create a new payment
   *
   * @param   {User}              user       - Current user
   * @param   {string}            invoiceId  - Invoice's ID
   * @param   {Date}              date       - Payment planning date (optional)
   * @param   {string}            code       - Validation code to pay the invoice (optional)
   *
   * @return  {Promise<Invoice>}             - Returns the paid invoice
   */
  public async payout(user: User, invoiceId: string, date?: Date, code?: string): Promise<Invoice[]> {
    // Check invoice status
    const invoice: Invoice = await this.invoicesService.findOneByIdAndCurrentCompany(invoiceId, user.currentCompany);
    if (invoice.status !== InvoiceStatus.TO_PAY) {
      throw new HttpException('api.error.invoice.invalid_status', HttpStatus.BAD_REQUEST);
    }

    // Check security code
    if ((invoice.code && !invoice.codeValidatedBy) || code) {
      await this.invoicesService.checkCode(invoiceId, code);
    }

    // Check KYC
    // if (!await this.checkKyc(invoice.companyReceiver)) {
    //   throw new HttpException('api.error.payment.kyc', HttpStatus.BAD_REQUEST);
    // }

    // TODO: Check contact

    // Create object payment
    const payment: Payment = this.paymentRepository.create({
      treezorPayerWalletId: invoice.companyReceiver.treezorWalletId,
      status: PaymentStatus.REQUESTED,
      amount: invoice.total,
      currency: invoice.currency,
      invoice,
      paymentAt: (date) ? new Date(date) : new Date(),
      paymentRequestUser: user,
      libeoEstimatedBalance: 0,
    });

    // Synchronization of the invoice status
    invoice.status = InvoiceStatus.PLANNED;

    if (invoice.iban && invoice.iban.treezorBeneficiaryId) {
      payment.treezorBeneficiaryId = invoice.iban.treezorBeneficiaryId;
    }

    // Save payment and invoice
    await Promise.all([
      payment.save(),
      invoice.save(),
    ]);

    // Update balance
    await this.updateLibeoBalance(invoice.companyReceiver, payment);

    // Create a new benefeciary bank account in Treezor
    if (invoice.iban && !invoice.iban.treezorBeneficiaryId) {
      await this.createBeneficiary(user, invoice, payment);
    }

    const invoices: Invoice[] = await this.invoiceRepository
      .find({
        where: {
          companyReceiver: user.currentCompany,
          status: In([InvoiceStatus.TO_PAY, InvoiceStatus.PLANNED])
        }
      });

    return invoices;
  }

  /**
   * Create a new beneficiary bank account at Treezor
   *
   * @param   {User}                   user     - Current user
   * @param   {Invoice}                invoice  - Invoice with data
   * @param   {Payment}                payment  - Current payment (optional)
   *
   * @return  {Promise<IBeneficiary>}           - Returns the bank account of the created beneficiary
   */
  public async createBeneficiary(user: User, invoice: Invoice, payment?: Payment): Promise<IBeneficiary> {
    try {
      const beneficiary: IBeneficiary = await this.treezorService.createBeneficiary({
        body: {
          tag: invoice.iban.id,
          userId: invoice.companyReceiver.treezorUserId,
          nickName: invoice.companyReceiver.name + ' -> ' + invoice.companyEmitter.name,
          name: invoice.companyEmitter.name,
          iban: invoice.iban.iban,
          bic: invoice.iban.bic,
          usableForSct: true,
        },
      });

      const iban: Iban = invoice.iban;
      iban.treezorBeneficiaryId = beneficiary.id;
      await iban.save();

      if (payment) {
        payment.treezorBeneficiaryId = beneficiary.id;
        await payment.save();
      }

      return beneficiary;
    } catch (err) {
      if (err.code === 75001) {
        invoice.status = InvoiceStatus.TO_PAY;
        payment.status = PaymentStatus.CANCELLED;
        payment.cancellationRequestAt = new Date();
        payment.cancellationRequestUser = null;

        try {
          await Promise.all([invoice.save(), payment.save()]);
          await this.zendeskService.createTicket({
            type: ZendeskTicketType.PROBLEM,
            priority: ZendesTicketPriority.HIGH,
            requester: { name: user.fullName || null, email: user.email || null },
            subject: 'IBAN non valide',
            comment: { body: `L'IBAN renseigné par l'entreprise ${invoice.companyReceiver.name || invoice.companyReceiver.brandName || ''} est invalide. Le bénéficiaire n'a pas pu être créé chez Treezor, la facture et le paiement associé sont donc annulés : \n* Iban ID : ${invoice.iban.id}\n* Payement ID : ${payment.id}\n* Invoice ID ${invoice.id}` },
          });

          throw new HttpException('api.error.invoice.iban', HttpStatus.BAD_REQUEST);
        } catch (err) {
          throw new HttpException(err.message, err.statusCode);
        }
      } else {
        throw new HttpException(err.message, err.statusCode);
      }
    }
  }

  /**
   * Check the company's KYCs (moral user at Treezor)
   *
   * @param   {Company}           company  - The company to be controlled
   *
   * @return  {Promise<boolean>}           - Returns false if the KYCs were not submitted to Treezor, otherwise true
   */
  public async checkKyc(company: Company): Promise<boolean> {
    const treezorStatuses: CompanyKycStatus[] = [CompanyKycStatus.PENDING, CompanyKycStatus.REFUSED, CompanyKycStatus.VALIDATED];
    if (treezorStatuses.indexOf(company.kycStatus) === -1) {
      return false;
    }

    return true;
  }

  /**
   * Get a single payment by invoice
   *
   * @param   {Invoice}           invoice  - Invoice attached to the payment
   *
   * @return  {Promise<Payment>}           - Returns the payment of the invoice
   */
  public async findOneByInvoice(invoice: Invoice): Promise<Payment> {
    const payment: Payment = await this.paymentRepository.findOne({ invoice });
    if (!payment) {
      throw new HttpException('api.error.payment.not_found', HttpStatus.NOT_FOUND);
    }

    return payment;
  }

  /**
   * Update the field libeoEstimatedBalance of a payment
   *
   * @param   {Company}          company         - Target company
   * @param   {Payment}          currentPayment  - Current payment (optional)
   *
   * @return  {Promise<void>}
   */
  public async updateLibeoBalance(company: Company, currentPayment?: Payment): Promise<void> {
    const [ balance, payments ]: [IBalance, Payment[]] = await Promise.all([
      this.balancesService.getBalance(company),
      this.paymentRepository.getPlannedPayments(company, (currentPayment) ? currentPayment.paymentAt : null),
    ]);

    if (!balance) {
      return;
    }

    let calculationLibeoBalance: number = Number(balance.authorizedBalance);

    if (currentPayment) {
      calculationLibeoBalance = await this.balancesService.calculationLibeoBalance(balance, currentPayment.paymentAt, company);
      currentPayment.libeoEstimatedBalance = calculationLibeoBalance;
      await currentPayment.save();

      if (calculationLibeoBalance < 0) {
        return;
      }
    }

    try {
      await Promise.all(payments.map((payment: Payment) => {
        payment.libeoEstimatedBalance = calculationLibeoBalance - payment.amount;

        if (payment.libeoEstimatedBalance > 0) {
          calculationLibeoBalance = payment.libeoEstimatedBalance;
        }

        return payment.save();
      }));
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Check if the beneficiary bank account has been created at Treezor
   *
   * @param   {number}            beneficiaryId  - Beneficiary's ID Treezor
   *
   * @return  {Promise<boolean>}                 - Returns true if the beneficiary bank account has been found, otherwise false
   */
  public async checkBeneficiary(beneficiaryId: number): Promise<boolean> {
    try {
      const beneficiary: any = await this.treezorService.getBeneficiary(beneficiaryId);
      if (beneficiary) {
        return true;
      }
    } catch (err) {
      throw new HttpException(err.message, err.statusCode);
    }

    return false;
  }

  /**
   * Deferred payments sent at 5am and 8:30am
   *
   * @return {Promise<void>}
   */
  // @Cron('0 5 * * *')
  // @Cron('30 8 * * *')
  @Cron('* * * * *')
  public async deferredPayments(): Promise<void> {
    const logger = new Logger();
    const payments: Payment[] = await this.paymentRepository.getDeferredPayments();

    if (payments.length === 0) {
      return;
    } else {
      logger.log(`${payments.length} deferred payments`);
    }

    await Promise.all(payments.map(this.paymentsWorkflow.processPayment));
  }

  /**
   * Update invoice status
   *
   * @param   {string}            id      - Invoice's ID
   * @param   {InvoiceStatus}     status  - Current status of the invoice
   * @param   {User}              user    - Current user
   *
   * @return  {Promise<Invoice>}          - Returns the updated invoice
   */
  public async updateInvoiceStatus(id: string, status: InvoiceStatus, user: User): Promise<Invoice[]> {
    const invoice: Invoice = await this.invoiceRepository.findOne({ id });
    if (!invoice) {
      throw new HttpException('api.error.invoice.not_found', HttpStatus.NOT_FOUND);
    }

    if (invoice.status === InvoiceStatus.PAID) {
      throw new HttpException('api.error.invoice.already_paid', HttpStatus.BAD_REQUEST);
    }

    // TODO: Remove if DI on Subscriber
    // Cancellation of the invoice
    if (status === InvoiceStatus.TO_PAY && invoice.status === InvoiceStatus.PLANNED) {
      const payments: Payment[] = await this.paymentRepository.find({
        where: {
          invoice,
          status: In([
            PaymentStatus.REQUESTED,
            PaymentStatus.BEING_PROCESSED,
            PaymentStatus.TREEZOR_PENDING,
            PaymentStatus.TREEZOR_SYNC_KO_NOT_ENOUGH_BALANCE,
            PaymentStatus.TREEZOR_SYNC_KO_MISC,
            PaymentStatus.TREEZOR_WH_KO_MISC,
            PaymentStatus.TREEZOR_WH_KO_NOT_ENOUGH_BALANCE,
          ]),
        },
        relations: ['payin'],
      });

      const promises: any = payments.map(async (payment: Payment) => {
        payment.status = PaymentStatus.CANCELLED;
        payment.cancellationRequestAt = new Date();
        payment.cancellationRequestUser = user;
        await payment.save();

        if (payment.payin) {
          const payin: Payin = payment.payin;
          payin.status = PayinStatus.CANCELLED;
          await payin.save();

          if (payin.treezorPayinId) {
            try {
              await this.treezorService.deletePayin(payin.treezorPayinId);
            } catch (err) {
              throw new HttpException(err.message, err.statusCode);
            }
          }
        }

        if (payment.treezorPayoutId) {
          try {
            await this.treezorService.deletePayout(payment.treezorPayoutId);
          } catch (err) {
            throw new HttpException(err.message, err.statusCode);
          }
        }
      });

      await Promise.all(promises);

      // Update Libeo balance
      await this.updateLibeoBalance(invoice.companyReceiver);
    }

    if (status === InvoiceStatus.SCANNED && invoice.status === InvoiceStatus.TO_PAY) {
      invoice.code = null;
      invoice.codeValidatedAt = null;
      invoice.codeValidatedBy = null;
    }

    invoice.status = status;
    await invoice.save();

    // return all the invoice planned or to pay to update web app apollo cache (estimatedBalance)
    if (status === InvoiceStatus.TO_PAY) {
      const invoices: Invoice[] = await this.invoiceRepository
        .find({
          where: {
            companyReceiver: user.currentCompany,
            status: In([InvoiceStatus.PLANNED])
          }
        });
      return invoices.concat(invoice);
    }

    return [invoice];
  }
}
