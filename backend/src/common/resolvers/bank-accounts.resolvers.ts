import { Injectable, UseGuards } from '@nestjs/common';
import { Context, Query, Mutation, Args } from '@nestjs/graphql';
import { GqlAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { BankAccountService } from '../services/bank-account.service';
import { CreateOrUpdateBankAccountDto } from '../dto/bank-account.dto';
import { List } from '../interfaces/common.interface';
import { BankAccount } from '../entities/bank-account.entity';

@Injectable()
export class BankAccountResolver {
  constructor(
    private readonly bankAccountService: BankAccountService,
  ) {}

  @Mutation()
  @UseGuards(new GqlAuthGuard())
  public createOrUpdateBankAccount(@Context() ctx: any, @Args('input') input: CreateOrUpdateBankAccountDto, @Args('id') id: string): Promise<BankAccount> {
    return this.bankAccountService.createOrUpdateBankAccount(ctx.req.user.currentCompany, ctx.req.user, input, id);
  }

  @Mutation()
  @UseGuards(new GqlAuthGuard())
  public changeDefaultBankAccount(@Context() ctx: any, @Args('id') id: string): Promise<BankAccount[]> {
    return this.bankAccountService.changeDefaultBankAccount(ctx.req.user.currentCompany, id);
  }

  @Mutation()
  @UseGuards(new GqlAuthGuard())
  public removeBankAccount(@Context() ctx: any, @Args('id') id: string): Promise<BankAccount> {
    return this.bankAccountService.removeBankAccount(ctx.req.user.currentCompany, id);
  }

  @Query()
  @UseGuards(new GqlAuthGuard())
  public bankAccounts(@Context() ctx: any): Promise<List> {
    return this.bankAccountService.getBankAccounts(ctx.req.user.currentCompany);
  }

  @Query()
  @UseGuards(new GqlAuthGuard())
  public bankAccount(@Context() ctx: any, @Args('id') id: string): Promise<BankAccount> {
    return this.bankAccountService.getBankAccount(ctx.req.user.currentCompany, id);
  }
}
