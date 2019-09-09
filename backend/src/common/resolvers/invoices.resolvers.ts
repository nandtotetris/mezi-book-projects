import {
  Resolver,
  Args,
  Mutation,
  Context,
  Query,
  ResolveProperty,
  Parent,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Invoice, InvoiceStatus } from '../entities/invoice.entity';
import { InvoicesService } from '../services/invoices.service';
import { List } from '../interfaces/common.interface';
import { HistoriesService } from '../services/histories.service';
import { PaymentsService } from '../services/payments.service';
import { File } from '../interfaces/file.interface';

@Resolver('Invoice')
export class InvoicesResolvers {
  constructor(
    private readonly invoicesService: InvoicesService,
    private readonly paymentsService: PaymentsService,
    private readonly historiesService: HistoriesService,
  ) {}

  @Mutation()
  public async uploadRib(@Args('file') file: File, @Args('invoiceId') invoiceId: string): Promise<string> {
    return this.invoicesService.uploadRib(file, invoiceId);
  }

  @Mutation()
  @UseGuards(new GqlAuthGuard())
  public async createInvoice(
    @Context() ctx: any,
    @Args('input') input: any,
  ): Promise<Invoice> {
    return this.invoicesService.createInvoice(ctx.req.user, input);
  }

  @Mutation()
  @UseGuards(new GqlAuthGuard())
  public async createOrUpdateAR(
    @Context() ctx: any,
    @Args('id') id: string,
    @Args('input') input: any,
  ): Promise<Invoice> {
    return this.invoicesService.createOrUpdateAR(ctx.req.user, id, input);
  }

  @Mutation()
  @UseGuards(new GqlAuthGuard())
  public async updateInvoice(
    @Context() ctx: any,
    @Args('id') id: string,
    @Args('input') input: any,
  ): Promise<Invoice> {
    return this.invoicesService.updateInvoice(ctx.req.user, id, input);
  }

  @Mutation()
  @UseGuards(new GqlAuthGuard())

  public async updateInvoiceStatus(@Context() ctx: any, @Args('id') id: string, @Args('status') status: InvoiceStatus): Promise<Invoice[]> {
    return this.paymentsService.updateInvoiceStatus(id, status, ctx.req.user);
  }

  @Mutation()
  @UseGuards(new GqlAuthGuard())
  public async removeInvoice(
    @Context() ctx: any,
    @Args('id') id: string,
  ): Promise<Invoice> {
    return this.invoicesService.removeInvoice(ctx.req.user, id);
  }

  @Mutation()
  @UseGuards(new GqlAuthGuard())
  public async removeAll(@Args('input') input?: boolean): Promise<Boolean> {
    return this.invoicesService.removeAll();
  }

  @Mutation()
  @UseGuards(new GqlAuthGuard())
  public async generateCode(
    @Context() ctx: any,
    @Args('invoiceId') invoiceId: string,
  ): Promise<Invoice> {
    return this.invoicesService.generateCode(ctx.req.user, invoiceId);
  }

  @Query()
  @UseGuards(new GqlAuthGuard())
  public async invoices(
    @Context() ctx: any,
    @Args('filters') filters?: any,
    @Args('orderBy') orderBy?: string,
    @Args('limit') limit?: number,
    @Args('offset') offset?: number,
  ): Promise<List> {
    return this.invoicesService.findByCompany(
      ctx.req.user.currentCompany,
      filters,
      orderBy,
      limit,
      offset,
    );
  }

  @Query()
  @UseGuards(new GqlAuthGuard())
  public async emittedInvoices(
    @Context() ctx: any,
    @Args('filters') filters?: any,
    @Args('orderBy') orderBy?: string,
    @Args('limit') limit?: number,
    @Args('offset') offset?: number,
  ): Promise<List> {
    return this.invoicesService.findByEmitterCompany(
      ctx.req.user.currentCompany,
      filters,
      orderBy,
      limit,
      offset,
    );
  }

  @Query()
  @UseGuards(new GqlAuthGuard())
  public async invoice(
    @Context() ctx: any,
    @Args('id') id: string,
  ): Promise<Invoice> {
    return this.invoicesService.findOneByIdAndCurrentCompany(
      id,
      ctx.req.user.currentCompany,
    );
  }

  @Query()
  @UseGuards(new GqlAuthGuard())
  public async emittedInvoice(
    @Context() ctx: any,
    @Args('id') id: string,
  ): Promise<Invoice> {
    return this.invoicesService.findOneByIdAndEmitterCompany(
      id,
      ctx.req.user.currentCompany,
    );
  }

  @ResolveProperty()
  public async estimatedBalance(@Parent() invoice: Invoice): Promise<number | null> {
    return this.invoicesService.findEstimatedBalance(invoice);
  }

  @ResolveProperty()
  public async paymentAt(@Parent() invoice: Invoice): Promise<Date | null> {
    return this.invoicesService.findPaymentAt(invoice);
  }

  @ResolveProperty()
  public async history(@Parent() invoice: Invoice, @Args('orderBy') orderBy?: string, @Args('limit') limit?: number, @Args('offset') offset?: number): Promise<List> {
    return this.historiesService.findByInvoiceId(invoice.id, orderBy, limit, offset);
  }
}
