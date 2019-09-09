import { Resolver, Args, Mutation } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { EmailsService } from '../services/emails.service';
import { CreateEmailDto, UpdateEmailDto } from '../dto/emails.dto';
import { Email } from '../entities/email.entity';

@Resolver('Email')
export class EmailsResolvers {
  constructor(
    private readonly emailsService: EmailsService,
  ) {}

  @Mutation()
  @UseGuards(new GqlAuthGuard())
  public async createEmail(@Args('input') input: CreateEmailDto): Promise<Email> {
    return this.emailsService.createEmail(input);
  }

  @Mutation()
  @UseGuards(new GqlAuthGuard())
  public async updateEmail(@Args('id') id: string, @Args('input') input: UpdateEmailDto): Promise<Email> {
    return this.emailsService.updateEmail(id, input);
  }
}
