import { TREEZOR_CONSTANTS } from '../../payment/treezor.constants';
import { Payment, PaymentStatus } from '../entities/payment.entity';
import { PaymentRepository } from '../repositories/payment.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from '../entities/company.entity';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Invoice, InvoiceStatus } from '../entities/invoice.entity';
import { ZendeskService } from '../../notification/zendesk.service';
import { ZendeskTicketType, ZendesTicketPriority } from '../../notification/interface/zendesk-ticket.interface';
import { IPayout } from '../../payment/interfaces/treezor/payout.interface';
import { Logger } from '@nestjs/common';

export class TreezorPayoutWorkflow {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    private readonly paymentRepository: PaymentRepository,
    private readonly zendeskService: ZendeskService,
    private readonly logger: Logger,
  ) {}

  public handlePayout = async (payout: IPayout) => {
    if (![TREEZOR_CONSTANTS.PAYOUT_STATUS_VALIDATED, TREEZOR_CONSTANTS.PAYOUT_STATUS_CANCELED].includes(payout.payoutStatus)) {
      this.logger.warn(`Payout webhook with ID ${payout.payoutId} was received from Treezor but was not handled since the status was not VALIDATED or CANCELLED`);
      return;
    }

    const payment: Payment = await this.paymentRepository.findOne({ where: { treezorPayoutId: payout.payoutId }, relations: ['invoice'] });

    if (!payout || !payment) {
      throw new Error(`The payout with payoutId:${payout.payoutId} cannot be found`);
    }

    if (payout.payoutStatus === TREEZOR_CONSTANTS.PAYOUT_STATUS_VALIDATED) {
      if (payment.invoice.status === InvoiceStatus.PAID) throw new Error(`The payment ${payment.id} with payoutId:${payout.payoutId} was already paid`);
      payment.treezorValidationAt = new Date();
      payment.status = PaymentStatus.TREEZOR_WH_VALIDATED;
      const invoice: Invoice = payment.invoice;
      invoice.status = InvoiceStatus.PAID;
      await Promise.all([payment.save(), invoice.save()]);
    }

    if (payout.payoutStatus === TREEZOR_CONSTANTS.PAYOUT_STATUS_CANCELED && payment.status !== PaymentStatus.CANCELLED) {
      const companyReceiver: Company = await this.companyRepository.findOne({ where: { id: payment.invoice.companyReceiver.id }, relations: ['claimer'] });
      const claimer: User = companyReceiver.claimer;

      await this.zendeskService.createTicket({
        type: ZendeskTicketType.INCIDENT,
        priority: ZendesTicketPriority.URGENT,
        requester: { name: claimer.fullName || null, email: claimer.email || null },
        subject: 'Paiement en erreur',
        comment: { body: `Le payout ${payout.payoutId} a été envoyé sans solde à treezor et n'a pas pu être accepté.\nLe paiement sera retenté automatiquement.` },
      });
    }
  }
}
