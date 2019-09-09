import { Resolver, Mutation, Query, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PartnersService } from '../services/partners.service';
import { CompaniesService } from '../services/companies.service';
import { Company } from '../entities/company.entity';

@Resolver('Partner')
export class PartnersResolvers {
  constructor(
    private readonly partnersService: PartnersService,
    private readonly companiesService: CompaniesService,
  ) {}

  @Mutation()
  @UseGuards(new GqlAuthGuard())
  public async createPartner(@Args('input') input: Company, @Context() ctx: any): Promise<Company> {
    return this.partnersService.createPartner(ctx.req.user, input);
  }

  // TODO: Add decorator for manage parameter (orderBy, limit, offset)
  @Query()
  @UseGuards(new GqlAuthGuard())
  public async partners(@Context() ctx: any, @Args('limit') limit: number, @Args('offset') offset: number): Promise<any> {
    const currentCompany: Company = await this.companiesService.getCurrentCompanyByUser(ctx.req.user);
    const result = await Promise.all([
      this.partnersService.findByCompany(currentCompany, null, limit, offset),
      this.partnersService.countByCompany(currentCompany),
    ]);

    return {
      total: result[1],
      rows: result[0],
    };
  }

  @Query()
  @UseGuards(new GqlAuthGuard())
  public async partner(@Args('id') id: string): Promise<Company> {
    return this.partnersService.findOneById(id);
  }
}
