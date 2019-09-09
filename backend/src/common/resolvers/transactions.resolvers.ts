import { Injectable, UseGuards } from '@nestjs/common';
import { List } from '../interfaces/common.interface';
import { Args, Context, Query } from '@nestjs/graphql';
import { TransactionsService } from '../services/transactions.service';
import { GqlAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Injectable()
export class TransactionsResolver {
  constructor(
    private readonly transactionsService: TransactionsService,
  ) {}

  /**
   * Get all transactions
   */
  @Query()
  @UseGuards(new GqlAuthGuard())
  public async transactions(@Context() ctx: any, @Args('limit') limit?: number, @Args('page') page?: number): Promise<List> {
    return this.transactionsService.findByCompany(ctx.req.user.currentCompany);
  }
}
