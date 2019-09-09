import { Module, Logger } from '@nestjs/common';
import { DateScalar } from './scalars/date.scalar';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Partner } from './entities/partner.entity';
import { Company } from './entities/company.entity';
import { User } from './entities/user.entity';
import { PartnersService } from './services/partners.service';
import { PartnersResolvers } from './resolvers/partners.resolvers';
import { CompaniesService } from './services/companies.service';
import { UsersService } from './services/users.service';
import { Email } from './entities/email.entity';
import { Contact } from './entities/contact.entity';
import { ContactsService } from './services/contacts.service';
import { AddressesService } from './services/addresses.service';
import { EmailsService } from './services/emails.service';
import { Address } from './entities/address.entity';
import { CompaniesResolvers } from './resolvers/companies.resolvers';
import { UsersResolvers } from './resolvers/users.resolvers';
import { AddressesResolvers } from './resolvers/addresses.resolvers';
import { ContactsResolvers } from './resolvers/contacts.resolvers';
import { EmailsResolvers } from './resolvers/emails.resolvers';
import { InvoicesResolvers } from './resolvers/invoices.resolvers';
import { InvoicesService } from './services/invoices.service';
import { Invoice } from './entities/invoice.entity';
import { HistoriesService } from './services/histories.service';
import { History } from './entities/history.entity';
import { TransactionsService } from './services/transactions.service';
import { TransactionsResolver } from './resolvers/transactions.resolvers';
import { BalancesService } from './services/balances.service';
import { BalancesResolver } from './resolvers/balances.resolvers';
import { BeneficiariesResolvers } from './resolvers/beneficiaries.resolvers';
import { Payment } from './entities/payment.entity';
import { Iban } from './entities/iban.entity';
import { PaymentsService } from './services/payments.service';
import { IbansService } from './services/ibans.service';
import { PaymentsResolvers } from './resolvers/payments.resolvers';
import { TokenGeneratorService } from './services/token-generator.service';
import { PaymentRepository } from './repositories/payment.repository';
import { Webhook } from './entities/webhook.entity';
import { WebhooksService } from './services/webhooks.service';
import { TreezorController } from './controllers/treezor.controller';
import { PaymentNotification } from './entities/payment-notification.entity';
import { AccountingPreferencesResolvers } from './resolvers/accounting-preferences.resolvers';
import { AccountingPreferencesService } from './services/accounting-preferences.service';
import { AccountingPreference } from './entities/accounting-preference.entity';
import { ExportsService } from './services/exports.service';
import { AccountingEntryRepository } from './repositories/accounting-entry.repository';
import { Export } from './entities/export.entity';
import { AccountingEntry } from './entities/accounting-entry.entity';
import { ExportsResolvers } from './resolvers/exports.resolvers';
import { IbansResolvers } from './resolvers/ibans.resolvers';
import { BankAccountResolver } from './resolvers/bank-accounts.resolvers';
import { BankAccountService } from './services/bank-account.service';
import { BankAccount } from './entities/bank-account.entity';
import { Mandate } from './entities/mandate.entity';
import { MandatesResolvers } from './resolvers/mandates.resolvers';
import { MandatesService } from './services/mandates.service';
import { MandateRepository } from './repositories/mandate.repository';
import { NotificationModule } from '../notification/notification.module';
import { SirenModule } from '../siren/siren.module';
import { PaymentModule } from '../payment/payment.module';
import { PaymentsWorkflow } from './workflow/payments.workflow';
import { PayinsService } from './services/payins.service';
import { Payin } from './entities/payin.entity';
import { StorageModule } from '../storage/storage.module';
import { TreezorPayoutWorkflow } from './workflow/treezor-payout.workflow';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Entity
      Partner,
      Company,
      User,
      Email,
      Address,
      Contact,
      Invoice,
      History,
      Payment,
      Iban,
      Webhook,
      AccountingPreference,
      PaymentNotification,
      Export,
      AccountingEntry,
      BankAccount,
      Mandate,
      Payin,
      // Repository
      PaymentRepository,
      AccountingEntryRepository,
      MandateRepository,
    ]),
    NotificationModule,
    SirenModule,
    PaymentModule,
    StorageModule,
  ],
  providers: [
    // ScalarType
    DateScalar,
    // Resolvers
    AddressesResolvers,
    BalancesResolver,
    CompaniesResolvers,
    ContactsResolvers,
    EmailsResolvers,
    InvoicesResolvers,
    PartnersResolvers,
    TransactionsResolver,
    UsersResolvers,
    BeneficiariesResolvers,
    PaymentsResolvers,
    AccountingPreferencesResolvers,
    ExportsResolvers,
    IbansResolvers,
    BankAccountResolver,
    MandatesResolvers,
    // Services
    AddressesService,
    BalancesService,
    CompaniesService,
    ContactsService,
    EmailsService,
    HistoriesService,
    InvoicesService,
    PartnersService,
    TransactionsService,
    UsersService,
    PaymentsService,
    IbansService,
    TokenGeneratorService,
    WebhooksService,
    AccountingPreferencesService,
    ExportsService,
    BankAccountService,
    MandatesService,
    PayinsService,
    Logger,
    PaymentsWorkflow,
    // Treezor webhoook handlers
    TreezorPayoutWorkflow
  ],
  controllers: [
    TreezorController,
  ],
})
export class CommonModule { }
