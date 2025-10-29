import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'eventemitter3';
import { StructuredLogger } from './logger/structured-logger';
import { maskIdentifier } from './logger/mask.util';

@Injectable()
export class EventBusService {
  private readonly emitter = new EventEmitter();

  constructor(private readonly logger: StructuredLogger) {}

  publish<T extends { constructor: Function }>(event: T) {
    const eventName = (event.constructor as any).name;
    const summary: Record<string, unknown> = { eventName };
    if (event && typeof event === 'object') {
      const candidate = event as Record<string, unknown>;
      if ('transactionId' in candidate) summary.transactionId = candidate.transactionId;
      if ('userId' in candidate) summary.userId = maskIdentifier(candidate.userId as string);
    }
    this.logger.log({
      message: 'domain_event_published',
      context: 'EventBus',
      details: summary,
    });
    this.emitter.emit(eventName, event);
  }

  on<T>(eventName: string, handler: (e: T) => void) {
    this.logger.debug({
      message: 'domain_event_subscribed',
      context: 'EventBus',
      details: { eventName },
    });
    this.emitter.on(eventName, handler as any);
  }
}
