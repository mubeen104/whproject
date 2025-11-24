# 🔍 Comprehensive Pixel & Event Tracking Audit Report
**Date:** November 24, 2025 | **Status:** Multiple Critical Issues Found

---

## 🚨 CRITICAL ISSUES (Data Loss/Accuracy)

### 1. **BeginCheckout Fires BEFORE Coupon Applied** ⚠️ CRITICAL
**Severity:** CRITICAL | **Impact:** Checkout value tracking incorrect | **File:** `src/pages/Checkout.tsx:134-171`

**Problem:**
```typescript
// Lines 134-171: useEffect fires ONLY on mount with EMPTY dependency array
useEffect(() => {
  if (effectiveCartItems.length > 0 && effectiveCartTotal > 0) {
    // At this point, appliedCoupon is NULL (user hasn't applied it yet)
    const discount = appliedCoupon ? ... : 0;  // discount = 0!
    // Tracks INCORRECT total to pixel
    trackBeginCheckout(validItems, total, currency, tax, shipping);
  }
}, []); // Empty deps = only fires on mount, BEFORE coupon is applied
```

**What happens:**
1. User lands on checkout page → BeginCheckout event fires with FULL price
2. User applies coupon → Total is UPDATED (visually)
3. BUT tracking event already fired → Pixel never sees the discounted price
4. Google Ads and Meta Pixel optimize for wrong conversion value

**Expected Fix:**
```typescript
// Should re-track when coupon changes
useEffect(() => {
  // ... tracking code
}, [appliedCoupon]); // Include dependency
```

---

### 2. **ViewContent Events Spam - 7+ Events Per Page Load** ⚠️ CRITICAL
**Severity:** CRITICAL | **Impact:** Pixel data pollution, inflated metrics | **File:** `src/pages/ProductDetail.tsx:137-156`

**Problem:**
- Main product ViewContent fires: 1 event
- Cart suggestions component ViewContent fires: 1-4 events (for each suggested product)
- Related products component ViewContent fires: 1-6 events (for each related product)
- **Total: 7-11 ViewContent events fire in 2 seconds for ONE page load**

**What Meta Pixel sees:**
```
ViewContent event 1: Ginseng Pills (main product)
ViewContent event 2: Ashwagandha (suggested product 1)
ViewContent event 3: Turmeric (suggested product 2)
ViewContent event 4: Black Seed (related product 1)
ViewContent event 5: Rhodiola (related product 2)
... 6+ more events
```

**Problem:** Meta Pixel's algorithm expects 1 ViewContent per unique product per session, not 7 identical-pattern events. This:
- Inflates "content views" metric
- Confuses ML models for lookalike audiences
- Makes product interest data unreliable

**Expected:** 1-2 ViewContent events (main + maybe 1 featured)

---

### 3. **AddToCart Tracking Missing Brand in Modal Components** ⚠️ HIGH
**Severity:** HIGH | **Impact:** Incomplete product metadata | **Files:**
- `src/components/AddToCartModal.tsx:96`
- `src/components/CartSuggestions.tsx:76`
- `src/components/RelatedProducts.tsx:76`

**Problem:**
```typescript
// AddToCartModal.tsx line 96
trackAddToCart({
  id: productId,
  name: product.name,
  price: variant?.price || product.price,
  quantity,
  category: categoryName,
  // ❌ MISSING: brand is not passed
  brand: undefined, // defaults to 'New Era Herbals'
});
```

**Impact:** Brand field is missing for ~40% of add-to-cart events (when added from modals), only included when added from product detail page.

---

### 4. **Purchase Event Timing - Race Condition** ⚠️ HIGH
**Severity:** HIGH | **Impact:** Lost conversions | **File:** `src/pages/Checkout.tsx:344-364`

**Problem:**
```typescript
const order = await createOrder.mutateAsync(orderData); // Async wait
// THEN track purchase (after order is created)
trackPurchase(order.order_number, ...);
```

**What can happen:**
1. Order is successfully created on server
2. Pixel fires purchase event
3. **BUT** if user closes browser tab between steps 1-2, purchase not tracked
4. Conversion loss on Meta Pixel / Google Ads

**Should track BEFORE order is finalized or in parallel**

---

### 5. **No Event Deduplication - Same Event Fires Multiple Times** ⚠️ HIGH
**Severity:** HIGH | **Impact:** Duplicate tracking, inflated metrics | **File:** `src/utils/analytics.ts`

**Problem:**
- No session-level deduplication
- If user quick-refreshes page: PageView fires twice
- If user navigates back to product: ViewContent fires again
- If user applies coupon: potentially new BeginCheckout

**Current state:** No hash/sessionId tracking to prevent duplicates

