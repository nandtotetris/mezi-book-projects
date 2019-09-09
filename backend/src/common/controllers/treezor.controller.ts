import { Repository } from 'typeorm';
import { Controller, Res, HttpStatus, Body, Post, HttpException, UsePipes, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentsService } from '../services/payments.service';
import { Company, CompanyKycStatus } from '../entities/company.entity';
import { Webhook } from '../entities/webhook.entity';
import { TreezorService } from '../../payment/treezor.service';
import { BankAccountService } from '../services/bank-account.service';
import { Payin, PayinStatus } from '../entities/payin.entity';
import { ZendeskService } from '../../notification/zendesk.service';
import { ZendeskTicketType, ZendesTicketPriority } from '../../notification/interface/zendesk-ticket.interface';
import { TreezorSignatureValidationPipe, CamelCaseifyPayloadPipe, SaveTreezorWebhookPipe } from '../../payment/pipe/treezor.pipe';
import { TREEZOR_CONSTANTS } from '../../payment/treezor.constants';
import { TreezorPayoutWorkflow } from '../workflow/treezor-payout.workflow';
import { IPayout } from '../../payment/interfaces/treezor/payout.interface';

// TODO: Refacto and Typing
@Controller('api/v1/treezor')
export class TreezorController {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(Payin)
    private readonly payinRepository: Repository<Payin>,
    private readonly paymentsService: PaymentsService,
    private readonly bankAccountService: BankAccountService,
    private readonly treezorService: TreezorService,
    private readonly zendeskService: ZendeskService,
    private readonly treezorPayoutWorkflow: TreezorPayoutWorkflow
  ) {}

  @Post('webhook')
  @UsePipes(CamelCaseifyPayloadPipe, SaveTreezorWebhookPipe, TreezorSignatureValidationPipe)
  public async webhook(@Res() res: any, @Body() webhook: Webhook) {
    if (webhook.object === TREEZOR_CONSTANTS.WEBHOOK_TYPE_PAYOUT) {
      const payouts: IPayout[] = webhook.objectPayload.payouts;
      try {
        await Promise.all(payouts.map(this.treezorPayoutWorkflow.handlePayout));
      } catch (err) {
        throw new BadRequestException(`The payouts related to objectId: ${webhook.objectId} were not handled correctly`, err.message);
      }
    }

    if (webhook.object === TREEZOR_CONSTANTS.WEBHOOK_TYPE_USER) {
      const { users } = webhook.objectPayload;

      await Promise.all(users.map(async (user: any) => {
        if (user.userTypeId !== TREEZOR_CONSTANTS.BUSINESS_ENTITY_TYPE_ID) {
          return;
        }

        // Get the company associated with the user
        const company: Company = await this.companyRepository.findOne({ where: { treezorUserId: user.userId }, relations: ['claimer'] });
        if (!company) {
          return;
        }

        // The company is freezed by Treezor
        if (user.isFreezed === TREEZOR_CONSTANTS.ACCOUNT_FROZEN && company.isFreezed === false) {
          company.isFreezed = true;
          await company.save();

          await this.zendeskService.createTicket({
            type: ZendeskTicketType.INCIDENT,
            priority: ZendesTicketPriority.HIGH,
            requester: { name: company.claimer.fullName, email: company.claimer.email },
            subject: 'Blocage compagnie',
            comment: { body: `La compagnie ${company.name || company.brandName } a été gelée par Treezor. \n "CompagnieID ": (${company.id})` },
          });
        }

        // The company is unfreezed by Treezor
        if (user.isFreezed === TREEZOR_CONSTANTS.ACCOUNT_UNFROZEN && company.isFreezed === true) {
          company.isFreezed = false;
          await company.save();

          await this.zendeskService.createTicket({
            type: ZendeskTicketType.INCIDENT,
            priority: ZendesTicketPriority.HIGH,
            requester: { name: company.claimer.fullName, email: company.claimer.email },
            subject: 'Déblocage compagnie',
            comment: { body: `La compagnie ${company.name || company.brandName } a été dégelée par Treezor \n "CompagnieID ": (${company.id})` },
          });
        }

        if (user.kycReview === TREEZOR_CONSTANTS.USER_KYC_STATUS_CANCELED) { // KYC REFUSED
          company.kycStatus = CompanyKycStatus.REFUSED;
          company.treezorKycLevel = user.kycLevel;
          company.kycComment = user.kycReviewComment;
          await company.save();

          await this.zendeskService.createTicket({
            type: ZendeskTicketType.INCIDENT,
            priority: ZendesTicketPriority.HIGH,
            requester: { name: company.claimer.fullName, email: company.claimer.email },
            subject: 'KYC refusé',
            comment: { body: `Le KYC a été refusée pour l'entreprise ${company.name || company.brandName } et doit être investigué : \n"kycLevel": ${user.kycLevel},\n"kycReview": ${user.kycReview},\n"kycReviewComment": ${user.kycReviewComment}, \n "CompagnieID ": (${company.id})` },
          });
        } else if (user.kycReview === TREEZOR_CONSTANTS.USER_KYC_STATUS_VALIDATED) { // KYC VALIDATED
          company.kycStatus = CompanyKycStatus.VALIDATED;
          company.treezorKycLevel = user.kycLevel;
          company.kycComment = user.kycReviewComment;
          await company.save();
        }
      }));
    }

    if (webhook.object === TREEZOR_CONSTANTS.WEBHOOK_TYPE_PAYIN) {
      const { payins } = webhook.objectPayload;

      payins.forEach(async (treezorPayin: any) => {
        // Payin SDDE
        if (treezorPayin.paymentMethodId === TREEZOR_CONSTANTS.PAYIN_METHOD_SEPA_DIRECT_DEBIT_CORE) {
          const payin: Payin = await this.payinRepository.findOne({ treezorPayinId: treezorPayin.payinId });
          if (payin) {
            if (webhook.object === 'payin.create') {
              payin.treezorValidationAt = new Date();
            } else if (webhook.object === 'payin.update') {
              payin.treezorFundReceptionAt = new Date();
            }

            if (treezorPayin.payinStatus === TREEZOR_CONSTANTS.PAYIN_STATUS_VALIDATED) {
              payin.status = PayinStatus.VALIDATED;
            } else if (treezorPayin.payinStatus === TREEZOR_CONSTANTS.PAYIN_STATUS_CANCELED) {
              payin.status = PayinStatus.CANCELLED;
            }

            await payin.save();
          }
        }

        // Get the company associated with the payin
        const company = await this.companyRepository.findOne({ where: { treezorUserId: treezorPayin.userId }, relations: ['claimer'] });
        if (!company) {
          return;
        }

        // Payin cancelled
        if (treezorPayin.payinStatus === TREEZOR_CONSTANTS.PAYIN_STATUS_CANCELED) {
          company.sddeRefusedCount = company.sddeRefusedCount + 1;
          await company.save();
          if (company.sddeRefusedCount >= 2) {
            await this.zendeskService.createTicket({
              type: ZendeskTicketType.INCIDENT,
              priority: ZendesTicketPriority.NORMAL,
              requester: { name: company.claimer.fullName, email: company.claimer.email },
              subject: 'Blocage prélèvement automatique',
              comment: { body: `Le mode autoprélèvement est bloqué pour l'entreprise ${company.name || company.brandName } à la suite de 2 payins refusés` },
            });
          }
        }

        // Update Libeo balance
        await this.paymentsService.updateLibeoBalance(company);

        // Payin of type bank transfer
        if (treezorPayin.paymentMethodId === TREEZOR_CONSTANTS.PAYIN_METHOD_BANK_TRANSFER) {
          const { users } = await this.treezorService.getBeneficiaries({
            userTypeId: 1,
            userStatus: 'VALIDATED',
            parentUserId: company.treezorUserId,
          });

          // Search a beneficiary of type US
          const found = users.find((user: any) => {
            return user.country === 'US' || user.birthCountry === 'US' || user.nationality === 'US';
          });

          // Sending the KYC review request
          if (!found && !company.kycStatus) {
            try {
              await this.treezorService.kycReview({ userId: treezorPayin.userId });
              company.kycStatus = CompanyKycStatus.PENDING;
              await company.save();

              // Create bank account with iban
              if (treezorPayin.DbtrIBAN) {
                await this.bankAccountService.createOrUpdateBankAccount(company, null, { label: 'Compte auto' , iban: treezorPayin.DbtrIBAN });
              }
            } catch (err) {
              throw new HttpException(err.message, err.statusCode);
            }
          }
        }
      });
    }

    res.status(HttpStatus.OK).json(webhook);
  }
}
