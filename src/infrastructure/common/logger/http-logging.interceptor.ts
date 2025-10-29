import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { StructuredLogger } from './structured-logger';
import { maskIdentifier } from './mask.util';

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: StructuredLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();
    const response = httpContext.getResponse();

    const { method, url } = request;
    const rawRequestId = request.headers['x-request-id'];
    const requestId = Array.isArray(rawRequestId) ? rawRequestId[0] : rawRequestId || randomUUID();
    const startedAt = Date.now();
    const maskedUserId = maskIdentifier(request.user?.userId);

    this.logger.log({
      message: 'http_request_received',
      context: 'HTTP',
      details: {
        requestId,
        method,
        url,
        userId: maskedUserId,
      },
    });

    return next.handle().pipe(
      tap(() => {
        this.logger.log({
          message: 'http_request_completed',
          context: 'HTTP',
          details: {
            requestId,
            method,
            url,
            statusCode: response.statusCode,
            durationMs: Date.now() - startedAt,
          },
        });
      }),
      catchError(err => {
        this.logger.error(
          {
            message: 'http_request_failed',
            context: 'HTTP',
            details: {
              requestId,
            method,
            url,
            statusCode: response.statusCode ?? 500,
            durationMs: Date.now() - startedAt,
            userId: maskedUserId,
          },
        },
          err instanceof Error ? err.stack : undefined,
        );
        return throwError(() => err);
      }),
    );
  }
}
