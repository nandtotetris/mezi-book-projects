import { Resolver, Args, Mutation, Context } from '@nestjs/graphql';
import { AddressesService } from '../services/addresses.service';
import { Address } from '../entities/address.entity';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateAddressDto } from '../dto/addresses.dto';

@Resolver('Address')
export class AddressesResolvers {
  constructor(
    private readonly addressesService: AddressesService,
  ) {}

  @Mutation()
  @UseGuards(new GqlAuthGuard())
  public async createOrUpdateAddress(@Context() ctx: any, @Args('input') input: CreateAddressDto): Promise<Address> {
    return this.addressesService.createOrUpdateAddress(ctx.req.user.company, input);
  }

  @Mutation()
  @UseGuards(new GqlAuthGuard())
  public async removeAddress(@Context() ctx: any, @Args('id') id: string): Promise<Address> {
    return this.addressesService.removeAddress(ctx.req.user.currentCompany, id);
  }
}
