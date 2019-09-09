import * as moment from 'moment-business-days';
import { TreezorService } from '../../payment/treezor.service';
import { Logger, Injectable } from '@nestjs/common';
import { IPayout } from '../../payment/interfaces/treezor/payout.interface';
import { PaymentStatus, Payment } from '../entities/payment.entity';
import { User } from '../entities/user.entity';
import { Company, CompanyProvisionningStrategies } from '../entities/company.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BalancesService } from '../services/balances.service';
import { CompaniesService } from '../services/companies.service';
import { Invoice } from '../entities/invoice.entity';
import { ICreatePayinParams, ITreezorPayin } from '../../payment/interfaces/treezor/payin.interface';
import { Mandate } from '../entities/mandate.entity';
import { PayinsService } from '../services/payins.service';
import { Payin, PayinStatus } from '../entities/payin.entity';
import { ZendeskService } from '../../notification/zendesk.service';
import { ZendeskTicketType, ZendesTicketPriority } from '../../notification/interface/zendesk-ticket.interface';

const ERROR_CODE_TREEZOR_NOT_ENOUGH_BALANCE = 16018;

@Injectable()
export class PaymentsWorkflow {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    private readonly companiesService: CompaniesService,
    private readonly balancesService: BalancesService,
    private readonly payinsService: PayinsService,
    private readonly treezorService: TreezorService,
    private readonly zendeskService: ZendeskService,
    private readonly logger: Logger,
  ) {}

  /**
   * Create a ticket at Zendesk
   *
   * @param   {Payment}        payment  - Current payment
   * @param   {string}         subject  - Subject of ticket
   * @param   {string}         message  - Message of ticket
   *
   * @return  {Promise<void>}
   */
  private async sendToZendesk(payment: Payment, subject: string, message: string): Promise<void> {
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    const companyReceiver: Company = await this.companyRepository.findOne({ where: { id: payment.invoice.companyReceiver.id }, relations: ['claimer'] });
    const claimer: User = companyReceiver.claimer;

    await this.zendeskService.createTicket({
      type: ZendeskTicketType.INCIDENT,
      priority: ZendesTicketPriority.URGENT,
      requester: { name: claimer.fullName || null, email: claimer.email || null },
      subject,
      comment: { body: message },
    });
  }

  public processPayment = async (payment: Payment) => {
    try {
      this.logger.verbose(`Payment ${payment.id} - Start workflow`);
      this.logger.verbose(`Payment ${payment.id} - Mode ${payment.invoice.companyReceiver.provisionningStrategy}`);
      payment.status = PaymentStatus.BEING_PROCESSED;
      await payment.save();
      this.logger.verbose(`Payment ${payment.id} - Status Being processed saved`);
      if (payment.invoice.companyReceiver.provisionningStrategy === CompanyProvisionningStrategies.AUTOLOAD) {
        await this.handlePaymentWithAutoload(payment);
      } else {
        await this.handlePaymentWithTopUp(payment);
      }
      this.logger.log(`Payment ${payment.id} passed`);
    }
    catch (err) {
      this.logger.error(`Payment ${payment.id} - Error message: ${err.message}`);
      if (payment.status === PaymentStatus.BEING_PROCESSED) {
        payment.status = PaymentStatus.TREEZOR_SYNC_KO_MISC;
      }

      payment.treezorRequestAt = new Date();
      await payment.save();
    }
  }

  public handlePaymentWithTopUp = async (payment: Payment) => {
    this.logger.log(`Payment ${payment.id} - Generate a payout`);
    try {
      this.logger.verbose(`Payment ${payment.id} - Generate Payout`);
      const payout: IPayout = await this.treezorService.createPayout({
        beneficiaryId: payment.treezorBeneficiaryId,
        amount: payment.invoice.total,
        currency: payment.invoice.currency,
        walletId: payment.invoice.companyReceiver.treezorWalletId,
        payoutTag: payment.id,
        label: payment.invoice.companyReceiver.name || payment.invoice.companyReceiver.brandName || '',
        supportingFileLink: (payment.amount > 2000) ? payment.invoice.filepath : '',
      });
      // Update payment
      payment.treezorPayoutId = payout.payoutId;
      payment.treezorRequestAt = new Date();
      payment.status = PaymentStatus.TREEZOR_PENDING;
      this.logger.verbose(`Payment ${payment.id} - Payout Generated ${payout.payoutId}`);
      await payment.save();
      this.logger.verbose(`Payment ${payment.id} - Payout saved`);
      return payment;
    } catch (err) {
      if (err.code === ERROR_CODE_TREEZOR_NOT_ENOUGH_BALANCE) {
        payment.status = PaymentStatus.TREEZOR_SYNC_KO_NOT_ENOUGH_BALANCE;
      }

      await this.balancesService.updateLibeoBalance(payment.invoice.companyReceiver, payment);
      this.sendToZendesk(payment, 'Paiement en erreur', `Le paiement ${payment.id} est retourné en erreur par treezor et demande une investiguation.\nLe paiement sera retenté automatiquement.\nMessage d'erreur : ${err.message}`);

      throw new Error(err);
    }
  }

  public handlePaymentWithAutoload = async (payment: Payment) => {
    if (payment.payin) {
      this.logger.log(`Payment ${payment.id} - Payin already generated in status ${payment.payin.status}`);
      if (payment.payin.status === PayinStatus.VALIDATED) {
        await this.handlePaymentWithTopUp(payment);
      }

      return;
    }

    this.logger.log(`Payment ${payment.id} - Generate a payin`);

    const invoice: Invoice = payment.invoice;
    const company: Company = invoice.companyReceiver;
    if (company.sddeRefusedCount > 2) {
      return;
    }

    const amount: number = invoice.total;
    const mandate: Mandate = await this.companiesService.getSignedMandate(company);
    const payinDate: string =  moment(payment.paymentAt).format('YYYY-MM-DD');
    const messageToUser: string = `Libeo - ${invoice.number || ''} ${company.name || company.brandName || ''}`;
    const currency: string = 'EUR';
    moment.updateLocale('fr', {
      holidays: [
        '01/01',
        '19/04',
        '22/04',
        '01/05',
        '25/12',
        '26/12',
      ],
      holidayFormat: 'DD/MM',
      // Defines days from 1 (Monday) to 5 (Friday) as business days. Note that Sunday is day 0.
      workingWeekdays: [1, 2, 3, 4, 5]
    });
    const nextBusinessDay: string = moment(payinDate).add('1', 'days').nextBusinessDay().format('YYYY-MM-DD');

    // TODO: Fake data
    const body: ICreatePayinParams = {
      amount,
      currency,
      paymentMethodId: 21,
      walletId: 194026, // company.treezorWalletId,
      mandateId: mandate.treezorMandateId,
      payinDate: nextBusinessDay,
      messageToUser,
    };

    // Create payin
    const payin: Payin = await this.payinsService.createPayin({
      amount,
      currency,
      company: payment.invoice.companyReceiver,
      payinAt: payment.paymentAt,
    });

    // Attach a payin on a payment
    payment.payin = payin;
    await payment.save();

    try {
      const treezorPayin: ITreezorPayin = await this.treezorService.createPayin(body);
      await this.payinsService.hydratePayinWithTreezor(payin, treezorPayin);
    } catch (err) {
      this.logger.error(err);
      throw new Error(err);
    }

    return;
  }
}
