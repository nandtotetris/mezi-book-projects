import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { List } from '../interfaces/common.interface';
import { TreezorService } from '../../payment/treezor.service';
import { Company } from '../entities/company.entity';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly treezorService: TreezorService
  ) {}

  /**
   * Get all transactions by company
   */
  public async findByCompany(company: Company, limit?: number, page?: number): Promise<List> {
    if (!company || !company.treezorWalletId) {
      return {
        total: 0,
        rows: [],
      };
    }

    let transactions = [];

    try {
      const result = await this.treezorService.getTransactions({ walletId: company.treezorWalletId, pageNumber: page, pageCount: limit });
      transactions = result.transactions;
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.BAD_GATEWAY);
    }

    return {
      total: transactions.length,
      rows: transactions,
    };
  }
}
