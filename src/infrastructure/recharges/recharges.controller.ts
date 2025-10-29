import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { BuyRechargeUseCase } from '../../application/use-cases/buy-recharge.usecase';
import { GetHistoryUseCase } from '../../application/use-cases/get-history.usecase';
import { BuyRechargeRequestDTO } from '../../application/dto/buy-recharge.request.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { StructuredLogger } from '../common/logger/structured-logger';
import { maskIdentifier } from '../common/logger/mask.util';

@Controller('recharges')
@UseGuards(JwtAuthGuard)
export class RechargesController {
  constructor(
    private readonly buyRecharge: BuyRechargeUseCase,
    private readonly getHistory: GetHistoryUseCase,
    private readonly logger: StructuredLogger,
  ) {}

  @Post('buy')
  async buy(@Body() dto: BuyRechargeRequestDTO, @Req() req: any) {
    const userId = req.user.userId as string;
    const maskedPhone = `${dto.phoneNumber.slice(0, 3)}*****${dto.phoneNumber.slice(-2)}`;
    this.logger.log({
      message: 'controller_buy_request',
      context: 'RechargesController',
      details: { userId: maskIdentifier(userId), amount: dto.amount, phoneNumber: maskedPhone },
    });
    const tx = await this.buyRecharge.execute({ amount: dto.amount, phoneNumber: dto.phoneNumber, userId });
    return tx;
  }

  @Get('history')
  async history(@Req() req: any) {
    const userId = req.user.userId as string;
    this.logger.log({
      message: 'controller_history_request',
      context: 'RechargesController',
      details: { userId: maskIdentifier(userId) },
    });
    return this.getHistory.execute(userId);
  }
}
