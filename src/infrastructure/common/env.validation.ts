import { plainToInstance } from 'class-transformer';
import { IsBooleanString, IsNumberString, IsOptional, IsString, validateSync } from 'class-validator';

class EnvVars {
  @IsString() JWT_SECRET!: string;
  @IsString() @IsOptional() JWT_EXPIRES_IN?: string;

  @IsString() @IsOptional() DB_DATABASE?: string;
  @IsString() @IsOptional() DATABASE_URL?: string;
  @IsBooleanString() @IsOptional() DB_SYNCHRONIZE?: string;
  @IsBooleanString() @IsOptional() DB_LOGGING?: string;
  @IsBooleanString() @IsOptional() DB_SSL?: string;
  @IsNumberString() @IsOptional() PORT?: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvVars, config, { enableImplicitConversion: true });
  const errors = validateSync(validatedConfig, { skipMissingProperties: false });
  if (errors.length) throw new Error(errors.toString());
  return validatedConfig;
}
