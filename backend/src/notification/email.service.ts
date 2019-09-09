import { EmailServiceInterface } from './interface/email-service.interface';
import * as mailjet from 'node-mailjet';
import { HttpException, Logger } from '@nestjs/common';
import { EmailMessage } from './interface/email-message.interface';
import { ConfigService, InjectConfig } from 'nestjs-config';

export class EmailService implements EmailServiceInterface {
  private readonly mailer: mailjet.Email.Client;

  constructor(
    @InjectConfig() configService: ConfigService,
    private readonly logger: Logger
  ) {
    const config = configService.get('mailjet');
    this.mailer = mailjet.connect(config.MAILJET_APIKEY, config.MAILJET_SECRETKEY);
  }

  public async send(messagesDetail: EmailMessage<any>[]): Promise<void> {
    if (process.env.NODE_ENV === 'test') return;
    const messages = messagesDetail.map(message => {
      const From = message.From ? message.From : {
        Email: 'lucas@libeo.io',
        Name: 'Service Client Libeo',
      };
      const TemplateLanguage = message.TemplateLanguage !== undefined ? message.TemplateLanguage : true;
      return {
        ...message,
        From,
        TemplateErrorReporting: {
					Email: 'tech@libeo.io',
					Name: 'Mailjet - TemplateErrorReporting'
				},
        TemplateLanguage,
      };
    });

    try {
      await this.mailer
        .post('send', { version: 'v3.1' })
        .request({
          Messages: messages
        });
      } catch (err) {
        this.logger.error(err.message);
        throw new HttpException('api.error.user.mailjet', err.statusCode);
      }
  }
}
