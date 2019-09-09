import { Resolver, Query, Context, Args, Mutation } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { List } from '../interfaces/common.interface';
import { AccountingPreferenceDto } from '../dto/accounting-preferences.dto';
import { AccountingPreferenceType } from '../entities/accounting-preference.entity';
import { AccountingPreferencesService } from '../services/accounting-preferences.service';

@Resolver('AccountingPreference')
export class AccountingPreferencesResolvers {
  constructor(
    private readonly accountingPreferencesService: AccountingPreferencesService,
  ) {}

  @Mutation()
  @UseGuards(new GqlAuthGuard())
  public async createOrUpdateAccountingPreferences(@Context() ctx: any, @Args('input') input: AccountingPreferenceDto[]): Promise<List> {
    return this.accountingPreferencesService.createOrUpdateAccountingPreferences(ctx.req.user.currentCompany, input);
  }

  @Query()
  @UseGuards(new GqlAuthGuard())
  public async accountingPreferences(@Context() ctx: any, @Args('types') types?: AccountingPreferenceType[], @Args('default') defaultOptions?: boolean): Promise<List> {
    return this.accountingPreferencesService.findByTypes(ctx.req.user.currentCompany, types, defaultOptions);
  }
}
