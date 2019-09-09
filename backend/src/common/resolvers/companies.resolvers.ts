import { Resolver, Query, Args, Mutation, ResolveProperty, Parent, Context } from '@nestjs/graphql';
import { CompaniesService } from '../services/companies.service';
import { Company, CompanyStatus, CompanyKycStatus } from '../entities/company.entity';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AddressesService } from '../services/addresses.service';
import { Address } from '../entities/address.entity';
import { ContactsService } from '../services/contacts.service';
import { List } from '../interfaces/common.interface';
import { IDocument } from '../../payment/interfaces/treezor/document.interface';
import { InvoicesService } from '../services/invoices.service';
import { IComplementaryInfos } from '../interfaces/company.interface';
import { IbansService } from '../services/ibans.service';
import { File } from '../interfaces/file.interface';

@Resolver('Company')
export class CompaniesResolvers {
  constructor(
    private readonly companiesService: CompaniesService,
    private readonly addressesService: AddressesService,
    private readonly contactsService: ContactsService,
    private readonly invoicesService: InvoicesService,
    private readonly ibansService: IbansService,
  ) {}

  @Mutation()
  @UseGuards(new GqlAuthGuard())
  public async createOrUpdateCompany(@Context() ctx: any, @Args('id') id: string, @Args('input') input: Company): Promise<Company> {
    return this.companiesService.createOrUpdateCompany(ctx.req.user, input, id);
  }

  @Mutation()
  @UseGuards(new GqlAuthGuard())
  public async signContract(@Context() ctx: any): Promise<boolean> {
    return this.companiesService.signContract(ctx.req.user);
  }

  @Mutation()
  @UseGuards(new GqlAuthGuard())
  public async updateKycStatus(@Context() ctx: any, @Args('status') status: CompanyKycStatus): Promise<Company> {
    return this.companiesService.updateKycStatus(ctx.req.user, status);
  }

  @Mutation()
  @UseGuards(new GqlAuthGuard())
  public async removeDocument(@Args('id') id: number): Promise<IDocument> {
    return this.companiesService.removeDocument(id);
  }

  @Mutation()
  @UseGuards(new GqlAuthGuard())
  public async updateKycStep(@Context() ctx: any, @Args('step') step: string): Promise<Company> {
    return this.companiesService.updateKycStep(ctx.req.user.currentCompany, step);
  }

  @Mutation()
  @UseGuards(new GqlAuthGuard())
  public async uploadLogo(@Context() ctx: any, @Args('file') file: File): Promise<string> {
    return this.companiesService.uploadLogo(file, ctx.req.user.currentCompany);
  }

  @Query()
  @UseGuards(new GqlAuthGuard())
  public async searchCompanies(@Args('query') query: string, @Args('orderBy') orderBy?: string, @Args('limit') limit?: number, @Args('offset') offset?: number): Promise<List> {
    return this.companiesService.searchCompanies(query, orderBy, limit, offset);
  }

  @Query()
  @UseGuards(new GqlAuthGuard())
  public async company(@Context() ctx: any): Promise<Company> {
    return ctx.req.user.currentCompany;
  }

  @Query()
  @UseGuards(new GqlAuthGuard())
  public async contract(@Context() ctx: any): Promise<string> {
    return this.companiesService.getContract(ctx.req.user.currentCompany);
  }

  @Query()
  @UseGuards(new GqlAuthGuard())
  public async representatives(@Context() ctx: any): Promise<any> {
    return this.companiesService.getRepresentatives(ctx.req.user.currentCompany);
  }

  @Query()
  @UseGuards(new GqlAuthGuard())
  public async companyWithComplementaryInfos(@Args('siren') siren: string): Promise<IComplementaryInfos> {
    return this.companiesService.getCompanyComplementaryInfos(siren);
  }

  @ResolveProperty()
  public async status(@Context() ctx: any, @Parent() company: Company): Promise<CompanyStatus> {
    return this.companiesService.getStatus(ctx.req.user, company);
  }

  @ResolveProperty()
  public async addresses(@Parent() company: Company, @Args('orderBy') orderBy?: string, @Args('limit') limit?: number, @Args('offset') offset?: number): Promise<any> {
    if (!company.id) {
      return company.addresses;
    }

    const total: number = await this.addressesService.countByCompany(company);
    const addresses: Address[] = await this.addressesService.findByCompany(company, orderBy, limit, offset);

    return {
      total,
      rows: addresses,
    };
  }

  @ResolveProperty()
  public async contacts(@Context() ctx: any, @Parent() company: Company, @Args('orderBy') orderBy?: string, @Args('limit') limit?: number, @Args('offset') offset?: number): Promise<List> {
    return this.contactsService.findByCompany(ctx.req.user, company, orderBy, limit, offset);
  }

  @ResolveProperty()
  public async invoicesSent(@Context() ctx: any, @Parent() company: Company): Promise<number> {
    return this.invoicesService.invoicesSent(ctx.req.user.currentCompany, company);
  }

  @ResolveProperty()
  public async invoicesReceived(@Context() ctx: any, @Parent() company: Company): Promise<number> {
    return this.invoicesService.invoicesReceived(ctx.req.user.currentCompany, company);
  }

  @ResolveProperty()
  public async ibans(@Parent() company: Company): Promise<List> {
    return this.ibansService.findByCompany(company);
  }
}
