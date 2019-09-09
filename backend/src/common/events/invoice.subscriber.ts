import * as contextService from 'request-context';
import { EventSubscriber, EntitySubscriberInterface, UpdateEvent, getRepository, In } from 'typeorm';
import { Invoice, InvoiceStatus } from '../entities/invoice.entity';
import { HistoriesService } from '../services/histories.service';
import { HistoryEntity } from '../entities/history.entity';
import { HistoryEvent } from '../dto/histories.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Payment, PaymentStatus } from '../entities/payment.entity';
import { User } from '../entities/user.entity';
import { AccountingEntry, AccountingEntryPostingType, AccountingEntryType } from '../entities/accounting-entry.entity';
import { AccountingPreference, AccountingPreferenceType } from '../entities/accounting-preference.entity';

@EventSubscriber()
export class InvoiceSubscriber implements EntitySubscriberInterface<Invoice> {
  /**
   * Check the change of status
   *
   * @param   {UpdateEvent<Invoice>}  event  - The event listened to
   *
   * @return  {void}
   */
  private checkStatusChange(event: UpdateEvent<Invoice>): void {
    const validatedStatuses = {};
    validatedStatuses[InvoiceStatus.IMPORTING] = [InvoiceStatus.IMPORTED];
    validatedStatuses[InvoiceStatus.IMPORTED]  = [InvoiceStatus.SCANNING];
    validatedStatuses[InvoiceStatus.SCANNING]  = [InvoiceStatus.SCANNED];
    validatedStatuses[InvoiceStatus.SCANNED]   = [InvoiceStatus.TO_PAY];
    validatedStatuses[InvoiceStatus.TO_PAY]    = [InvoiceStatus.SCANNED, InvoiceStatus.PLANNED];
    validatedStatuses[InvoiceStatus.PLANNED]   = [InvoiceStatus.TO_PAY, InvoiceStatus.PAID];
    validatedStatuses[InvoiceStatus.PAID]      = [];

    if (validatedStatuses[event.databaseEntity.status].indexOf(event.entity.status) === -1) {
      throw new HttpException('api.error.invoice.status', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Adds a invoice status change entry in the history
   *
   * @param   {Payment}  entity          - Incoming invoice
   * @param   {Payment}  databaseEntity  - Invoice already registered
   *
   * @return  {void}
   */
  private async createHistory(event: UpdateEvent<Invoice>, user: User): Promise<void> {
    const historiesService = new HistoriesService(getRepository('History'));
    const params: any = { status: event.entity.status, oldStatus: event.databaseEntity.status };

    if (event.entity.status === InvoiceStatus.PLANNED) {
      const payment: Payment = await getRepository(Payment).findOne({ where: { status: PaymentStatus.REQUESTED, invoice: { id: event.databaseEntity.id } }, order: { id: 'DESC' } });
      if (payment) {
        params.paymentAt = payment.paymentAt;
        params.libeoEstimatedBalance = payment.libeoEstimatedBalance;
      }
    }

    await historiesService.createHistory({
      user,
      params,
      entity: HistoryEntity.INVOICE,
      entityId: event.databaseEntity.id,
      event: HistoryEvent.UPDATE_STATUS,
    });
  }

  /**
   * Cancellation of invoice payments
   *
   * @param   {UpdateEvent<Invoice>}  event  - The event listened to
   * @param   {User}                  user   - Current user
   *
   * @return  {Promise<void>}
   */
  private async cancelPayments(event: UpdateEvent<Invoice>, user: User): Promise<void> {
    if (event.entity.status === InvoiceStatus.TO_PAY && event.databaseEntity.status === InvoiceStatus.PLANNED) {
      const payments = await getRepository(Payment).find({
        invoice: event.databaseEntity,
        status: In([
          PaymentStatus.REQUESTED,
          PaymentStatus.BEING_PROCESSED,
          PaymentStatus.TREEZOR_PENDING,
          PaymentStatus.TREEZOR_SYNC_KO_NOT_ENOUGH_BALANCE,
          PaymentStatus.TREEZOR_SYNC_KO_MISC,
          PaymentStatus.TREEZOR_WH_KO_MISC,
          PaymentStatus.TREEZOR_WH_KO_NOT_ENOUGH_BALANCE,
        ]),
      });

      payments.forEach(payment => {
        payment.status = PaymentStatus.CANCELLED;
        payment.cancellationRequestAt = new Date();
        payment.cancellationRequestUser = user;
        payment.save();
      });
    }
  }

  /**
   * Create accounting entries
   *
   * @param   {Invoice}        invoice  - Current invoice
   *
   * @return  {Promise<void>}
   */
  private async accountingEntry(invoice: Invoice): Promise<void> {
    if (invoice.status !== InvoiceStatus.PAID) {
      return;
    }

    const entries: any = [];
    let ledgerPurchase: AccountingPreference;
    let ledgerBank: AccountingPreference;
    let vatAccount: AccountingPreference;
    let vendorAccount: AccountingPreference;
    let bankAccount: AccountingPreference;
    let payment: Payment;

    try {
      [ ledgerPurchase, ledgerBank, vatAccount, vendorAccount, bankAccount, payment ] = await Promise.all([
        getRepository(AccountingPreference).findOne({ type: AccountingPreferenceType.LEDGER_PURCHASE, company: invoice.companyReceiver }),
        getRepository(AccountingPreference).findOne({ type: AccountingPreferenceType.LEDGER_BANK, company: invoice.companyReceiver }),
        getRepository(AccountingPreference).findOne({ type: AccountingPreferenceType.VAT_ACCOUNT, company: invoice.companyReceiver }),
        getRepository(AccountingPreference).findOne({ type: AccountingPreferenceType.VENDOR_ACCOUNT, company: invoice.companyReceiver }),
        getRepository(AccountingPreference).findOne({ type: AccountingPreferenceType.BANK_ACCOUNT, company: invoice.companyReceiver }),
        getRepository(Payment).findOne({ invoice: { id: invoice.id }, status: PaymentStatus.TREEZOR_WH_VALIDATED }),
      ]);
    } catch (err) {
      throw new HttpException('api.error.invoice.accounting_entries', HttpStatus.BAD_REQUEST);
    }

    if (ledgerPurchase && ledgerBank) {
      entries.push(
        {
          entryDate: invoice.invoiceDate,
          ledger: ledgerPurchase,
          account: vendorAccount,
          entryLabel: invoice.companyEmitter.name,
          postingType: AccountingEntryPostingType.CREDIT,
          entryAmount: invoice.total,
          entryRef: invoice.number,
          entryCurrency: invoice.currency,
          entryType: AccountingEntryType.INVOICE,
          company: invoice.companyReceiver,
        },
        {
          entryDate: invoice.invoiceDate,
          ledger: ledgerPurchase,
          account: vatAccount,
          entryLabel: invoice.companyEmitter.name,
          postingType: AccountingEntryPostingType.DEBIT,
          entryAmount: invoice.total - invoice.totalWoT,
          entryRef: invoice.number,
          entryCurrency: invoice.currency,
          entryType: AccountingEntryType.INVOICE,
          company: invoice.companyReceiver,
        },
        {
          entryDate: invoice.invoiceDate,
          ledger: ledgerPurchase,
          account: invoice.purchaseAccount,
          entryLabel: invoice.companyEmitter.name,
          postingType: AccountingEntryPostingType.CREDIT,
          entryAmount: invoice.totalWoT,
          entryRef: invoice.number,
          entryCurrency: invoice.currency,
          entryType: AccountingEntryType.INVOICE,
          company: invoice.companyReceiver,
        },
      );
    }

    if (bankAccount && payment) {
      entries.push(
        {
          entryDate: payment.treezorValidationAt,
          ledger: ledgerBank,
          account: vendorAccount,
          entryLabel: invoice.companyEmitter.name,
          postingType: AccountingEntryPostingType.DEBIT,
          entryAmount: invoice.totalWoT,
          entryRef: invoice.number,
          entryCurrency: invoice.currency,
          entryType: AccountingEntryType.PAYMENT,
          company: invoice.companyReceiver,
        },
        {
          entryDate: payment.treezorValidationAt,
          ledger: ledgerBank,
          account: bankAccount,
          entryLabel: invoice.companyEmitter.name,
          postingType: AccountingEntryPostingType.CREDIT,
          entryAmount: invoice.totalWoT,
          entryRef: invoice.number,
          entryCurrency: invoice.currency,
          entryType: AccountingEntryType.PAYMENT,
          company: invoice.companyReceiver,
        },
      );
    }

    if (entries.length > 0) {
      await getRepository(AccountingEntry).insert(entries);
    }
  }

  /**
   * Indicates that this subscriber only listen to Invoice events.
   */
  public listenTo() {
    return Invoice;
  }

  /**
   * Called before invoice updating.
   */
  public beforeUpdate(event: UpdateEvent<Invoice>) {
    if (event.entity.status !== event.databaseEntity.status) {
      this.checkStatusChange(event);
    }
  }

  /**
   * Called after invoice updating.
   */
  public async afterUpdate(event: UpdateEvent<Invoice>) {
    if (event.entity.status !== event.databaseEntity.status) {
      const user = contextService.get('request:user');
      await this.createHistory(event, user);
      await this.accountingEntry(event.entity);
      // this.cancelPayments(event, user);
    }
  }
}
