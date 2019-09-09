import { EmailMessage } from './email-message.interface';

export interface EmailServiceInterface {
  send(messages: EmailMessage<any>[]): void;
}
