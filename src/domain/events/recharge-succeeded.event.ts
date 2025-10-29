export class RechargeSucceededEvent {
  constructor(
    public readonly transactionId: string,
    public readonly userId: string,
    public readonly phoneNumber: string,
    public readonly amount: number,
    public readonly occurredAt: Date = new Date(),
  ) {}
}
