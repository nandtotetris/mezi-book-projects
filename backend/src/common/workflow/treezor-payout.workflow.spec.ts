import { Payment, PaymentStatus } from '../entities/payment.entity';
import { Repository } from 'typeorm';
import { Company } from '../entities/company.entity';
import { Logger } from '@nestjs/common';
import { TreezorPayoutWorkflow } from './treezor-payout.workflow';
import { PaymentRepository } from '../repositories/payment.repository';
import { ZendeskService } from '../../notification/zendesk.service';
import { IPayout } from '../../payment/interfaces/treezor/payout.interface';
import { Invoice, InvoiceStatus } from '../entities/invoice.entity';

describe('PaymentsServiceprocessPayment', () => {
  let treezorPayoutWorkflow: TreezorPayoutWorkflow;

  const logger: Logger = {
    error(msg) {},
    log(msg) {},
    verbose(msg) {},
    warn(msg) {},
  } as Logger;

  const companyRepository: Repository<Company> = {
    async findOne(conditions?, options?) {
      const company = new Company();
      // @ts-ignore
      company.claimer = { fullName: 'John Doe', email: 'john.doe@another.com' };
      return Promise.resolve(company);
    }
  } as Repository<Company>;

  const invoice = {save: jest.fn} as unknown as Invoice;
  const payment = {save: jest.fn} as unknown as Payment;

  // @ts-ignore
  const paymentRepository: PaymentRepository = {
    async findOne(conditions?, options?) {
      if (conditions.where.treezorPayoutId !== 'isInDB') return undefined;
      // @ts-ignore
      payment.invoice = invoice;
      return Promise.resolve(payment);
    }
  } as Repository<Company>;

  const zendeskService: ZendeskService = null;

  beforeEach(() => {
    treezorPayoutWorkflow = new TreezorPayoutWorkflow(companyRepository, paymentRepository, zendeskService, logger);
  });

  it('Should warn if status is not VALIDATED or CANCELED and not search for payment', async () => {
    // @ts-ignore
    const payout: IPayout = {payoutStatus: 'croute'};
    jest.spyOn(logger, 'warn');
    jest.spyOn(paymentRepository, 'findOne');
    await treezorPayoutWorkflow.handlePayout(payout);
    expect(logger.warn).toHaveBeenCalled();
    expect(paymentRepository.findOne).not.toHaveBeenCalled();
  });

  it('Should throw an error payout is not related to a payment', async () => {
    // @ts-ignore
    const payout: IPayout = {payoutStatus: 'VALIDATED', payoutId: 'IDontExist'};
    jest.spyOn(payment, 'save');
    jest.spyOn(invoice, 'save');
    try{
      await treezorPayoutWorkflow.handlePayout(payout);
    } catch (e) {
      expect(e.message).toBeDefined();
      expect(payment.save).not.toHaveBeenCalled();
      expect(invoice.save).not.toHaveBeenCalled();
    }
  });

  it('Should update the payment and the invoice', async () => {
    // @ts-ignore
    const payout: IPayout = {payoutStatus: 'VALIDATED', payoutId: 'isInDB'};
    jest.spyOn(payment, 'save');
    jest.spyOn(invoice, 'save');
    await treezorPayoutWorkflow.handlePayout(payout);
    expect(payment.status).toBe(PaymentStatus.TREEZOR_WH_VALIDATED);
    expect(invoice.status).toBe(InvoiceStatus.PAID);
    expect(payment.save).toHaveBeenCalled();
    expect(invoice.save).toHaveBeenCalled();
  });

  it('Should throw an error if the payment was already paid', async () => {
    // @ts-ignore
    const payout: IPayout = {payoutStatus: 'VALIDATED', payoutId: 'isInDB'};
    invoice.status = InvoiceStatus.PAID;
    jest.spyOn(payment, 'save').mockClear();
    jest.spyOn(invoice, 'save').mockClear();
    try {
      await treezorPayoutWorkflow.handlePayout(payout);
    } catch (e) {
      expect(e).toBeDefined();
      expect(payment.save).not.toHaveBeenCalled();
      expect(invoice.save).not.toHaveBeenCalled();
    }
  });
});
