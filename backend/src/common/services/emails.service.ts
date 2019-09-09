import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from '../entities/contact.entity';
import { Email } from '../entities/email.entity';
import { List } from '../interfaces/common.interface';
import { CreateEmailDto, UpdateEmailDto } from '../dto/emails.dto';

@Injectable()
export class EmailsService {
  constructor(
    @InjectRepository(Email)
    private readonly emailRepository: Repository<Email>,
  ) {}

  /**
   * Create a email
   */
  public async createEmail(data: CreateEmailDto): Promise<Email> {
    const email: Email = this.emailRepository.create(data);
    return this.emailRepository.save(email);
  }

  /**
   * Create emails
   */
  public async createEmails(data: CreateEmailDto[]): Promise<Email[]> {
    const emails: Email[] = this.emailRepository.create(data);
    return this.emailRepository.save(emails);
  }

  /**
   * Update a email
   */
  public async updateEmail(id: string, data: UpdateEmailDto): Promise<Email> {
    let email: Email = await this.emailRepository.findOne({ id });
    email = this.emailRepository.merge(email, data);
    return this.emailRepository.save(email);
  }

  /**
   * Get emails by contact
   */
  public async findByContact(contact: Contact, orderBy?: string, limit?: number, offset?: number): Promise<List> {
    const result = await Promise.all([
      await this.emailRepository.count({ contact }),
      await this.emailRepository.find({ where: { contact }, skip: offset, take: limit }),
    ]);

    return {
      total: result[0],
      rows: result[1],
    };
  }
}
