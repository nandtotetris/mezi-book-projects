import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Contact } from './contact.entity';
import { encrypt } from '../value-transformer/encrypt.value-transformer';
import { lowercase } from '../value-transformer/lowercase.value-transformer';

@Entity()
export class Email extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ transformer: [lowercase, encrypt], length: 80 })
  email: string;

  @Column({ nullable: true })
  visibleOnlyCompany: string;

  @ManyToOne(type => Contact, contact => contact.emails)
  contact: Contact;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
