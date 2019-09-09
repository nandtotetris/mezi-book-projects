import { Injectable, UseGuards } from '@nestjs/common';
import { Context, Query, Args } from '@nestjs/graphql';
import { BalancesService } from '../services/balances.service';
import { GqlAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Injectable()
export class BalancesResolver {
  constructor(
    private readonly balancesService: BalancesService,
  ) {}

  /**
   * Get all balances
   */
  @Query()
  @UseGuards(new GqlAuthGuard())
  public async balance(@Context() ctx: any): Promise<any> {
    return this.balancesService.getBalance(ctx.req.user.currentCompany);
  }

  @Query()
  @UseGuards(new GqlAuthGuard())
  public async checkBalance(@Context() ctx: any, @Args('invoiceId') invoiceId: string, @Args('paymentAt') paymentAt?: Date): Promise<boolean> {
    const balance = await this.balancesService.getBalance(ctx.req.user.currentCompany);
    return this.balancesService.checkBalance(balance, ctx.req.user.currentCompany, invoiceId, paymentAt);
  }
}
