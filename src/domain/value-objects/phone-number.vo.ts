export class PhoneNumberVO {
  private constructor(public readonly value: string) {}

  static create(value: string): PhoneNumberVO {
    if (!/^\d{10}$/.test(value)) throw new Error('Teléfono debe tener 10 dígitos');
    if (!value.startsWith('3')) throw new Error('Teléfono debe iniciar en 3');
    return new PhoneNumberVO(value);
  }
}
