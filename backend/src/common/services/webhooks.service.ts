import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Webhook } from '../entities/webhook.entity';
import { IWebhook } from '../interfaces/webhook.interface';

@Injectable()
export class WebhooksService {
  constructor(
    @InjectRepository(Webhook)
    private readonly webhookRepository: Repository<Webhook>,
  ) {}

  /**
   * Convert the keys of the object from SnakeCase to CamelCase
   *
   * @param   {any}  obj  - Object to be modified
   *
   * @return  {any}       - Return a object modified
   */
  private snakeToCamel(obj: IWebhook): Webhook {
    const data = {} as Webhook;
    Object.keys(obj).forEach(k => {
      const key = k.replace(/([-_][a-z])/ig, ($1) => {
        return $1.toUpperCase()
          .replace('-', '')
          .replace('_', '');
      });

      data[key] = obj[k];
    });

    return data;
  }

  /**
   * Create a webhook
   *
   * @param   {IWebhook}          data  - Data of webhook
   *
   * @return  {Promise<Webhook>}        - Returns the created Webhook
   */
  public async createWebhook(data: IWebhook): Promise<Webhook> {
    data = this.snakeToCamel(data);
    const webhook: Webhook = this.webhookRepository.create(data);
    return this.webhookRepository.save(webhook);
  }
}
