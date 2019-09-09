import { Resolver, Mutation, Context, Args } from '@nestjs/graphql';
import { PaymentsService } from '../services/payments.service';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Invoice } from '../entities/invoice.entity';
import { List } from '../interfaces/common.interface';

@Resolver('Payment')
export class PaymentsResolvers {
  constructor(
    private readonly paymentsService: PaymentsService,
  ) {}

  @Mutation()
  @UseGuards(new GqlAuthGuard())
  public async payout(@Context() ctx: any, @Args('invoiceId') invoiceId: string, @Args('date') date?: Date, @Args('code') code?: string): Promise<Invoice[]> {
    return this.paymentsService.payout(ctx.req.user, invoiceId, date, code);
  }

  @Mutation()
  @UseGuards(new GqlAuthGuard())
  public async payoutContacts(@Context() ctx: any, @Args('invoiceId') invoiceId: string, @Args('contactIds') contactIds: string[]): Promise<boolean> {
    return this.paymentsService.payoutContacts(ctx.req.user, invoiceId, contactIds);
  }
}
