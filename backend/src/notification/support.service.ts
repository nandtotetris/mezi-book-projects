import { ZendeskService } from './zendesk.service';
import { ZendesTicketPriority } from './interface/zendesk-ticket.interface';
import { User } from '../common/entities/user.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SupportService {
  constructor(
    private readonly zendeskService: ZendeskService,
  ) {}

  async createTicketNewUser(user: User): Promise<void> {
    if (process.env.NODE_ENV === 'test') return;

    return this.zendeskService.createTicket({
      priority: ZendesTicketPriority.URGENT,
      requester: { name: user.fullName, email: user.email },
      subject: 'Nouvelle inscription',
      comment: { body: `L'utilisateur ${user.fullName} s'est inscrit sur Libeo` },
    });
  }
}
