import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ITransactionRepository } from '../../domain/repositories/transaction.repository';
import { Transaction } from '../../domain/entities/transaction';
import { TransactionOrmEntity } from './transaction.orm-entity';
import { StructuredLogger } from '../common/logger/structured-logger';
import { maskIdentifier } from '../common/logger/mask.util';

@Injectable()
export class TypeOrmTransactionRepository implements ITransactionRepository {
  constructor(
    @InjectRepository(TransactionOrmEntity)
    private readonly repo: Repository<TransactionOrmEntity>,
    private readonly logger: StructuredLogger,
  ) {}

  async save(tx: Transaction): Promise<void> {
    this.logger.log({
      message: 'transaction_persist_started',
      context: 'TypeOrmTransactionRepository',
      details: {
        transactionId: tx.id,
        userId: maskIdentifier(tx.userId),
        amount: tx.amount,
      },
    });
    await this.repo.save({
      id: tx.id,
      phoneNumber: tx.phoneNumber,
      amount: tx.amount,
      userId: tx.userId,
      createdAt: tx.createdAt,
    });
    this.logger.log({
      message: 'transaction_persist_completed',
      context: 'TypeOrmTransactionRepository',
      details: {
        transactionId: tx.id,
      },
    });
  }

  async findByUser(userId: string): Promise<Transaction[]> {
    this.logger.log({
      message: 'transaction_history_query',
      context: 'TypeOrmTransactionRepository',
      details: { userId: maskIdentifier(userId) },
    });
    const list = await this.repo.find({ where: { userId }, order: { createdAt: 'DESC' } });
    return list.map(e => new Transaction(e.id, e.phoneNumber, e.amount, e.userId, e.createdAt));
  }
}
