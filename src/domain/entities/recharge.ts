import { AmountVO } from '../value-objects/amount.vo';
import { PhoneNumberVO } from '../value-objects/phone-number.vo';

export class Recharge {
  private constructor(
    public readonly phone: PhoneNumberVO,
    public readonly amount: AmountVO,
    public readonly userId: string,
  ) {}

  static create(phone: string, amount: number, userId: string) {
    return new Recharge(PhoneNumberVO.create(phone), AmountVO.create(amount), userId);
  }
}
