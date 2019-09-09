import { Resolver, Args, Mutation, Context, ResolveProperty, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { List } from '../interfaces/common.interface';
import { CreateContactDto, UpdateContactDto } from '../dto/contacts.dto';
import { ContactsService } from '../services/contacts.service';
import { EmailsService } from '../services/emails.service';
import { Contact } from '../entities/contact.entity';

@Resolver('Contact')
export class ContactsResolvers {
  constructor(
    private readonly contactsService: ContactsService,
    private readonly emailsService: EmailsService,
  ) {}

  @Mutation()
  @UseGuards(new GqlAuthGuard())
  public async createContact(@Context() ctx: any, @Args('input') input: CreateContactDto): Promise<Contact> {
    return this.contactsService.createContact(ctx.req.user, input);
  }

  @Mutation()
  @UseGuards(new GqlAuthGuard())
  public async updateContact(@Args('id') id: string, @Args('input') input: UpdateContactDto): Promise<Contact> {
    return this.contactsService.updateContact(id, input);
  }

  @ResolveProperty()
  public async emails(@Parent() contact: Contact): Promise<List> {
    return this.emailsService.findByContact(contact);
  }
}
