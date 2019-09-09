import { Resolver, Query, Args } from '@nestjs/graphql';
import { IbansService } from '../services/ibans.service';
import { IbanStatus } from '../entities/iban.entity';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { List } from '../interfaces/common.interface';

@Resolver('Iban')
export class IbansResolvers {
  constructor(
    private readonly ibansService: IbansService,
  ) {}

  @Query()
  @UseGuards(new GqlAuthGuard())
  public async checkIban(@Args('iban') iban: string): Promise<IbanStatus> {
    return this.ibansService.checkIban(iban);
  }

  @Query()
  @UseGuards(new GqlAuthGuard())
  public async ibans(@Args('siren') siren: string): Promise<List> {
    return this.ibansService.findByCompanySiren(siren);
  }
}
