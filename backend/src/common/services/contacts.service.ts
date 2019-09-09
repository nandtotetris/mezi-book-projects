import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { List } from '../interfaces/common.interface';
import { CreateContactDto, UpdateContactDto } from '../dto/contacts.dto';
import { Contact } from '../entities/contact.entity';
import { Company } from '../entities/company.entity';
import { User } from '../entities/user.entity';
import { EmailsService } from './emails.service';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    private readonly emailsService: EmailsService,
  ) {}

  /**
   * Create contact for a company
   */
  async createContact(user: User, data: CreateContactDto): Promise<any> {
    // Create emails with relationship
    let emails = [];
    if (data.emails) {
      emails = data.emails.map(obj => {
        return {
          email: obj.email,
          visibleOnlyCompany: user.currentCompany.id,
          data,
        };
      });
    }

    const contact = this.contactRepository.create({
      firstname: data.firstname,
      lastname: data.lastname,
      emails,
    });

    if (data.companyId) {
      // Contact partner
      const company: Company = await this.companyRepository.findOne({ id: data.companyId });
      if (!company) {
        throw new HttpException('api.error.company.not_found', HttpStatus.BAD_REQUEST);
      }

      contact.visibleOnlyCompany = user.currentCompany.id;
      contact.company = company;
    } else {
      contact.user = user;
      contact.company = user.currentCompany;
    }

    await this.contactRepository.save(contact);

    return contact;
  }

  /**
   * Update a contact
   */
  public async updateContact(id: string, data: UpdateContactDto): Promise<Contact> {
    let contact: Contact = await this.contactRepository.findOne({ id });
    if (!contact) {
      throw new HttpException('api.error.contact.not_found', HttpStatus.BAD_REQUEST);
    }

    // Update or Create emails with relationship
    if (data.emails) {
      await data.emails.forEach(async obj => {
        const input = {
          email: obj.email,
          visibleOnlyCompany: contact.company.id,
          contact,
        };

        if (obj.id) {
          await this.emailsService.updateEmail(obj.id, input);
        } else {
          await this.emailsService.createEmail(input);
        }
      });
    }

    delete data.emails;
    contact = this.contactRepository.merge(contact, data);
    return this.contactRepository.save(contact);
  }

  /**
   * Get contacts by company
   */
  public async findByCompany(user: User, company: Company, orderBy?: string, limit?: number, offset?: number): Promise<List> {
    const [ contacts, total ]: [Contact[], number] = await this.contactRepository.findAndCount({
      where: {
        company,
        visibleOnlyCompany: (user && user.currentCompany) ? user.currentCompany.id : null,
      },
      take: limit,
      skip: offset,
    });

    return {
      total,
      rows: contacts,
    };
  }

  /**
   * Get contacts from company and contact's ids
   *
   * @param   {Company}             company             - Current company
   * @param   {string[]}            contactIds          - Array of contact's ids
   * @param   {Company}             visibleOnlyCompany  - Company (optional)
   *
   * @return  {Promise<Contact[]>}                      - Returns contacts belonging to the company and corresponding to the ids
   */
  public async findByCompanyAndIds(company: Company, contactIds: string[], visibleOnlyCompany?: Company): Promise<Contact[]> {
    if (!contactIds) {
      return [];
    }

    // TODO: Use visibilityOnlyCompany
    return this.contactRepository.find({ where: { id: In(contactIds), company }, relations: ['emails'] });
  }
}
