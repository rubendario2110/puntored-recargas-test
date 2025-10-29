import { GetHistoryUseCase } from '../../src/application/use-cases/get-history.usecase';
import { ITransactionRepository } from '../../src/domain/repositories/transaction.repository';
import { StructuredLogger } from '../../src/infrastructure/common/logger/structured-logger';
import { Transaction } from '../../src/domain/entities/transaction';

describe('GetHistoryUseCase', () => {
  const buildRepoMock = (history: Transaction[]) =>
    ({
      save: jest.fn<Promise<void>, [Transaction]>().mockResolvedValue(undefined),
      findByUser: jest.fn<Promise<Transaction[]>, [string]>().mockResolvedValue(history),
    } as jest.Mocked<ITransactionRepository>);

  const buildLoggerMock = () =>
    ({
      log: jest.fn(),
    } as unknown as StructuredLogger);

  it('consulta el historial del repositorio mockeado', async () => {
    const history: Transaction[] = [
      new Transaction('tx-1', '3101234567', 5000, 'user-1', new Date()),
      new Transaction('tx-2', '3109876543', 6000, 'user-1', new Date()),
    ];
    const repoMock = buildRepoMock(history);
    const loggerMock = buildLoggerMock();
    const usecase = new GetHistoryUseCase(repoMock, loggerMock);

    const result = await usecase.execute('user-1');

    expect(repoMock.findByUser).toHaveBeenCalledTimes(1);
    expect(repoMock.findByUser).toHaveBeenCalledWith('user-1');
    expect(result).toHaveLength(history.length);
  });
});
