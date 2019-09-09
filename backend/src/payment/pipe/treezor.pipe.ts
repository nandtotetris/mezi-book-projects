import { PipeTransform, Injectable, BadRequestException, Inject } from '@nestjs/common';
import { IWebhook } from '../../common/interfaces/webhook.interface';
import { Webhook } from '../../common/entities/webhook.entity';
import { TreezorAPI } from '../treezor.api';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TreezorSignatureValidationPipe implements PipeTransform {
  constructor(private readonly treezorApi: TreezorAPI){}

  transform(body: Webhook): Webhook {
    if (!body.objectPayload) throw new BadRequestException('object_payload is empty');
    if (process.env.NODE_ENV === 'development') return body;
    if (process.env.TREEZOR_SIGNATURE_VALIDATION && process.env.TREEZOR_SIGNATURE_VALIDATION === 'false') return body;

    const signature = this.treezorApi.computePayloadSignature(body.objectPayload);
    if (signature !== body.objectPayloadSignature) {
      throw new BadRequestException('Webhook payload has Incorrect signature');
    }

    return body;
  }
}

@Injectable()
export class CamelCaseifyPayloadPipe implements PipeTransform {
  transform(body: IWebhook): Webhook {
    const camelCaseData = {} as Webhook;
    Object.keys(body).forEach(k => {
      const key = k.replace(/([-_][a-z])/ig, ($1) => {
        return $1.toUpperCase()
          .replace('-', '')
          .replace('_', '');
      });

      camelCaseData[key] = body[k];
    });

    return camelCaseData;
  }
}

@Injectable()
export class SaveTreezorWebhookPipe implements PipeTransform {
  constructor(@InjectRepository(Webhook) private readonly webhookRepository: Repository<Webhook>) {}
  transform(body: Webhook): Webhook {
    this.webhookRepository.save(body);

    return body;
  }
}
