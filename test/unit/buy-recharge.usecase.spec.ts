import { BuyRechargeUseCase } from '../../src/application/use-cases/buy-recharge.usecase';
import { EventBusService } from '../../src/infrastructure/common/event-bus.service';
import { StructuredLogger } from '../../src/infrastructure/common/logger/structured-logger';
import { ITransactionRepository } from '../../src/domain/repositories/transaction.repository';
import { RechargeSucceededEvent } from '../../src/domain/events/recharge-succeeded.event';
import { Transaction } from '../../src/domain/entities/transaction';

describe('BuyRechargeUseCase', () => {
  const buildRepoMock = () =>
    ({
      save: jest.fn<Promise<void>, [Transaction]>().mockResolvedValue(undefined),
      findByUser: jest.fn<Promise<Transaction[]>, [string]>(),
    } as jest.Mocked<ITransactionRepository>);

  const buildBusPublishMock = () => jest.fn();

  const buildUseCase = (repo: jest.Mocked<ITransactionRepository>, publishMock: jest.Mock) => {
    const logger = new StructuredLogger();
    const bus = new EventBusService(logger);
    jest.spyOn(bus, 'publish').mockImplementation(publishMock);
    return new BuyRechargeUseCase(repo, bus, logger);
  };

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('guarda transaccion valida y emite evento', async () => {
    const repoMock = buildRepoMock();
    const publishMock = buildBusPublishMock();
    const usecase = buildUseCase(repoMock, publishMock);

    const tx = await usecase.execute({ amount: 5000, phoneNumber: '3101234567', userId: 'testuser' });

    expect(tx.id).toBeDefined();
    expect(repoMock.save).toHaveBeenCalledTimes(1);
    expect(repoMock.save).toHaveBeenCalledWith(expect.objectContaining({ userId: 'testuser' }));
    expect(publishMock).toHaveBeenCalledTimes(1);
    expect(publishMock).toHaveBeenCalledWith(expect.any(RechargeSucceededEvent));
  });
});
