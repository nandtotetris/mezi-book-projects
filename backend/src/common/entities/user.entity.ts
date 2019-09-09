import { BaseEntity, Entity, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Column, BeforeInsert, BeforeUpdate } from 'typeorm';
import { Contact } from './contact.entity';
import { Company } from './company.entity';
import { encrypt } from '../value-transformer/encrypt.value-transformer';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ transformer: encrypt, unique: true })
  email: string;

  @Column({ transformer: encrypt })
  firstname: string;

  @Column({ transformer: encrypt })
  lastname: string;

  // Virtual field
  get fullName(): string {
    return `${this.firstname} ${this.lastname}`;
  }

  @Column()
  password: string;

  @Column({ default: false })
  enabled: boolean;

  @Column({ default: false })
  blocked: boolean;

  @Column({ nullable: true })
  emailConfirmationToken: string;

  @Column({ nullable: true })
  passwordConfirmationToken: string;

  // Virtual field
  token: string;

  @Column()
  lastCguAccept: Date = new Date();

  @Column()
  lastLogin: Date = new Date();

  // Mode eager
  @OneToOne(type => Company, { onDelete: 'SET NULL', eager: true })
  @JoinColumn()
  currentCompany: Company;

  @OneToMany(type => Contact, contact => contact.user)
  contacts: Contact[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  lowerCaseEmail() {
    this.email = this.email.toLocaleLowerCase();
  }
}
