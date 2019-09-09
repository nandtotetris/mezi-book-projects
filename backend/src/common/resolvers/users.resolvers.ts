import { Resolver, Query, Context, ResolveProperty, Parent, Mutation, Args } from '@nestjs/graphql';
import { UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { GqlAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { User } from '../entities/user.entity';
import { List } from '../interfaces/common.interface';
import { CompaniesService } from '../services/companies.service';
import { UsersService } from '../services/users.service';
import { UpdateUserDto } from '../dto/users.dto';

@Resolver('User')
export class UsersResolvers {
  constructor(
    private readonly companiesService: CompaniesService,
    private readonly usersService: UsersService,
    ) {}

  // TODO: Move this to authResolvers
  @Mutation()
  public async refreshConfirmationTokenUser(@Context() ctx: any, @Args('email') email: string): Promise<User> {
    const baseUrl = (ctx.req.headers && ctx.req.headers.origin) ? ctx.req.headers.origin : null;
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new HttpException('api.error.user.not_found', HttpStatus.NOT_FOUND);
    }

    return this.usersService.confirmationToken(user, baseUrl);
  }

  @Mutation()
  public async activateUser(@Args('confirmationToken') confirmationToken: string): Promise<boolean> {
    return this.usersService.activateUser(confirmationToken);
  }

  @Mutation()
  @UseGuards(new GqlAuthGuard())
  public async updateUser(@Context() ctx: any, @Args('input') data: UpdateUserDto): Promise<User> {
    return this.usersService.updateUser(ctx.req.user, data);
  }

  @Query()
  @UseGuards(new GqlAuthGuard())
  public me(@Context() ctx: any): User {
    return ctx.req.user;
  }

  @ResolveProperty()
  public async companies(@Parent() user: User): Promise<List> {
    return this.companiesService.findByUser(user);
  }
}
