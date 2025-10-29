import { randomUUID } from 'node:crypto';
import { Injectable, Inject } from '@nestjs/common';
import { Recharge } from '../../domain/entities/recharge';
import { ITransactionRepository } from '../../domain/repositories/transaction.repository';
import { Transaction } from '../../domain/entities/transaction';
import { RechargeSucceededEvent } from '../../domain/events/recharge-succeeded.event';
import { EventBusService } from '../../infrastructure/common/event-bus.service';
import { StructuredLogger } from '../../infrastructure/common/logger/structured-logger';
import { maskIdentifier } from '../../infrastructure/common/logger/mask.util';

@Injectable()
export class BuyRechargeUseCase {
  constructor(
    @Inject('ITransactionRepository')
    private readonly repo: ITransactionRepository,
    private readonly bus: EventBusService,
    private readonly logger: StructuredLogger,
  ) {}

  async execute(input: { amount: number; phoneNumber: string; userId: string }) {
    const maskedPhone = `${input.phoneNumber.slice(0, 3)}*****${input.phoneNumber.slice(-2)}`;
    this.logger.log({
      message: 'buy_recharge_started',
      context: 'BuyRechargeUseCase',
      details: {
        userId: maskIdentifier(input.userId),
        amount: input.amount,
        phoneNumber: maskedPhone,
      },
    });
    const rec = Recharge.create(input.phoneNumber, input.amount, input.userId);
    const id = randomUUID();
    const tx = new Transaction(id, rec.phone.value, rec.amount.value, rec.userId, new Date());
    await this.repo.save(tx);
    this.bus.publish(new RechargeSucceededEvent(tx.id, tx.userId, tx.phoneNumber, tx.amount));
    this.logger.log({
      message: 'buy_recharge_completed',
      context: 'BuyRechargeUseCase',
      details: {
        userId: maskIdentifier(input.userId),
        transactionId: tx.id,
        amount: tx.amount,
      },
    });
    return tx;
  }
}
