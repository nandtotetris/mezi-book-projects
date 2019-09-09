import { Payment, PaymentStatus } from '../entities/payment.entity';
import { PaymentsWorkflow } from './payments.workflow';
import { Repository } from 'typeorm';
import { Company, CompanyProvisionningStrategies } from '../entities/company.entity';
import { Logger } from '@nestjs/common';
import { BalancesService } from '../services/balances.service';
import { CompaniesService } from '../services/companies.service';
import { TreezorService } from '../../payment/treezor.service';
import { PayinsService } from '../services/payins.service';
import { Payin } from '../entities/payin.entity';

describe('PaymentsServiceprocessPayment', () => {
  let paymentsWorkflow: PaymentsWorkflow;

  beforeEach(() => {
    const logger: Logger = {
      error(msg) {},
      log(msg) {},
      verbose(msg) {}
    } as Logger;
    // @ts-ignore
    const treezorService: TreezorService = {
      createPayout(payload) {
        if (payload.payoutTag === 'error') {
          return Promise.reject('Error');
        }

        return Promise.resolve({ payoutId: 101010 });
      },
      createPayin() {
        return Promise.resolve({
          walletId: 101010,
          payinId: 1,
          informationStatus: ''
        });
      }
    } as TreezorService;
    const balancesService: BalancesService = {
      async updateLibeoBalance(company, payment) {}
    } as BalancesService;
    const companyRepository: Repository<Company> = {
      async findOne(conditions?, options?) {
        const company = new Company();
        // @ts-ignore
        company.claimer = { fullName: 'John Doe', email: 'john.doe@another.com' };
        return Promise.resolve(company);
      }
    } as Repository<Company>;
    // @ts-ignore
    const payinsService = {
      createPayin(obj) { return Promise.resolve(new Payin()); },
      hydratePayinWithTreezor(payin, treezorPayin) { return Promise.resolve(); }
    } as PayinsService;
    // @ts-ignore
    const companiesService = {
      getSignedMandate(company) {
        return Promise.resolve({ treezorMandateId: 101010 });
      }
    } as CompaniesService;

    paymentsWorkflow = new PaymentsWorkflow(companyRepository, companiesService, balancesService, payinsService, treezorService, null, logger);
  });

  it('Should update the payment with errors', async () => {
    const payment = new Payment();
    payment.id = 'error';
    // @ts-ignore
    payment.invoice = { companyReceiver: { treezorWalletId: 909090 } };

    jest.spyOn(payment, 'save').mockImplementation(() => Promise.resolve(payment));
    await paymentsWorkflow.processPayment(payment);
    expect(payment.save).toHaveBeenCalledTimes(2);
    expect(payment.status).toBe(PaymentStatus.TREEZOR_SYNC_KO_MISC);
  });

  it('Should update the payment pending', async () => {
    const payment = new Payment();
    // @ts-ignore
    payment.invoice = { companyReceiver: { treezorWalletId: 909090 } };

    jest.spyOn(payment, 'save').mockImplementation(() => Promise.resolve(payment));
    await paymentsWorkflow.processPayment(payment);
    expect(payment.save).toHaveBeenCalledTimes(2);
    expect(payment.status).toBe(PaymentStatus.TREEZOR_PENDING);
  });

  it('handlePaymentWithTopUp', async () => {
    const payment = new Payment();
    // @ts-ignore
    payment.invoice = { companyReceiver: { treezorWalletId: 909090 } };
    payment.invoice.companyReceiver.provisionningStrategy = CompanyProvisionningStrategies.TOPUP;

    jest.spyOn(payment, 'save').mockImplementation(() => Promise.resolve(payment));
    jest.spyOn(paymentsWorkflow, 'handlePaymentWithTopUp');

    await paymentsWorkflow.processPayment(payment);

    expect(payment.save).toHaveBeenCalledTimes(2);
    expect(paymentsWorkflow.handlePaymentWithTopUp).toHaveBeenCalledTimes(1);
    expect(payment.status).toBe(PaymentStatus.TREEZOR_PENDING);
  });

  it('handlePaymentWithAutoload', async () => {
    const payment = new Payment();
    // @ts-ignore
    payment.invoice = { companyReceiver: { treezorWalletId: 909090 } };
    payment.invoice.companyReceiver.provisionningStrategy = CompanyProvisionningStrategies.AUTOLOAD;

    jest.spyOn(payment, 'save').mockImplementation(() => Promise.resolve(payment));
    jest.spyOn(paymentsWorkflow, 'handlePaymentWithAutoload');

    await paymentsWorkflow.processPayment(payment);

    expect(payment.save).toHaveBeenCalledTimes(2);
    expect(paymentsWorkflow.handlePaymentWithAutoload).toHaveBeenCalledTimes(1);
    expect(payment.status).toBe(PaymentStatus.BEING_PROCESSED);
  });
});
