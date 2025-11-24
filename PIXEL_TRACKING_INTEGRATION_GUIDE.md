# Pixel Tracking Integration Guide

## Quick Start - 5 Minutes

### 1. Add a Pixel in Admin Panel
```
Navigate to: Admin → Pixels
Click "Add Pixel"
Platform: Meta Pixel
Pixel ID: 123456789012345
Enable: ✓
Save
```

### 2. Verify Tracking is Working
```javascript
// Open browser console
console.log(window.dataLayer); // Google Tag Manager events
console.log(window.fbq.q); // Meta Pixel events

// Should see something like:
// [{eventName: "PageView", data: {...}}, ...]
```

### 3. Monitor Events in Admin
```
Admin → Analytics → Pixel Analytics
See real-time events and statistics
```

---

## Integration Points

### Frontend Tracking (Automatic)

The system automatically tracks these events with NO code changes needed:

| Event | Triggered | Example |
|-------|-----------|---------|
| **PageView** | Every page load | User navigates to `/shop` |
| **ViewContent** | Product page viewed | User opens product detail page |
| **AddToCart** | Item added to cart | User clicks "Add to Cart" button |
| **BeginCheckout** | Checkout page loaded | User proceeds to checkout |
| **Purchase** | Order completed | User completes purchase |
| **Search** | Search query submitted | User searches for "ginseng" |

### Manual Tracking (Optional)

For custom events, use the helper functions:

```typescript
import { 
  logProductView, 
  logAddToCart, 
  logPurchase, 
  logSearch,
  logCustomEvent 
} from '@/utils/pixelAnalyticsHelper';
import { useEnabledPixels } from '@/hooks/useAdvertisingPixelsNew';

function MyComponent() {
  const { data: pixels } = useEnabledPixels();
  
  const handleProductView = async (product) => {
    for (const pixel of pixels) {
      await logProductView(pixel.id, {
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category
      });
    }
  };
  
  return (
    <button onClick={() => handleProductView(product)}>
      View Product
    </button>
  );
}
```

---

## Event Data Fields

### ViewContent Event
```typescript
{
  id: "prod-123",           // Product ID
  name: "Ginseng Pills",    // Product name
  price: 29.99,             // Product price
  category: "Supplements",  // Product category
  brand: "New Era Herbals"  // Brand (auto-added)
}
```

### AddToCart Event
```typescript
{
  id: "prod-123",
  name: "Ginseng Pills",
  price: 29.99,
  quantity: 2,              // Quantity added
  category: "Supplements"
}
```

### Purchase Event
```typescript
{
  orderId: "order-123",
  items: [{                 // Array of items purchased
    id: "prod-123",
    name: "Ginseng Pills",
    quantity: 2,
    price: 29.99,
    category: "Supplements"
  }],
  total: 70.98,            // Total order amount
  discount: 5.00,          // Applied discount
  shipping: 5.99,          // Shipping cost
  tax: 3.50                // Tax amount
}
```

---

## Server API Integration

### Get All Pixels
```bash
curl http://localhost:5000/api/pixels
```

Response:
```json
[
  {
    "id": "pixel-uuid",
    "platform": "meta_pixel",
    "pixel_id": "123456789012345",
    "is_enabled": true,
    "created_at": "2025-11-24T...",
    "updated_at": "2025-11-24T..."
  }
]
```

### Create Pixel
```bash
curl -X POST http://localhost:5000/api/pixels \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "meta_pixel",
    "pixel_id": "123456789012345",
    "is_enabled": true
  }'
```

### Log Events
```bash
curl -X POST http://localhost:5000/api/pixel-events \
  -H "Content-Type: application/json" \
  -d '{
    "pixel_id": "pixel-uuid",
    "event_type": "page_view",
    "session_id": "session-123",
    "metadata": {
      "page": "/shop",
      "referrer": "organic"
    }
  }'
```

---

## Database Schema Reference

### advertising_pixels Table
Stores all configured advertising pixels

**Columns:**
- `id` (UUID) - Primary key
- `platform` - Type of pixel (google_ads, meta_pixel, tiktok_pixel)
- `pixel_id` - Unique pixel identifier
- `is_enabled` - Whether pixel is active
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### pixel_events Table
Logs all tracked events

**Columns:**
- `id` (UUID) - Primary key
- `pixel_id` (UUID) - Foreign key to advertising_pixels
- `event_type` - Type of event (page_view, view_item, add_to_cart, etc.)
- `event_value` - Monetary value (for purchases, etc.)
- `currency` - Currency code (USD, PKR, etc.)
- `product_id` - Related product ID
- `order_id` - Related order ID
- `user_id` - User who triggered event
- `session_id` - Session identifier
- `metadata` - JSONB field for additional data
- `created_at` - Event timestamp

**Indexes:**
- pixel_id, event_type, created_at, user_id, session_id, order_id, product_id

---

## Real-World Examples

### Example 1: Track Product View + Log to Database
```typescript
import { trackViewContent } from '@/utils/analytics';
import { useEnabledPixels } from '@/hooks/useAdvertisingPixelsNew';
import { logProductView } from '@/utils/pixelAnalyticsHelper';

export function ProductDetail() {
  const { data: pixels } = useEnabledPixels();
  
  useEffect(() => {
    const product = {
      id: 'prod-ginseng-123',
      name: 'Premium Ginseng Pills',
      price: 29.99,
      category: 'Supplements',
      brand: 'New Era Herbals'
    };
    
    // Fire to GTM and Meta Pixel
    trackViewContent(product);
    
    // Log to database for analytics
    if (pixels?.length > 0) {
      pixels.forEach(pixel => {
        logProductView(pixel.id, product);
      });
    }
  }, [pixels]);
  
  return <div>Product Detail Page</div>;
}
```