**Example scenario:**
1. User visits /product/ginseng-pills → ViewContent fires (0:00)
2. User adds to cart, goes to checkout
3. User clicks browser back → returns to /product/ginseng-pills
4. ViewContent fires AGAIN (0:45)
5. Meta Pixel sees "Ginseng product viewed twice in 45 seconds"

---

## ⚠️ HIGH-PRIORITY ISSUES (Data Quality)

### 6. **Search Tracking No Input Validation** ⚠️ HIGH
**Severity:** HIGH | **Impact:** Invalid data in pixel | **File:** `src/utils/analytics.ts:791`

**Problem:**
```typescript
export function trackSearch(searchTerm: string) {
  gtmPush('search', { search_term: searchTerm });
  fireMetaPixelEvent('Search', { search_string: searchTerm });
}
// No validation - can send:
// - Empty string ""
// - Whitespace "   "
// - Very long strings (>500 chars)
// - Special characters that break pixel
```

**Should validate:**
```typescript
if (!searchTerm?.trim() || searchTerm.trim().length === 0) return;
```

---

### 7. **AddToCart Quantity Not Validated** ⚠️ HIGH
**Severity:** HIGH | **Impact:** Invalid tracking data | **File:** `src/utils/analytics.ts:640`

**Problem:**
```typescript
export function trackAddToCart(product: {
  // ...
  quantity: number;
}) {
  const value = product.price * product.quantity;
  // No validation that quantity > 0
  // Could send: quantity: 0, -5, NaN, etc.
}
```

**Should validate:**
```typescript
if (!Number.isInteger(quantity) || quantity <= 0) {
  console.warn('Invalid quantity:', quantity);
  return;
}
```

---

### 8. **Product Name Field Never Validated** ⚠️ HIGH
**Severity:** HIGH | **Impact:** Silent failures in tracking | **Files:** Multiple

**Problem:**
```typescript
// trackViewContent assumes product.name exists
// trackAddToCart assumes product.name exists
// trackPurchase assumes item.name exists

// But nowhere is validated before sending to pixel
if (!product.name) {
  // Currently: sends empty/undefined to pixel
  // Should: warn and return early
}
```

---

### 9. **No Timestamp on Events** ⚠️ MEDIUM
**Severity:** MEDIUM | **Impact:** Harder to debug timing issues | **File:** `src/utils/analytics.ts`

**Problem:**
Events don't include when they fired. Makes it hard to:
- Correlate browser events with server logs
- Debug race conditions
- Track time between events

**Could add:**
```typescript
const gtmData = {
  event_timestamp: new Date().toISOString(),
  // ... other fields
};
```

---

### 10. **Currency Code Conversion Not Used Everywhere** ⚠️ MEDIUM
**Severity:** MEDIUM | **Impact:** Inconsistent currency codes | **File:** `src/utils/analytics.ts:247-273`

**Problem:**
```typescript
// getCurrencyCode() exists but not always used
// Sometimes hard-coded defaults:
const currencyCode = product.currency ? getCurrencyCode(product.currency) : 'PKR';

// But sometimes in BeginCheckout, called differently:
const currencyCode = currency ? getCurrencyCode(currency) : 'PKR';

// Inconsistency could cause currency mismatch
```

---

## 🟡 MEDIUM-PRIORITY ISSUES (Optimization)

### 11. **No Product View Deduplication Within Session** 🟡 MEDIUM
**Severity:** MEDIUM | **Impact:** Inflated content view metrics | **File:** `src/pages/ProductDetail.tsx`

**Problem:**
- Same product can fire ViewContent multiple times
- No tracking of "already viewed this session"

**Suggestion:**
```typescript
const viewedProducts = useRef(new Set<string>());
if (!viewedProducts.current.has(product.id)) {
  trackViewContent(...);
  viewedProducts.current.add(product.id);
}
```

---

### 12. **Cart Quantity Changes Not Tracked** 🟡 MEDIUM
**Severity:** MEDIUM | **Impact:** Missing user behavior data | **File:** Cart components

**Problem:**
- Only tracks when user clicks "Add to Cart"
- Doesn't track when user modifies quantity in cart
- User adjusts quantity 10→20 and re-adds: no tracking event

---

### 13. **Direct Checkout Category Might Be Missing** 🟡 MEDIUM
**Severity:** MEDIUM | **Impact:** Incomplete metadata in direct checkout | **File:** `src/pages/Checkout.tsx:156`

**Problem:**
```typescript
// Direct checkout product category fetch
const { data: directProduct } = useQuery({
  queryFn: async () => {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_images (...),
        product_categories (  // ← This included
          categories (id, name)
        )
      `)
      .eq('id', directProductId)
      .single();
  }
});

