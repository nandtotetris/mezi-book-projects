import { EventSubscriber, EntitySubscriberInterface, UpdateEvent, getRepository, InsertEvent } from 'typeorm';
import { HistoriesService } from '../services/histories.service';
import { HistoryEntity } from '../entities/history.entity';
import { HistoryEvent } from '../dto/histories.dto';
import { Payment, PaymentStatus } from '../entities/payment.entity';
import { TreezorService } from '../../payment/treezor.service';
import { HttpException, HttpStatus } from '@nestjs/common';
// import { PaymentsService } from '../services/payments.service';

@EventSubscriber()
export class PaymentSubscriber implements EntitySubscriberInterface<Payment> {
  // constructor(
  //   private readonly paymentsService: PaymentsService
  // ) {}

  /**
   * Check the change of status
   *
   * @param   {UpdateEvent<Payment>}  event  - The event listened to
   *
   * @return  {void}
   */
  private checkStatusChange(event: UpdateEvent<Payment>): void {
    const validatedStatuses = {};
    validatedStatuses[PaymentStatus.REQUESTED]                          = [PaymentStatus.BEING_PROCESSED, PaymentStatus.CANCELLED];
    validatedStatuses[PaymentStatus.BEING_PROCESSED]                    = [PaymentStatus.TREEZOR_PENDING, PaymentStatus.TREEZOR_SYNC_KO_NOT_ENOUGH_BALANCE, PaymentStatus.TREEZOR_SYNC_KO_MISC, PaymentStatus.CANCELLED];
    validatedStatuses[PaymentStatus.TREEZOR_PENDING]                    = [PaymentStatus.TREEZOR_WH_KO_MISC, PaymentStatus.TREEZOR_WH_KO_NOT_ENOUGH_BALANCE, PaymentStatus.CANCELLED, PaymentStatus.TREEZOR_WH_VALIDATED];
    validatedStatuses[PaymentStatus.TREEZOR_SYNC_KO_NOT_ENOUGH_BALANCE] = [PaymentStatus.BEING_PROCESSED, PaymentStatus.CANCELLED];
    validatedStatuses[PaymentStatus.TREEZOR_SYNC_KO_MISC]               = [PaymentStatus.BEING_PROCESSED, PaymentStatus.CANCELLED];
    validatedStatuses[PaymentStatus.TREEZOR_WH_KO_NOT_ENOUGH_BALANCE]   = [PaymentStatus.BEING_PROCESSED];
    validatedStatuses[PaymentStatus.TREEZOR_WH_KO_MISC]                 = [PaymentStatus.BEING_PROCESSED];
    validatedStatuses[PaymentStatus.TREEZOR_WH_VALIDATED]               = [];
    validatedStatuses[PaymentStatus.CANCELLED]                          = [];

    if (validatedStatuses[event.databaseEntity.status].indexOf(event.entity.status) === -1) {
      throw new HttpException({msg: 'api.error.payment.status', info: {databaseStatus: event.databaseEntity.status, newStatus: event.entity.status}}, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Adds a payment status change entry in the history
   *
   * @param   {Payment}  entity          - Incoming payment
   * @param   {Payment}  databaseEntity  - Payment already registered (optional)
   *
   * @return  {void}
   */
  private createHistory(entity: Payment, databaseEntity?: Payment): void {
    const historiesService = new HistoriesService(getRepository('History'));
    const params: any = { status: entity.status };
    if (databaseEntity) {
      params.oldStatus = databaseEntity.status;
    }

    switch (entity.status) {
      case PaymentStatus.REQUESTED:
        params.user = entity.paymentRequestUser;
        params.paymentId = entity.id;
        break;
      case PaymentStatus.BEING_PROCESSED:
        params.user = entity.paymentRequestUser;
        params.paymentId = entity.id;
        break;
      case PaymentStatus.TREEZOR_PENDING:
        params.paymentId = entity.id;
        params.treezorId = entity.treezorPayoutId;
        break;
      case PaymentStatus.TREEZOR_SYNC_KO_NOT_ENOUGH_BALANCE:
        params.paymentId = entity.id;
        break;
      case PaymentStatus.TREEZOR_SYNC_KO_MISC:
        params.treezorId = entity.treezorPayoutId;
        break;
      case PaymentStatus.TREEZOR_WH_KO_NOT_ENOUGH_BALANCE:
        params.paymentId = entity.id;
        params.treezorId = entity.treezorPayoutId;
        break;
      case PaymentStatus.TREEZOR_WH_KO_MISC:
        params.paymentId = entity.id;
        params.treezorId = entity.treezorPayoutId;
        break;
      case PaymentStatus.TREEZOR_WH_VALIDATED:
        params.paymentId = entity.id;
        params.treezorId = entity.treezorPayoutId;
        break;
      case PaymentStatus.CANCELLED:
        params.user = entity.paymentRequestUser;
        params.paymentId = entity.id;
        params.treezorId = entity.treezorPayoutId;
        break;
      default:
        break;
    }

    historiesService.createHistory({
      params,
      entity: HistoryEntity.PAYMENT,
      entityId: (databaseEntity) ? databaseEntity.id : entity.id,
      event: HistoryEvent.UPDATE_STATUS,
    });
  }

  /**
   * Indicates that this subscriber only listen to Payment events.
   */
  public listenTo() {
    return Payment;
  }

  /**
   * Called after payment inserting.
   */
  public afterInsert(event: InsertEvent<Payment>) {
    if (event.entity.status) {
      this.createHistory(event.entity);
    }
  }

  /**
   * Called after payment updating.
   */
  public async afterUpdate(event: UpdateEvent<Payment>) {
    if (event.entity.status !== event.databaseEntity.status) {
      this.checkStatusChange(event);
      this.createHistory(event.entity, event.databaseEntity);
      // this.cancelPaymentTreezor(event);

      // if (event.entity.status === PaymentStatus.CANCELLED) {
      //   this.paymentsService.updateLibeoBalance(event.entity.invoice.companyReceiver);
      // }
    }
  }
}
