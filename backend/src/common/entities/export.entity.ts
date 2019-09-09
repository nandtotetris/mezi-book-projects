import { Base } from './base.entity';
import { Entity, ManyToOne, Column } from 'typeorm';
import { Company } from './company.entity';

@Entity()
export class Export extends Base {
  @ManyToOne(type => Company)
  company: Company;

  @Column()
  fileLink: string;

  @Column()
  enabled: boolean;
}
