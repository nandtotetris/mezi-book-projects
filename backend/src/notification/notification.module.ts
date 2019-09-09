import { Module, Logger } from '@nestjs/common';
import { EmailService } from './email.service';
import { ZendeskService } from './zendesk.service';
import { SupportService } from './support.service';

@Module({
    providers: [EmailService, ZendeskService, SupportService, Logger],
    exports: [EmailService, ZendeskService, SupportService]
})
export class NotificationModule {}
