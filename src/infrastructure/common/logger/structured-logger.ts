import { Injectable, LoggerService } from '@nestjs/common';

export interface StructuredLogEntry {
  message: string;
  context?: string;
  details?: Record<string, unknown>;
}

type LogInput = string | StructuredLogEntry | Error;

interface NormalizedLog {
  message: string;
  context?: string;
  details?: Record<string, unknown>;
}

@Injectable()
export class StructuredLogger implements LoggerService {
  log(message: LogInput, context?: string) {
    const entry = this.normalize(message, context);
    this.write('INFO', entry);
  }

  warn(message: LogInput, context?: string) {
    const entry = this.normalize(message, context);
    this.write('WARN', entry);
  }

  debug(message: LogInput, context?: string) {
    const entry = this.normalize(message, context);
    this.write('DEBUG', entry);
  }

  verbose(message: LogInput, context?: string) {
    const entry = this.normalize(message, context);
    this.write('VERBOSE', entry);
  }

  error(message: LogInput, trace?: string, context?: string) {
    const entry = this.normalize(message, context);
    const hasTrace = trace ?? (message instanceof Error ? message.stack : undefined);
    const hasName = message instanceof Error ? message.name : undefined;
    const details = this.mergeDetails(entry.details, {
      ...(hasTrace ? { stack: hasTrace } : {}),
      ...(hasName ? { errorName: hasName } : {}),
    });
    this.write('ERROR', { ...entry, details });
  }

  private normalize(message: LogInput, context?: string): NormalizedLog {
    if (message instanceof Error) {
      return {
        message: message.message,
        context,
        details: { errorName: message.name },
      };
    }

    if (typeof message === 'object' && message !== null) {
      const { message: msg, context: ctx, details, ...rest } = message as StructuredLogEntry & {
        message?: string;
        context?: string;
        details?: Record<string, unknown>;
      };

      if (msg) {
        const mergedDetails = this.mergeDetails(details, rest);
        return {
          message: msg,
          context: ctx ?? context,
          details: mergedDetails,
        };
      }

      return {
        message: JSON.stringify(message),
        context,
      };
    }

    return {
      message: String(message),
      context,
    };
  }

  private mergeDetails(
    ...sources: Array<Record<string, unknown> | undefined | null>
  ): Record<string, unknown> | undefined {
    const result: Record<string, unknown> = {};

    for (const source of sources) {
      if (!source) continue;
      for (const [key, value] of Object.entries(source)) {
        if (value === undefined) continue;
        result[key] = value;
      }
    }

    return Object.keys(result).length ? result : undefined;
  }

  private write(level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'VERBOSE', entry: NormalizedLog) {
    const payload: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      level,
      message: entry.message,
      context: entry.context ?? 'Application',
      details: entry.details ?? {},
    };

    const line = `${JSON.stringify(payload)}\n`;
    if (level === 'ERROR') {
      process.stderr.write(line);
    } else {
      process.stdout.write(line);
    }
  }
}
