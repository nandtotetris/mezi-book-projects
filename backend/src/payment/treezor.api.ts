import * as uuid from 'uuid';
import * as crypto from 'crypto';
import * as rp from 'request-promise-native';
import { Repository } from 'typeorm';
import { WebhooksService } from '../common/services/webhooks.service';
import { Webhook } from '../common/entities/webhook.entity';
import { TreezorConfig } from '../config/treezor';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectConfig, ConfigService } from 'nestjs-config';
import { Injectable } from '@nestjs/common';

export enum MutationMethod {
  POST   = 'POST',
  PUT    = 'PUT',
  DELETE = 'DELETE',
}

export interface MutationOptions {
  body?: any;
  form?: any;
  formData?: any;
  method?: MutationMethod;
  objectIdKey?: string;
  sign?: boolean;
}

export interface QueryOptions {
  qs?: any;
  sign?: boolean;
}

@Injectable()
export class TreezorAPI {
  private readonly config: TreezorConfig;
  private readonly defaultOptions: any;
  private readonly webhook: WebhooksService;

  constructor(
    @InjectRepository(Webhook) webhookRepository: Repository<Webhook>,
    @InjectConfig() configService: ConfigService
  ) {
    this.config = configService.get('treezor');
    this.webhook = new WebhooksService(webhookRepository);
    this.defaultOptions = {
      json: true,
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + this.config.token,
        'Content-Type': 'application/json',
      },
    };
  }

  /**
   * Reset default options
   */
  private resetOptions() {
    delete this.defaultOptions.qs;
    delete this.defaultOptions.body;
    delete this.defaultOptions.form;
    delete this.defaultOptions.formData;
    this.defaultOptions.method = 'POST';
    this.defaultOptions.headers['Content-Type'] = 'application/json';
  }

  /**
   * Set global properties for security calls
   */
  private setGlobalProperties(props: any, sign: boolean = true): any {
    props.accessTag = uuid.v4();
    if (sign) {
      props.accessSignature = this.computePayloadSignature(props);
    }

    return props;
  }

  /**
   * Set call options
   */
  private setMutationCallOptions(endpoint: string, options: MutationOptions, data: any): any {
    const callOptions = Object.assign(this.defaultOptions, {
      uri: this.config.baseUrl + endpoint,
    });

    if (options.method) {
      callOptions.method = options.method;
    }

    if (options.formData) {
      callOptions.formData = data;
    } else if (options.form) {
      callOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      callOptions.form = data;
    } else {
      callOptions.body = data;
    }

    return callOptions;
  }

  /**
   * Create and return a new signature for call API
   * This should be removed, We don't need to sign our own requests
   */
  computePayloadSignature(value: any): string {
    return crypto
      .createHmac('sha256', this.config.secretKey)
      .update(JSON.stringify(value))
      .digest()
      .toString('base64');
  }

  /**
   * Call of type POST/PUT/DELETE
   */
  public async mutation(endpoint: string, options: MutationOptions): Promise<any> {
    this.resetOptions();
    const data = this.setGlobalProperties(options.body || options.form || options.formData || {}, options.sign || null);
    const callOptions = this.setMutationCallOptions(endpoint, options, data);

    // Call
    return rp(callOptions)
      .then(res => {
        if (!res) {
          return Promise.resolve(null);
        }

        const keys = Object.keys(res);
        if (keys.length === 0) {
          return Promise.resolve();
        }

        const [ object ] = res[keys[0]];
        // Same this should save a TreezorCall, not a webhook, this is not a webhook
        this.webhook.createWebhook({
          accessTag: data.accessTag,
          requestPayload: data,
          responsePayload:  res
        });

        return Promise.resolve(object);
      })
      .catch(err => {
        // Same this should save a TreezorCall, not a webhook
        this.webhook.createWebhook({
          accessTag: data.accessTag,
          requestPayload: data,
          responsePayload:  err.error
        });
        let { error } = err;
        if (error) {
          const { errors } = error;
          if (errors) {
            [ error ] = errors;
            err.code = error.errorCode;
            err.message = error.errorMessage;
          }
        }

        return Promise.reject(err);
      });
  }

  /**
   * Call of type GET
   */
  public async query(endpoint: string, options: QueryOptions): Promise<any> {
    this.resetOptions();
    const callOptions = Object.assign(this.defaultOptions, {
      uri: this.config.baseUrl + endpoint,
      qs: this.setGlobalProperties(options.qs, options.sign || null),
      method: 'GET',
    });

    return rp(callOptions)
    .catch(err => {
      let { error } = err;
      const { errors } = error;
      [ error ] = errors;
      err.message = error.errorMessage;
      return Promise.reject(err);
    });
  }
}
