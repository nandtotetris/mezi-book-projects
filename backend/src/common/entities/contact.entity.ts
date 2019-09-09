import { BaseEntity, Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Company } from './company.entity';
import { Email } from './email.entity';
import { encrypt } from '../value-transformer/encrypt.value-transformer';

@Entity()
export class Contact extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ transformer: encrypt, nullable: true, length: 50 })
  firstname: string;

  @Column({ transformer: encrypt, nullable: true, length: 50 })
  lastname: string;

  // Virutal field
  get fullName(): string {
    return `${this.firstname} ${this.lastname}`;
  }

  @ManyToOne(type => User, user => user.contacts, { eager: true })
  user: User;

  @ManyToOne(type => Company, company => company.contacts, { eager: true })
  company: Company;

  @OneToMany(type => Email, email => email.contact, { cascade: true })
  emails: Email[];

  @Column({ nullable: true })
  visibleOnlyCompany: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
