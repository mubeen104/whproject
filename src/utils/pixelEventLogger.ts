/**
 * Pixel Event Logger
 * 
 * Logs all pixel tracking events to the server for analytics and debugging
 * Batches events for performance optimization
 */

import { logPixelEvents } from './pixelClient';

interface QueuedPixelEvent {
  pixel_id: string;
  event_type: string;
  event_value?: number;
  currency?: string;
  product_id?: string;
  order_id?: string;
  user_id?: string;
  session_id?: string;
  metadata?: Record<string, any>;
}

class PixelEventLogger {
  private eventQueue: QueuedPixelEvent[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private readonly BATCH_SIZE = 50;
  private readonly FLUSH_INTERVAL = 10000; // 10 seconds
  private sessionId: string;

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.setupAutoFlush();
  }

  private getOrCreateSessionId(): string {
    if (typeof window === 'undefined') return 'server-session';
    
    const key = 'pixel_session_id';
    let sessionId = sessionStorage.getItem(key);
    
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      try {
        sessionStorage.setItem(key, sessionId);
      } catch (error) {
        console.warn('Failed to store session ID:', error);
      }
    }
    
    return sessionId;
  }

  private setupAutoFlush() {
    if (typeof window === 'undefined') return;
    
    window.addEventListener('beforeunload', () => {
      this.flush();
    });
  }

  /**
   * Queue a pixel event for logging
   */
  async logEvent(event: QueuedPixelEvent) {
    this.eventQueue.push({
      ...event,
      session_id: this.sessionId,
    });

    // Flush if queue reaches batch size
    if (this.eventQueue.length >= this.BATCH_SIZE) {
      await this.flush();
    } else {
      this.scheduleFlush();
    }
  }

  /**
   * Schedule a flush if not already scheduled
   */
  private scheduleFlush() {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
    }

    this.flushTimer = setTimeout(() => {
      this.flush();
    }, this.FLUSH_INTERVAL);
  }

  /**
   * Flush all queued events to server
   */
  async flush() {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      await logPixelEvents(events);
      console.log(`✅ [PixelLogger] Flushed ${events.length} events`);
    } catch (error) {
      console.error('[PixelLogger] Failed to flush events:', error);
      // Re-queue failed events
      this.eventQueue.unshift(...events);
    }
  }

  /**
   * Get current queue size
   */
  getQueueSize(): number {
    return this.eventQueue.length;
  }
}

// Singleton instance
let logger: PixelEventLogger | null = null;

export function getPixelLogger(): PixelEventLogger {
  if (!logger) {
    logger = new PixelEventLogger();
  }
  return logger;
}

/**
 * Log a pixel event
 */
export async function logPixelEvent(event: QueuedPixelEvent) {
  try {
    const pixelLogger = getPixelLogger();
    await pixelLogger.logEvent(event);
  } catch (error) {
    console.warn('[PixelEventLogger] Failed to log event:', error);
  }
}
