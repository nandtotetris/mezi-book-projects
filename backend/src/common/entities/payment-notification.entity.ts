import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, BaseEntity } from 'typeorm';
import { Invoice } from './invoice.entity';
import { Contact } from './contact.entity';
import { User } from './user.entity';
import { Email } from './email.entity';

@Entity()
export class PaymentNotification extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(type => Invoice)
  invoice: Invoice;

  @ManyToOne(type => Contact)
  contact: Contact;

  @ManyToOne(type => User)
  createdBy: User;

  @ManyToOne(type => Email)
  email: Email;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
