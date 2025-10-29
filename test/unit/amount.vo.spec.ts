import { AmountVO } from '../../src/domain/value-objects/amount.vo';

describe('AmountVO', () => {
  it('acepta valores en rango', () => {
    expect(AmountVO.create(1000).value).toBe(1000);
    expect(AmountVO.create(100000).value).toBe(100000);
  });
  it('rechaza fuera de rango', () => {
    expect(() => AmountVO.create(999)).toThrow();
    expect(() => AmountVO.create(100001)).toThrow();
  });
});
