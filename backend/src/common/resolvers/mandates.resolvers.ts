import { Resolver, Args, Context, Query, Mutation } from '@nestjs/graphql';
import { MandatesService } from '../services/mandates.service';
import { Mandate } from '../entities/mandate.entity';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Resolver('Mandate')
export class MandatesResolvers {
  constructor(
    private readonly mandatesService: MandatesService,
  ) {}

  @Mutation()
  @UseGuards(new GqlAuthGuard())
  public createMandate(@Context() ctx: any, @Args('bankAccountId') bankAccountId: string): Promise<Mandate> {
    return this.mandatesService.createMandate(ctx.req.user, bankAccountId, ctx.req.headers['x-forwarded-for']);
  }

  @Mutation()
  @UseGuards(new GqlAuthGuard())
  public generateCodeMandate(@Context() ctx: any, @Args('id') id: string): Promise<Mandate> {
    return this.mandatesService.generateCodeMandate(ctx.req.user, id);
  }

  @Mutation()
  @UseGuards(new GqlAuthGuard())
  public signedMandate(@Context() ctx: any, @Args('id') id: string, @Args('code') code: string): Promise<Mandate> {
    return this.mandatesService.signedMandate(ctx.req.user, id, code);
  }

  @Mutation()
  @UseGuards(new GqlAuthGuard())
  public removeMandate(@Context() ctx: any, @Args('id') id: string): Promise<Mandate> {
    return this.mandatesService.removeMandate(ctx.req.user.currentCompany, id);
  }

  @Query()
  @UseGuards(new GqlAuthGuard())
  public mandate(@Context() ctx: any, @Args('id') id: string): Promise<Mandate> {
    return this.mandatesService.getMandate(ctx.req.user.currentCompany, id);
  }
}
