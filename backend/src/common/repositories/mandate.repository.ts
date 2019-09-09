import { EntityRepository, Repository } from 'typeorm';
import { Mandate } from '../entities/mandate.entity';
import { Company } from '../entities/company.entity';

@EntityRepository(Mandate)
export class MandateRepository extends Repository<Mandate> {
  /**
   * Get a mandate with relationships
   *
   * @param   {string}            mandateId  - Mandate's id
   * @param   {Company}           company    - Current company user
   *
   * @return  {Promise<Mandate>}             - Returns found mandate
   */
  public findOneWithRelationships(mandateId: string, company: Company): Promise<Mandate> {
    return this.createQueryBuilder('m')
      .leftJoinAndSelect('m.bankAccount', 'b')
      .leftJoinAndSelect('b.iban', 'i')
      .leftJoinAndSelect('b.company', 'c')
      .where('m.id = :mandateId', { mandateId })
      .andWhere('b.company = :currentCompany', { currentCompany: company.id })
      .getOne();
  }
}
