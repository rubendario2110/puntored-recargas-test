export class Transaction {
  constructor(
    public readonly id: string,
    public readonly phoneNumber: string,
    public readonly amount: number,
    public readonly userId: string,
    public readonly createdAt: Date,
  ) {}
}
