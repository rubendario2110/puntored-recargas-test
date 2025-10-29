import { Injectable } from '@nestjs/common';
import { StructuredLogger } from '../common/logger/structured-logger';
import { maskIdentifier } from '../common/logger/mask.util';

@Injectable()
export class HardcodedUserService {
  private readonly users = [{ id: 'testuser', username: 'testuser', password: 'password123' }];

  constructor(private readonly logger: StructuredLogger) {}

  async validate(username: string, password: string) {
    const u = this.users.find(x => x.username === username && x.password === password);
    if (u) {
      this.logger.log({
        message: 'user_authenticated',
        context: 'HardcodedUserService',
        details: { userId: maskIdentifier(u.id), username: maskIdentifier(username) },
      });
      return { id: u.id, username: u.username };
    }
    this.logger.warn({
      message: 'user_auth_failed',
      context: 'HardcodedUserService',
      details: { username: maskIdentifier(username) },
    });
    return null;
  }
}
