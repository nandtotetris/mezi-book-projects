import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Company } from './company.entity';
import { IsInt, Length } from 'class-validator';

@Entity()
export class Address extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Length(14)
  @Column({ nullable: true, length: 14 })
  siret: string;

  @Column({ nullable: true })
  address1: string;

  @Column({ nullable: true })
  address2: string;

  @IsInt()
  @Column({ nullable: true })
  zipcode: number;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  country: string;

  @ManyToOne(type => Company, company => company.addresses)
  company: Company;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
