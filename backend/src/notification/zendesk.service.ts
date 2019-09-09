import * as Zendesk from 'zendesk-node-api';
import { ConfigService, InjectConfig } from 'nestjs-config';
import { ZendeskCreateTicket, ZendeskCustomField } from './interface/zendesk-ticket.interface';

export class ZendeskService {
  private readonly zendeskClient: Zendesk;
  private readonly environmentZendesk: ZendeskCustomField;

  constructor(@InjectConfig() configService: ConfigService) {
    const config = configService.get('zendesk');
    this.zendeskClient = new Zendesk({
      url: config.ZENDESK_API_URL,
      email: config.ZENDESK_API_EMAIL,
      token: config.ZENDESK_API_TOKEN
    });
    this.environmentZendesk = config.ZENDESK_ENVIRONMENT;
  }

  async createTicket(obj: ZendeskCreateTicket): Promise<void> {
    if (this.environmentZendesk.value === 'Test') {
      return;
    }

    try {
      let customFields = [this.environmentZendesk];
      if (obj.customFields) {
        customFields = [...customFields, ...obj.customFields];
      }

      await this.zendeskClient
        .tickets.create({
          type: obj.type || null,
          priority: obj.priority,
          requester: { name: obj.requester.name, email: obj.requester.email },
          subject: obj.subject,
          comment: obj.comment,
          custom_fields	: customFields,
        });
    } catch (err) {
      throw new Error(err);
    }
  }
}
