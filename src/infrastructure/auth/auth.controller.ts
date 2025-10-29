import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HardcodedUserService } from './hardcoded-user.service';
import { StructuredLogger } from '../common/logger/structured-logger';
import { maskIdentifier } from '../common/logger/mask.util';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly users: HardcodedUserService,
    private readonly jwt: JwtService,
    private readonly logger: StructuredLogger,
  ) {}

  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    this.logger.log({
      message: 'login_attempt',
      context: 'AuthController',
      details: { username: maskIdentifier(body.username) },
    });
    const user = await this.users.validate(body.username, body.password);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const payload = { sub: user.id, username: user.username };
    const access_token = await this.jwt.signAsync(payload);
    this.logger.log({
      message: 'login_success',
      context: 'AuthController',
      details: {
        userId: maskIdentifier(user.id),
        username: maskIdentifier(user.username),
      },
    });
    return { access_token };
  }
}
