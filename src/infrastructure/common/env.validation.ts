import { plainToInstance } from 'class-transformer';
import { IsBooleanString, IsOptional, IsString, validateSync } from 'class-validator';

class EnvVars {
  @IsString() JWT_SECRET!: string;
  @IsString() @IsOptional() JWT_EXPIRES_IN?: string;

  @IsString() DB_TYPE!: 'sqlite' | 'postgres';
  @IsString() @IsOptional() DB_DATABASE?: string;
  @IsString() @IsOptional() DB_HOST?: string;
  @IsString() @IsOptional() DB_PORT?: any;
  @IsString() @IsOptional() DB_USERNAME?: string;
  @IsString() @IsOptional() DB_PASSWORD?: string;
  @IsBooleanString() @IsOptional() DB_SYNCHRONIZE?: string;
  @IsBooleanString() @IsOptional() DB_LOGGING?: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvVars, config, { enableImplicitConversion: true });
  const errors = validateSync(validatedConfig, { skipMissingProperties: false });
  if (errors.length) throw new Error(errors.toString());
  return validatedConfig;
}
