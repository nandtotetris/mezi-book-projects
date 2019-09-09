import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Address } from '../entities/address.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from '../entities/company.entity';
import { CreateAddressDto } from '../dto/addresses.dto';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  /**
   * Create a address
   *
   * @param   {Company}           currentCompany  - Current company user
   * @param   {CreateAddressDto}  data            - Data of address
   *
   * @return  {Promise<Address>}                  - Returns created address
   */
  public async createOrUpdateAddress(currentCompany: Company, data: CreateAddressDto): Promise<Address> {
    let company: Company = currentCompany;
    if (data.companyId) {
      company = await this.companyRepository.findOne({ id: data.companyId });
      if (!company) {
        throw new HttpException('api.error.company.not_found', HttpStatus.NOT_FOUND);
      }

      delete data.companyId;
    }

    data.company = company;

    if (data.id) {
      const address: Address = await this.addressRepository.findOne({ id: data.id });
      if (!address) {
        throw new HttpException('api.error.address.not_found', HttpStatus.NOT_FOUND);
      }

      delete data.id;
      this.addressRepository.merge(address, data);
      return this.addressRepository.save(address);
    }

    return this.addressRepository.save(this.addressRepository.create(data));
  }

  /**
   * Remove a address by ID
   *
   * @param   {Company}           company  - Address's id
   * @param   {string}            id       - Address's id
   *
   * @return  {Promise<Address>}           - Returns removed address
   */
  public async removeAddress(company: Company, id: string): Promise<Address> {
    if (!company) {
      throw new HttpException('api.error.company.not_found', HttpStatus.NOT_FOUND);
    }

    const address: Address = await this.addressRepository.findOne({ id });
    if (!address) {
      throw new HttpException('api.error.address.not_found', HttpStatus.NOT_FOUND);
    }

    await this.addressRepository.remove(address);

    return address;
  }

  /**
   * Get addresses by company
   *
   * @param   {Company}             company  - The company belonging to the addresses
   * @param   {string}              orderBy  - The sort order of the addresses
   * @param   {number}              limit    - The number of addresses to be retrieved
   * @param   {number}              offset   - The start index for pagination
   *
   * @return  {Promise<Address[]>}           - Returns the addresses matching the criteria
   */
  public async findByCompany(company: Company, orderBy?: string, limit?: number, offset?: number): Promise<Address[]> {
    return this.addressRepository.find({
      where: { company },
      skip: offset,
      take: limit,
    });
  }

  /**
   * Get numbers of addresses from a company
   *
   * @param   {Company}          company  - The company belonging to the addresses
   *
   * @return  {Promise<number>}           - Returns the numbers of addresses
   */
  public async countByCompany(company: Company): Promise<number> {
    return this.addressRepository.count({ company });
  }
}
