import { Module } from '@nestjs/common';
import { TreezorAPI } from './treezor.api';
import { TreezorService } from './treezor.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Webhook } from '../common/entities/webhook.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Webhook])],
  providers: [
    TreezorAPI,
    TreezorService
  ],
  exports: [TreezorService, TreezorAPI]
})
export class PaymentModule {}