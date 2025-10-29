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
        const type = (cfg.get<'sqlite' | 'postgres'>('DB_TYPE', 'sqlite'));
        if (type === 'sqlite') {
          return {
            type: 'sqlite',
            database: cfg.get<string>('DB_DATABASE') || './var/dev.sqlite',
            entities: [TransactionOrmEntity],
            synchronize: (cfg.get<string>('DB_SYNCHRONIZE') === 'true') || true,
            logging: (cfg.get<string>('DB_LOGGING') === 'true') || false,
          } as any;
        }
        return {
          type: 'postgres',
          host: cfg.get<string>('DB_HOST'),
          port: Number(cfg.get<string>('DB_PORT')) || 5432,
          username: cfg.get<string>('DB_USERNAME'),
          password: cfg.get<string>('DB_PASSWORD'),
          database: cfg.get<string>('DB_DATABASE'),
          entities: [TransactionOrmEntity],
          synchronize: (cfg.get<string>('DB_SYNCHRONIZE') === 'true'),
          logging: (cfg.get<string>('DB_LOGGING') === 'true'),
        } as any;
      },
    }),
    AuthModule,
    RechargesModule,
  ],
})
export class AppModule {}
