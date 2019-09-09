import { ExportsService } from '../services/exports.service';
import { Mutation, Context, Resolver, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { List } from '../interfaces/common.interface';

@Resolver('Export')
export class ExportsResolvers {
  constructor(
    private readonly exportsService: ExportsService,
  ) {}

  @Mutation()
  @UseGuards(new GqlAuthGuard())
  public async export(@Context() ctx: any): Promise<string> {
    return this.exportsService.generate(ctx.req.user.currentCompany);
  }

  @Query()
  @UseGuards(new GqlAuthGuard())
  public async exports(@Context() ctx: any, @Args('orderBy') orderBy?: string, @Args('limit') limit?: number, @Args('offset') offset?: number): Promise<List> {
    return this.exportsService.findByCompany(ctx.req.user.currentCompany, orderBy, limit, offset);
  }
}
