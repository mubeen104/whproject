# 🚀 Quick Start - Pixel Tracking System

## What's Working Right Now?

✅ **Automatic Tracking** - PageView, ViewContent, AddToCart, BeginCheckout, Purchase, Search  
✅ **Event Deduplication** - Prevents duplicate events  
✅ **Database Schema** - Pushed to Neon Postgres  
✅ **Backend API** - Ready to handle events  
✅ **Admin Dashboard** - Monitor events in real-time  

---

## Start Using in 30 Seconds

### 1. Open Admin Panel
```
Navigate to: http://localhost:5000/admin
→ Analytics → Pixel Analytics
```

### 2. Verify Events Are Tracking
Open browser console (F12 → Console tab):
```javascript
console.log(window.dataLayer);  // Shows GTM events
console.log(window.fbq.q);      // Shows Meta Pixel events
```

### 3. Navigate Around the Site
Click around the site:
- Homepage → Check PageView event fired ✅
- Product page → Check ViewContent event fired ✅
- Add to cart → Check AddToCart event fired ✅

### 4. Monitor in Admin Dashboard
```
Admin → Analytics → Pixel Analytics
```
See events appear in real-time!

---

## Adding a Pixel

### Option 1: Manual Setup (Recommended for Testing)

1. Go to Admin Dashboard
2. Click "Pixel Analytics"
3. Create a test pixel:
   - Platform: Meta Pixel
   - Pixel ID: 123456789012345
   - Enable: ✓

### Option 2: API Call

```bash
curl -X POST http://localhost:3001/api/pixels \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "meta_pixel",
    "pixel_id": "123456789012345",
    "is_enabled": true
  }'
```

---

## What Happens Automatically

You don't need to do anything! Just use the site normally:

```
User visits page
    ↓
✅ PageView event fires automatically
    ↓
User visits product
    ↓
✅ ViewContent event fires automatically (once per product)
    ↓
User adds to cart
    ↓
✅ AddToCart event fires automatically
    ↓
User completes checkout
    ↓
✅ Purchase event fires automatically
    ↓
Events logged to database + sent to Meta Pixel/GTM
```

---

## Verify Everything is Working

### Frontend Console Check
```javascript
// Open browser console (F12)

// Check GTM
console.log(window.dataLayer)
// Should see: [{page_view: {...}}, ...]

// Check Meta Pixel
console.log(window.fbq)
// Should see: function fbq() {...}

// Check event logger
import { getPixelLogger } from '@/utils/pixelEventLogger';
const logger = getPixelLogger();
logger.getQueueSize()  // Shows queued events
```

### Admin Dashboard Check
1. Go to Admin → Analytics → Pixel Analytics
2. Should see real-time event statistics
3. Recent events should appear in the viewer

### Database Check
Events are stored in `pixel_events` table:
- All event types
- Session tracking
- Event metadata
- Timestamps

---

## Common Tasks

### Log a Custom Event

```typescript
import { logCustomEvent } from '@/utils/pixelAnalyticsHelper';

await logCustomEvent(
  pixelId,
  'newsletter_signup',
  undefined,
  { email_domain: 'gmail.com' }
);
```

### Log to Multiple Pixels

```typescript
import { logToAllPixels } from '@/utils/pixelAnalyticsHelper';

await logToAllPixels(pixelIds, {
  event_type: 'contact_form_submitted',
  metadata: { form_type: 'contact' }
});
```

### Query Events

```bash
# Get last 50 events
curl http://localhost:3001/api/pixel-events?limit=50

# Get purchase events only
curl http://localhost:3001/api/pixel-events?event_type=purchase&limit=20

# Get events for specific pixel
curl http://localhost:3001/api/pixel-events?pixel_id=UUID&limit=10
```

---

## Performance Tips

✅ **Batching works automatically** - 50 events or 10 seconds  
✅ **Deduplication is automatic** - One ViewContent per product per session  
✅ **Offline support included** - Events queue and sync when online  
✅ **No setup needed** - Just use the app!

---

## Documentation

- **Full Guide**: `PIXEL_TRACKING_SYSTEM.md`
- **Integration Examples**: `PIXEL_TRACKING_INTEGRATION_GUIDE.md`
- **Deployment**: `DEPLOYMENT_GUIDE.md`
- **Test Report**: `PIXEL_TRACKING_TEST_REPORT.md`

---

## Next Steps

1. ✅ **Verify** frontend tracking in browser console
2. ✅ **Create** a test pixel in admin panel
3. ✅ **Monitor** events in admin dashboard
4. ✅ **Test** by navigating the site
5. ✅ **Deploy** when ready

---

**Everything is ready to go! Start using it now!** 🎉
