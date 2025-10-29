import { PhoneNumberVO } from '../../src/domain/value-objects/phone-number.vo';

describe('PhoneNumberVO', () => {
  it('acepta números válidos', () => {
    expect(PhoneNumberVO.create('3001234567').value).toBe('3001234567');
  });
  it('rechaza inválidos', () => {
    expect(() => PhoneNumberVO.create('2001234567')).toThrow();
    expect(() => PhoneNumberVO.create('3abc234567')).toThrow();
    expect(() => PhoneNumberVO.create('31234567')).toThrow();
  });
});
