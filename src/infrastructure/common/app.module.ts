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
        const databaseUrl = cfg.get<string>('DATABASE_URL');
        const synchronize = cfg.get<string>('DB_SYNCHRONIZE');
        const logging = cfg.get<string>('DB_LOGGING');
        const shouldSync = synchronize ? synchronize === 'true' : true;
        const shouldLog = logging === 'true';

        if (databaseUrl) {
          const ssl = cfg.get<string>('DB_SSL');
          return {
            type: 'postgres',
            url: databaseUrl,
            entities: [TransactionOrmEntity],
            synchronize: shouldSync,
            logging: shouldLog,
            ssl: ssl === 'true' ? { rejectUnauthorized: false } : false,
          } as any;
        }

        return {
          type: 'sqlite',
          database: cfg.get<string>('DB_DATABASE') || './var/dev.sqlite',
          entities: [TransactionOrmEntity],
          synchronize: shouldSync,
          logging: shouldLog,
        } as any;
      },
    }),
    AuthModule,
    RechargesModule,
  ],
})
export class AppModule {}
