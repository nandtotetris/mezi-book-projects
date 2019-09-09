import { Resolver, Query, Args, Mutation, ResolveProperty, Parent, Context } from '@nestjs/graphql';
import { CompaniesService } from '../services/companies.service';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { List } from '../interfaces/common.interface';
import { ITaxResidence } from '../../payment/interfaces/treezor/taxresidence.interface';

@Resolver('Beneficiary')
export class BeneficiariesResolvers {
  constructor(
    private readonly companiesService: CompaniesService,
  ) {}

  @Mutation()
  @UseGuards(new GqlAuthGuard())
  public async createBeneficiary(@Context() ctx: any, @Args('input') input: any): Promise<any> {
    return this.companiesService.createBeneficiary(ctx.req.user, input);
  }

  @Mutation()
  @UseGuards(new GqlAuthGuard())
  public async removeBeneficiary(@Context() ctx: any, @Args('id') id: number): Promise<any> {
    return this.companiesService.removeBeneficiary(ctx.req.user.currentCompany, id);
  }

  @Query()
  @UseGuards(new GqlAuthGuard())
  public async beneficiaries(@Context() ctx: any, @Args('limit') limit: number, @Args('page') page: number): Promise<any> {
    return this.companiesService.getBeneficiaries(ctx.req.user.currentCompany, limit, page);
  }

  @Query()
  @UseGuards(new GqlAuthGuard())
  public async taxResidence(@Args('userId') userId: number, @Args('country') country: string): Promise<ITaxResidence> {
    return this.companiesService.getTaxResidence(userId, country);
  }

  @ResolveProperty()
  public async documents(@Parent() beneficiary: any, @Args('limit') limit?: number, @Args('page') page?: number): Promise<List> {
    return this.companiesService.getDocuments(beneficiary.userId, limit, page);
  }
}
