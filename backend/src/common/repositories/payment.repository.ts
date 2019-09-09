import { EntityRepository, Repository } from 'typeorm';
import { Payment, PaymentStatus, getStatusLibeoBalance } from '../entities/payment.entity';
import { Company, CompanyKycStatus } from '../entities/company.entity';

@EntityRepository(Payment)
export class PaymentRepository extends Repository<Payment> {
  /**
   * Get sum invoices
   *
   * @param   {Array<PaymentStatus>}  status     - Array of status payment
   * @param   {Date}                  paymentAt  - Due date of invoice
   *
   * @return  {Promise<number>}                  - Return sum of invoices
   */
  public async sumInvoicesByStatusAndDueAt(status: PaymentStatus[], paymentAt: Date, company: Company): Promise<number> {
    const res = await this.createQueryBuilder('p')
      .select('SUM(i.total)', 'sum')
      .leftJoin('p.invoice', 'i')
      .leftJoin('i.companyReceiver', 'c')
      .where('p.paymentAt <= :paymentAt', { paymentAt })
      .andWhere('p.status IN(:...status)', { status })
      .andWhere('p.libeoEstimatedBalance >= 0')
      .andWhere('c.id = :companyReceiverId', { companyReceiverId: company.id })
      .getRawOne();
    // Warning: Insertion à la même date quand on aura l'heure à minuit
    // where (invoice.dueDate < :dueAt or (invoice.dueDate = :dueAt and invoice.createdAt < createdAt)) and ...

    return (res && res.sum) ? res.sum : 0;
  }

  /**
   * Get the deferred payments
   *
   * @param   {PaymentStatus[]}  status  - Array of status payment
   *
   * @return  {Promise<Payment[]>}       - Return the payments
   */
  public async getDeferredPayments(): Promise<Payment[]> {
    return this.createQueryBuilder('p')
      .leftJoinAndSelect('p.payin', 'payin')
      .leftJoinAndSelect('p.invoice', 'i')
      .leftJoinAndSelect('i.companyReceiver', 'c')
      .where('p.paymentAt <= :date', { date: new Date() })
      .andWhere('p.treezorBeneficiaryId is not null')
      .andWhere('p.status IN(:...status)', {status: [
        PaymentStatus.REQUESTED,
        PaymentStatus.TREEZOR_SYNC_KO_NOT_ENOUGH_BALANCE,
        PaymentStatus.TREEZOR_SYNC_KO_MISC,
        PaymentStatus.TREEZOR_WH_KO_NOT_ENOUGH_BALANCE,
        PaymentStatus.TREEZOR_WH_KO_MISC,
      ]})
      .andWhere('p.libeoEstimatedBalance > 0')
      .andWhere('c.kycStatus = :companyKycStatus', { companyKycStatus: CompanyKycStatus.VALIDATED })
      .andWhere('c.isFreezed IS NOT TRUE')
      .getMany();
  }

  /**
   * Get the planned payments
   *
   * @param   {Company}  companyReceiver  - Company object
   * @param   {Date}     paymentAt        - Date of payment
   *
   * @return  {Promise<Payment[]>}        - Return the payments
   */
  public async getPlannedPayments(companyReceiver: Company, paymentAt?: Date): Promise<Payment[]> {
    const q = this.createQueryBuilder('p');

    q.leftJoinAndSelect('p.invoice', 'i')
      .leftJoin('i.companyReceiver', 'c')
      .where('p.status IN (:...status)', { status: getStatusLibeoBalance });

    if (paymentAt) {
      q.andWhere('p.paymentAt > :date', { date: paymentAt });
    }

    return q
      .andWhere('c.id = :companyReceiverId', { companyReceiverId: companyReceiver.id })
      .orderBy('p.paymentAt', 'ASC')
      // .orderBy('p.createdAt', 'ASC')
      .getMany();
  }
}
