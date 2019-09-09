import { User } from '../entities/user.entity';
import { HistoryEntity } from '../entities/history.entity';

export class CreateHistoryDto {
  user?: User;
  params: any;
  entity: HistoryEntity;
  entityId: string;
  event: HistoryEvent;
}

export enum HistoryEvent {
  UPDATE_STATUS = 'UPDATE_STATUS',
  UPDATE_KYC_STATUS = 'UPDATE_KYC_STATUS',
}
