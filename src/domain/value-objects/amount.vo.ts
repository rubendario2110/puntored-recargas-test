export class AmountVO {
  private constructor(public readonly value: number) {}

  static create(value: number): AmountVO {
    if (!Number.isFinite(value)) throw new Error('Monto inválido');
    if (value < 1000 || value > 100000) throw new Error('Monto fuera de rango (1000..100000)');
    return new AmountVO(Math.trunc(value));
  }
}
