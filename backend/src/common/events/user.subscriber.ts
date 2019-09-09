import * as fs from 'fs';
import * as path from 'path';
import { EventSubscriber, EntitySubscriberInterface, InsertEvent, getRepository, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { AccountingPreference } from '../entities/accounting-preference.entity';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  /**
   * Create default accounting preferences
   *
   * @return  {Promise<void>}
   */
  private async createDefaultAccountingPreferences(): Promise<void> {
    const repository: Repository<AccountingPreference> = getRepository(AccountingPreference);
    const rawData: any = fs.readFileSync(path.resolve(__dirname, '../../../locales/fr', 'accounting-preferences.json'));
    const data: any = JSON.parse(rawData);
    let accountingPreferences: AccountingPreference[] = await repository.find({ company: null });

    if (accountingPreferences.length === 0) {
      accountingPreferences = repository.create(data);
    } else {
      accountingPreferences = Object.assign(accountingPreferences, data);
    }

    await repository.save(accountingPreferences);
  }

  /**
   * Indicates that this subscriber only listen to User events.
   */
  public listenTo() {
    return User;
  }

  /**
   * Called after user inserting.
   */
  public afterInsert(event: InsertEvent<User>) {
    this.createDefaultAccountingPreferences();
  }
}
