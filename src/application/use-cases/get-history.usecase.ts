import { Inject, Injectable } from '@nestjs/common';
import { ITransactionRepository } from '../../domain/repositories/transaction.repository';
import { StructuredLogger } from '../../infrastructure/common/logger/structured-logger';
import { maskIdentifier } from '../../infrastructure/common/logger/mask.util';

@Injectable()
export class GetHistoryUseCase {
  constructor(
    @Inject('ITransactionRepository')
    private readonly repo: ITransactionRepository,
    private readonly logger: StructuredLogger,
  ) {}
  async execute(userId: string) {
    this.logger.log({
      message: 'get_history_started',
      context: 'GetHistoryUseCase',
      details: { userId: maskIdentifier(userId) },
    });
    const history = await this.repo.findByUser(userId);
    this.logger.log({
      message: 'get_history_completed',
      context: 'GetHistoryUseCase',
      details: { userId: maskIdentifier(userId), count: history.length },
    });
    return history;
  }
}
