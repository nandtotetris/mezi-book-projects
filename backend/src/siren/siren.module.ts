import { Module, Logger } from '@nestjs/common';
import { SirenService } from './siren.service';
import { SirenStrategy } from './strategies/siren.strategy';
import { TreezorStrategy } from './strategies/treezor.strategy';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [PaymentModule],
  providers: [SirenStrategy, TreezorStrategy, SirenService, Logger],
  exports: [SirenService]
})
export class SirenModule {}
