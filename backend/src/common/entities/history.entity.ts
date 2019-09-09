import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { HistoryEvent } from '../dto/histories.dto';

export enum HistoryEntity {
  ADDRESS = 'ADDRESS',
  COMPANY = 'COMPANY',
  CONTACT = 'CONTACT',
  EMAIL   = 'EMAIL',
  INVOICE = 'INVOICE',
  PARTNER = 'PARTNER',
  USER    = 'USER',
  PAYMENT = 'PAYMENT',
}

@Entity()
export class History extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'simple-enum',
    enum: HistoryEntity,
    nullable: true,
  })
  entity: HistoryEntity;

  @Column({ nullable: true })
  entityId: string;

  @Column({ nullable: true })
  event: HistoryEvent;

  @Column({
    type: 'simple-json',
    nullable: true,
  })
  params: any;

  @ManyToOne(type => User, { nullable: true, eager: true })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
