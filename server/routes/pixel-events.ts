import { Router } from 'express';
import { db } from '../db';
import { pixelEvents } from '../../shared/schema';
import { pixelEventSchema } from '../validation/pixels';
import { eq, desc, and } from 'drizzle-orm';

const router = Router();

let eventQueue: any[] = [];
let flushTimer: NodeJS.Timeout | null = null;

const FLUSH_INTERVAL = 5000;
const MAX_QUEUE_SIZE = 100;

async function flushEventQueue() {
  if (eventQueue.length === 0) return;
  
  const eventsToFlush = [...eventQueue];
  eventQueue = [];
  
  try {
    if (eventsToFlush.length === 1) {
      await db.insert(pixelEvents).values(eventsToFlush[0]);
    } else {
      await db.insert(pixelEvents).values(eventsToFlush);
    }
    console.log(`✅ Flushed ${eventsToFlush.length} pixel events to database`);
  } catch (error) {
    console.error('❌ Error flushing pixel events:', error);
    eventQueue.unshift(...eventsToFlush);
  }
}

function scheduleFlush() {
  if (flushTimer) {
    clearTimeout(flushTimer);
  }
  flushTimer = setTimeout(flushEventQueue, FLUSH_INTERVAL);
}

router.post('/', async (req, res) => {
  try {
    const events = Array.isArray(req.body) ? req.body : [req.body];
    
    const validatedEvents = events.map(event => pixelEventSchema.parse(event));
    
    const dbEvents = validatedEvents.map(event => ({
      pixelId: event.pixel_id,
      eventType: event.event_type,
      eventValue: event.event_value?.toString(),
      currency: event.currency,
      productId: event.product_id,
      orderId: event.order_id,
      userId: event.user_id,
      sessionId: event.session_id,
      metadata: event.metadata || {},
    }));
    
    eventQueue.push(...dbEvents);
    
    if (eventQueue.length >= MAX_QUEUE_SIZE) {
      await flushEventQueue();
    } else {
      scheduleFlush();
    }
    
    res.status(202).json({ 
      message: 'Events queued for processing',
      queued: dbEvents.length,
      queue_size: eventQueue.length
    });
  } catch (error: any) {
    console.error('Error queuing pixel events:', error);
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Invalid request data', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to queue events' });
    }
  }
});

router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;
    const pixelId = req.query.pixel_id as string;
    const eventType = req.query.event_type as string;
    
    let query = db.select().from(pixelEvents).$dynamic();
    
    const conditions = [];
    if (pixelId) {
      conditions.push(eq(pixelEvents.pixelId, pixelId));
    }
    if (eventType) {
      conditions.push(eq(pixelEvents.eventType, eventType));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const events = await query
      .orderBy(desc(pixelEvents.createdAt))
      .limit(limit)
      .offset(offset);
    
    res.json(events);
  } catch (error: any) {
    console.error('Error fetching pixel events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

export default router;