### Example 2: Complete Checkout Flow
```typescript
import { trackAddToCart, trackBeginCheckout, trackPurchase } from '@/utils/analytics';
import { logToAllPixels } from '@/utils/pixelAnalyticsHelper';

async function handleCheckout(cartItems, order) {
  const { data: pixels } = useEnabledPixels();
  
  // 1. Track add to cart
  cartItems.forEach(item => {
    trackAddToCart({
      id: item.product_id,
      name: item.product_name,
      price: item.price,
      quantity: item.quantity,
      category: item.category
    });
  });
  
  // 2. Track begin checkout
  trackBeginCheckout(cartItems, order.total, 'USD', order.tax, order.shipping);
  
  // 3. Create order
  const createdOrder = await createOrder(order);
  
  // 4. Track purchase
  trackPurchase(
    createdOrder.order_number,
    cartItems,
    order.discount,
    order.shipping,
    order.tax,
    order.total
  );
  
  // 5. Log to database
  if (pixels?.length > 0) {
    await logToAllPixels(
      pixels.map(p => p.id),
      {
        event_type: 'purchase',
        event_value: order.total,
        order_id: createdOrder.id,
        metadata: {
          items_count: cartItems.length,
          currency: 'USD'
        }
      }
    );
  }
}
```

### Example 3: Custom Event Tracking
```typescript
import { logCustomEvent } from '@/utils/pixelAnalyticsHelper';
import { useEnabledPixels } from '@/hooks/useAdvertisingPixelsNew';

function NewsletterSignup() {
  const { data: pixels } = useEnabledPixels();
  
  const handleSignup = async (email) => {
    // Subscribe to newsletter
    await subscribeNewsletter(email);
    
    // Log custom event to all pixels
    if (pixels?.length > 0) {
      for (const pixel of pixels) {
        await logCustomEvent(
          pixel.id,
          'newsletter_signup',
          undefined,
          { email_domain: email.split('@')[1] }
        );
      }
    }
  };
  
  return <EmailInput onSubmit={handleSignup} />;
}
```

---

## Performance Tips

### 1. Batch Events to Multiple Pixels
```typescript
// ❌ Slow: Sequential calls
for (const pixel of pixels) {
  await logCustomEvent(pixel.id, 'event', value);
}

// ✅ Fast: Parallel calls
await Promise.all(
  pixels.map(p => logCustomEvent(p.id, 'event', value))
);

// ✅ Better: Single batch call
await logToAllPixels(pixels.map(p => p.id), { event_type: 'event' });
```

### 2. Use Event Deduplication
```typescript
// The system automatically prevents:
// - ViewContent for same product twice per session
// - PageView for same page within 5 seconds
// - No need to track manually
```

### 3. Monitor Queue Size
```typescript
import { getPixelLogger } from '@/utils/pixelEventLogger';

const logger = getPixelLogger();
console.log(`Queued events: ${logger.getQueueSize()}`);
// High queue = network issues or batching delay
```

---

## Troubleshooting

### Events Not Appearing
```javascript
// Check 1: Are pixels configured?
fetch('/api/pixels').then(r => r.json()).then(console.log);

// Check 2: Are pixels enabled?
fetch('/api/pixels').then(r => r.json())
  .then(pixels => pixels.filter(p => p.is_enabled));

// Check 3: Are events being queued?
import { getPixelLogger } from '@/utils/pixelEventLogger';
console.log(getPixelLogger().getQueueSize());

// Check 4: Check server logs
// Terminal: npm run server:dev
```

### Duplicate Events
```javascript
// Check session storage
sessionStorage.getItem('new_era_herbals_viewed_products');
// Should contain set of product IDs already tracked this session

// Check page tracking
sessionStorage.getItem('new_era_herbals_tracked_pages');
// Should contain map of tracked pages with timestamps
```

### Performance Issues
```typescript
// Increase batch size for more throughput
// In pixelEventLogger.ts, increase BATCH_SIZE
const BATCH_SIZE = 100; // was 50

// Increase flush interval for lower latency
const FLUSH_INTERVAL = 5000; // was 10000
```

---

## Production Checklist

- [ ] All pixels configured and enabled in admin panel
- [ ] Test event tracking: Page view, Product view, Add to cart, Purchase
- [ ] Verify events appear in Meta Pixel dashboard within 15 minutes
- [ ] Verify events appear in Google Analytics within 24 hours
- [ ] Monitor event queue size: Should be <10 in steady state
- [ ] Check database: SELECT COUNT(*) FROM pixel_events;
- [ ] Setup alerts for queue failures
- [ ] Document pixel IDs for team reference
- [ ] Train team on event tracking integration

---

## API Documentation

### POST /api/pixel-events
Log one or multiple events

**Request Body:**
```json
{
  "pixel_id": "uuid",           // Required
  "event_type": "page_view",    // Required
  "event_value": 100,           // Optional: numeric
  "currency": "USD",            // Optional: defaults to USD
  "product_id": "uuid",         // Optional
  "order_id": "uuid",           // Optional
  "user_id": "uuid",            // Optional
  "session_id": "string",       // Optional: auto-filled
  "metadata": {}                // Optional: custom data
}
```

**Response:**
```json
{
  "message": "Events queued for processing",
  "queued": 1,
  "queue_size": 1
}
```

### GET /api/pixel-events
Fetch recent events

**Query Parameters:**
- `limit` (number, default: 100, max: 1000)
- `offset` (number, default: 0)
- `pixel_id` (string): Filter by pixel
- `event_type` (string): Filter by event type

**Example:**
```
GET /api/pixel-events?event_type=purchase&limit=50
```

---

**Last Updated:** November 24, 2025  
**Version:** 1.0  
**Status:** Production Ready ✅
