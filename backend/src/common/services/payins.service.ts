import { Payin } from '../entities/payin.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePayinPayload } from '../interfaces/payin.interface';
import { ITreezorPayin } from '../../payment/interfaces/treezor/payin.interface';

export class PayinsService {
  constructor(
    @InjectRepository(Payin)
    private readonly payinRepository: Repository<Payin>
  ) {}

  public async createPayin(data: CreatePayinPayload): Promise<Payin> {
    const payin: Payin = this.payinRepository.create(data);
    await this.payinRepository.save(payin);

    return payin;
  }

  public async hydratePayinWithTreezor(payin: Payin, treezorPayin: ITreezorPayin): Promise<void> {
    payin.treezorWalletId = treezorPayin.walletId;
    payin.treezorPayinId = treezorPayin.payinId;
    payin.treezorCreatedAt = new Date();
    payin.treezorResponse = treezorPayin.informationStatus;
    await payin.save();
  }

}
