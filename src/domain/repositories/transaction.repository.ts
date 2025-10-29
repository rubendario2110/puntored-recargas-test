import { Transaction } from '../entities/transaction';

export interface ITransactionRepository {
  save(tx: Transaction): Promise<void>;
  findByUser(userId: string): Promise<Transaction[]>;
}
