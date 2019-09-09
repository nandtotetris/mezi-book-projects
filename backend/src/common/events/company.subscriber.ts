import * as contextService from 'request-context';
import { Company } from '../entities/company.entity';
import { EventSubscriber, EntitySubscriberInterface, UpdateEvent, getRepository } from 'typeorm';
import { HistoriesService } from '../services/histories.service';
import { HistoryEntity } from '../entities/history.entity';
import { HistoryEvent } from '../dto/histories.dto';

@EventSubscriber()
export class CompanySubscriber implements EntitySubscriberInterface<Company> {
  public listenTo() {
    return Company;
  }
  /**
   * Called after company updating.
   */
  public async afterUpdate(event: UpdateEvent<Company>) {
    if (event.entity.kycStatus !== event.databaseEntity.kycStatus) {
      const historiesService: HistoriesService = new HistoriesService(getRepository('History'));
      historiesService.createHistory({
        user: contextService.get('request:user'),
        params: { kycStatus: event.entity.kycStatus },
        entity: HistoryEntity.COMPANY,
        entityId: event.databaseEntity.id,
        event: HistoryEvent.UPDATE_KYC_STATUS,
      });
    }
  }
}
