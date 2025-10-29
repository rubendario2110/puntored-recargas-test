import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { validate } from './env.validation';
import { AuthModule } from '../auth/auth.module';
import { RechargesModule } from '../recharges/recharges.module';
import { TransactionOrmEntity } from '../recharges/transaction.orm-entity';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot({ isGlobal: true, validate }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        const synchronize = cfg.get<string>('DB_SYNCHRONIZE');
        const logging = cfg.get<string>('DB_LOGGING');
        return {
          type: 'sqlite',
          database: cfg.get<string>('DB_DATABASE') || './var/dev.sqlite',
          entities: [TransactionOrmEntity],
          synchronize: synchronize ? synchronize === 'true' : true,
          logging: logging === 'true',
        } as any;
      },
    }),
    AuthModule,
    RechargesModule,
  ],
})
export class AppModule {}
