import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RechargesController } from './recharges.controller';
import { TransactionOrmEntity } from './transaction.orm-entity';
import { TypeOrmTransactionRepository } from './transaction.typeorm.repository';
import { BuyRechargeUseCase } from '../../application/use-cases/buy-recharge.usecase';
import { GetHistoryUseCase } from '../../application/use-cases/get-history.usecase';
import { EventBusService } from '../common/event-bus.service';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionOrmEntity])],
  controllers: [RechargesController],
  providers: [
    BuyRechargeUseCase,
    GetHistoryUseCase,
    EventBusService,
    { provide: 'ITransactionRepository', useClass: TypeOrmTransactionRepository },
  ],
})
export class RechargesModule {}