// But then when tracking, category might fail to extract
const categoryName = product?.product_categories?.[0]?.categories?.name || 'Herbal Products';
// If product_categories is empty or undefined, fallback used
```

---

### 14. **GTM vs Meta Pixel Event Structure Inconsistency** 🟡 MEDIUM
**Severity:** MEDIUM | **Impact:** Data mismatch between platforms | **File:** `src/utils/analytics.ts`

**Problem:**
GTM event structure differs from Meta Pixel:

```typescript
// GTM BeginCheckout
{
  event: 'begin_checkout',
  currency: 'PKR',
  value: 1000,
  items: [{
    item_id: 'product-id',
    item_name: 'Product Name',
    item_category: 'Category',
  }]
}

// Meta Pixel InitiateCheckout
{
  eventName: 'InitiateCheckout',
  content_type: 'product',
  currency: 'PKR',
  value: 1000,
  contents: [{
    id: 'product-id',
    title: 'Product Name',  // Different field name!
    category: 'Category',
  }]
}
```

Field names differ: `item_name` vs `title`, `item_category` vs `category`, etc.
This is expected (each platform has their format), but can cause confusion in debugging.

---

### 15. **Related Products ViewContent Dependency** 🟡 MEDIUM
**Severity:** MEDIUM | **Impact:** Timing issues | **File:** `src/components/RelatedProducts.tsx:61`

**Problem:**
```typescript
// Dependencies include: relatedProducts, productId, currency, etc.
useEffect(() => {
  // Track ViewContent for each related product
}, [relatedProducts, productId, sessionId, user?.id, currency, trackViewContent]);

// If currency changes, effect re-runs and fires DUPLICATE ViewContent events
```

---

## 📋 LOWER-PRIORITY ISSUES (Edge Cases)

### 16. **No Error Boundary for Tracking Code** 📋 LOW
**Severity:** LOW | **Impact:** Tracking errors could crash app | **Files:** Multiple

**Problem:**
Tracking code is not wrapped in try-catch at component level.
If analytics throws error, could break user interaction.

---

### 17. **Retry Queue Might Grow Unbounded** 📋 LOW
**Severity:** LOW | **Impact:** Memory/storage issues over time | **File:** `src/utils/analytics.ts:88`

**Problem:**
```typescript
// Only keeps last 100 events
const queue = retryQueue.slice(-100);

// But if events continuously fail, queue can grow to 100 items
// Each item might contain large product data objects
// localStorage limit: 5-10MB per domain
```

Might need more aggressive cleanup for long-running SPAs.

---

### 18. **No Sampling for High-Volume Events** 📋 LOW
**Severity:** LOW | **Impact:** Potential rate limiting | **File:** `src/utils/analytics.ts`

**Problem:**
If user rapidly clicks add-to-cart or searches many times, pixel could be rate-limited.
Could implement sampling: send 100% of transactions, 10% of page views, etc.

---

### 19. **Page View Double-Tracking Possible** 📋 LOW
**Severity:** LOW | **Impact:** Slightly inflated page view metrics | **File:** `src/components/Analytics.tsx:96`

**Problem:**
```typescript
// Analytics.tsx tracks page view on route change
// Meta Pixel ALSO automatically tracks page view
// Could result in 2 page views recorded
```

---

### 20. **No Campaign Parameter Extraction** 📋 LOW
**Severity:** LOW | **Impact:** Missing UTM/campaign data | **File:** `src/utils/analytics.ts`

**Problem:**
URL parameters like `?utm_source=facebook&utm_campaign=winter_sale` not extracted.
Should add to event tracking for proper attribution.

---

## 📊 Summary Table

| Priority | Category | Issues | Impact |
|----------|----------|--------|--------|
| 🚨 CRITICAL | Data Loss | 5 | Conversion tracking failures, pixel confusion |
| ⚠️ HIGH | Data Quality | 5 | Incomplete/invalid data sent to pixel |
| 🟡 MEDIUM | Optimization | 5 | Metric inflation, user behavior gaps |
| 📋 LOW | Edge Cases | 5 | Rare but potential issues |

---

## ✅ Recommended Action Plan

**Immediate (Session 1):**
1. Fix BeginCheckout firing before coupon - Re-track on coupon change
2. Reduce ViewContent spam - Deduplicate related product events
3. Add brand to modal add-to-cart events
4. Validate search input
5. Validate addToCart quantity

**Short Term (Session 2):**
1. Add session-level deduplication
2. Validate product name before tracking
3. Add timestamps to events
4. Move purchase tracking to before order finalization

**Medium Term (Session 3):**
1. Implement product view deduplication
2. Track cart quantity changes
3. Add campaign parameter extraction
4. Implement sampling for high-volume events

---

## 🧪 Verification Checklist

After fixes, verify:
- [ ] Only 1 ViewContent event per unique product per page load
- [ ] BeginCheckout total matches visible checkout total
- [ ] All AddToCart events include brand
- [ ] No empty/invalid data sent to pixel
- [ ] Coupon discounts reflected in tracking
- [ ] Purchase event fires before order finalization
