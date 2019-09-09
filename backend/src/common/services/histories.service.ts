import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { History, HistoryEntity } from '../entities/history.entity';
import { CreateHistoryDto } from '../dto/histories.dto';
import { List } from '../interfaces/common.interface';

@Injectable()
export class HistoriesService {
  constructor(
    @InjectRepository(History)
    private readonly historyRepository: Repository<History>,
  ) {}

  /**
   * Log an event in history
   *
   * @param   {CreateHistoryDto}  data  - Data of history
   *
   * @return  {Promise<History>}        - Returns the created history
   */
  public async createHistory(data: CreateHistoryDto): Promise<History> {
    const history: History = this.historyRepository.create(data);
    return this.historyRepository.save(history);
  }

  /**
   * Get a history from a invoice
   *
   * @param   {string}         id       - Invoice's id
   * @param   {string}         orderBy  - Sort the request (optional)
   * @param   {number}         limit    - Number of returned companies (optional)
   * @param   {number}         offset   - Start of pagination (optional)
   *
   * @return  {Promise<List>}           - Returns a history
   *
   * TODO: Move to repository
   */
  public async findByInvoiceId(id: string, orderBy?: string, limit?: number, offset?: number): Promise<List> {
    const [ history, total ]: [ History[], number ] = await this.historyRepository.findAndCount({
      where: {
        entity: HistoryEntity.INVOICE,
        entityId: id,
      },
      order: {
        createdAt: 'DESC',
      },
      take: limit,
      skip: offset,
    });

    return {
      total,
      rows: history,
    };
  }
}
