import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { TreezorService } from '../../payment/treezor.service';
import { Company } from '../entities/company.entity';
import { InvoiceStatus } from '../entities/invoice.entity';
import { InvoicesService } from './invoices.service';
import { PaymentRepository } from '../repositories/payment.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { getStatusLibeoBalance, Payment } from '../entities/payment.entity';
import { IBalance } from '../../payment/interfaces/treezor/balance.interface';

@Injectable()
export class BalancesService {
  constructor(
    private readonly invoicesService: InvoicesService,
    @InjectRepository(PaymentRepository)
    private readonly paymentRepository: PaymentRepository,
    private readonly treezorService: TreezorService
  ) {}

  /**
   * Get the balance of Treezor
   *
   * @param   {Company}            company  - Current company object
   *
   * @return  {Promise<IBalance>}
   */
  public async getBalance(company: Company): Promise<IBalance> {
    if (!company || !company.treezorWalletId) {
      return null;
    }

    try {
      const { balances } = await this.treezorService.getBalances({ walletId: company.treezorWalletId });
      const [ balance ] = balances;

      return balance;
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.BAD_GATEWAY);
    }
  }

  /**
   * Calculate an estimate of the balance based on future invoices
   *
   * @param   {IBalance}         balance    - Balance object of Treezor
   * @param   {Date}             paymentAt  - Due date of invoice
   * @param   {Company}          company    - Company receiver
   *
   * @return  {Promise<number>}
   */
  public async calculationLibeoBalance(balance: IBalance, paymentAt: Date, company: Company): Promise<number> {
    const sumInvoices: number = await this.paymentRepository.sumInvoicesByStatusAndDueAt(getStatusLibeoBalance, paymentAt, company);

    return balance.authorizedBalance - sumInvoices;
  }

  /**
   * Check if the balance is sufficient
   *
   * @param   {IBalance}          balance    - Balance object of Treezor
   * @param   {Company}           company    - Current company object
   * @param   {string}            invoiceId  - Invoice's ID
   *
   * @return  {Promise<boolean>}
   */
  public async checkBalance(balance: IBalance, company: Company, invoiceId: string, paymentAt?: Date): Promise<boolean> {
    const invoice = await this.invoicesService.findOneByIdAndCurrentCompany(invoiceId, company);
    if (invoice.status !== InvoiceStatus.TO_PAY) {
      throw new HttpException('api.error.invoice.invalid_status', HttpStatus.BAD_REQUEST);
    }

    if (invoice.total < await this.calculationLibeoBalance(balance, paymentAt, company)) {
      return true;
    }

    return false;
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
      this.getBalance(company),
      this.paymentRepository.getPlannedPayments(company, (currentPayment) ? currentPayment.paymentAt : null),
    ]);

    let calculationLibeoBalance: number = Number(balance.authorizedBalance);

    if (currentPayment) {
      calculationLibeoBalance = await this.calculationLibeoBalance(balance, currentPayment.paymentAt, company);
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
}
