import { BuyRechargeUseCase } from '../../src/application/use-cases/buy-recharge.usecase';
import { EventBusService } from '../../src/infrastructure/common/event-bus.service';
import { StructuredLogger } from '../../src/infrastructure/common/logger/structured-logger';

class InMemoryRepo {
  items: any[] = [];
  async save(tx: any) { this.items.push(tx); }
  async findByUser() { return this.items; }
}

describe('BuyRechargeUseCase', () => {
  it('guarda transacción válida y emite evento', async () => {
    const repo = new InMemoryRepo();
    const logger = new StructuredLogger();
    const bus = new EventBusService(logger);
    const usecase = new BuyRechargeUseCase(repo as any, bus, logger);
    const tx = await usecase.execute({ amount: 5000, phoneNumber: '3101234567', userId: 'testuser' });
    expect(tx.id).toBeDefined();
    expect(repo.items.length).toBe(1);
  });
});
