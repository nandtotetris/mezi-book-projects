import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Partner } from '../entities/partner.entity';
import { Company, CompanyStatus } from '../entities/company.entity';
import { CompaniesService } from './companies.service';
import { User } from '../entities/user.entity';

@Injectable()
export class PartnersService {
  constructor(
    @InjectRepository(Partner)
    private readonly partnerRepository: Repository<Partner>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    private readonly companiesService: CompaniesService,
  ) {}

  /**
   * Create a partner
   */
  public async createPartner(user: User, data: Company): Promise<Company> {
    // Check and create company partner
    let companyPartner: Company = await this.companiesService.findOneBySiren(data.siren);
    if (!companyPartner) {
      companyPartner = await this.companyRepository.create(data);
      await this.companyRepository.save(companyPartner);
    }

    // Create a company empty if user does not company
    const companyInitiator: Company = await this.companiesService.getCurrentCompanyByUser(user);

    // Check and create relationship
    let relationship: Partner = await this.findOneByCompanyInitiatorIdAndCompanyPartnerId(companyInitiator.id, companyPartner.id);
    if (!relationship) {
      // TODO: Add name field
      relationship = this.partnerRepository.create({ companyInitiator, companyPartner });
      await this.partnerRepository.save(relationship);
    }

    companyPartner.status = CompanyStatus.ALREADY;

    return companyPartner;
  }

  /**
   * Get a single partner by companyInitiator and companyPartner
   */
  public async findOneByCompanyInitiatorIdAndCompanyPartnerId(companyInitiatorId: string, companyPartnerId: string): Promise<Partner> {
    return this.partnerRepository.findOne({ companyInitiator: { id: companyInitiatorId }, companyPartner: { id: companyPartnerId } });
  }

  /**
   * Get partners by company
   */
  public async findByCompany(company: Company, orderBy?: string, limit?: number, offset?: number): Promise<Company[]> {
    const partners: Partner[] = await this.partnerRepository.find({
      where: {
        companyInitiator: company,
      },
      relations: ['companyPartner'],
      skip: offset,
      take: limit,
    });

    return partners.map(partner => {
      return partner.companyPartner;
    });
  }

  /**
   * Get numbers of partners from a company
   */
  public async countByCompany(company: Company): Promise<number> {
    return this.partnerRepository.count({ companyInitiator: company });
  }

  /**
   * Get a single partner by ID
   */
  public async findOneById(id: string): Promise<Company> {
    return this.companyRepository.findOne({ id });
  }
}
