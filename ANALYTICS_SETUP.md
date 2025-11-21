# Analytics & Tracking Setup Guide

This application uses **Google Tag Manager (GTM)** for all analytics and advertising pixel tracking. This approach is simple, maintainable, and allows you to manage all your pixels from one central dashboard without code changes.

## Why Google Tag Manager?

Previously, the app had a complex 1,500+ line tracking system that manually managed 10 different advertising platforms. This was:
- ❌ Complex and error-prone
- ❌ Required code changes to add/remove pixels
- ❌ Had performance issues
- ❌ Difficult to debug

The new GTM approach is:
- ✅ **Simple**: ~200 lines of clean code
- ✅ **Flexible**: Add/remove pixels without code changes
- ✅ **Reliable**: Google's battle-tested infrastructure
- ✅ **Easy to debug**: GTM Preview mode shows all events in real-time

## Setup Instructions

### Step 1: Create a Google Tag Manager Account

1. Go to [Google Tag Manager](https://tagmanager.google.com/)
2. Create a new account for your website
3. Create a container (choose "Web" as the platform)
4. Copy your GTM ID (format: `GTM-XXXXXXX`)

### Step 2: Configure Environment Variable

1. Create a `.env` file in your project root (copy from `.env.example`)
2. Add your GTM ID:
   ```
   VITE_GTM_ID=GTM-XXXXXXX
   ```

### Step 3: Configure Tags in GTM Dashboard

The application sends standard e-commerce events to GTM. You need to configure tags in GTM to forward these events to your advertising platforms.

#### Standard Events Tracked:

1. **page_view** - Fired on every page navigation
2. **view_item** - Fired when viewing a product
3. **add_to_cart** - Fired when adding item to cart
4. **begin_checkout** - Fired when starting checkout
5. **purchase** - Fired when completing an order
6. **search** - Fired when searching for products

#### Example: Setting Up Meta (Facebook) Pixel

1. In GTM, go to **Tags** → **New**
2. Click **Tag Configuration**
3. Choose **Facebook Pixel** (or **Custom HTML** for manual setup)
4. Configure:
   - Pixel ID: Your Meta Pixel ID
   - Trigger: Choose the events you want to track (e.g., `page_view`, `purchase`)
5. Save and **Submit** your changes

#### Example: Setting Up Google Ads Conversion Tracking

1. In GTM, go to **Tags** → **New**
2. Click **Tag Configuration**
3. Choose **Google Ads Conversion Tracking**
4. Configure:
   - Conversion ID: Your Google Ads conversion ID
   - Conversion Label: Your conversion label
   - Trigger: Choose `purchase` event
5. Save and **Submit**

### Step 4: Test Your Setup

1. In GTM, click **Preview** button
2. Enter your website URL (e.g., `http://localhost:5000`)
3. GTM Preview mode will open showing all events in real-time
4. Navigate your site, add items to cart, complete checkout
5. Verify all events are firing correctly in the Preview panel

### Supported Advertising Platforms

You can configure any of these platforms through GTM:

- ✅ Google Ads
- ✅ Meta (Facebook) Pixel
- ✅ TikTok Pixel
- ✅ LinkedIn Insight Tag
- ✅ Twitter/X Pixel
- ✅ Pinterest Tag
- ✅ Snapchat Pixel
- ✅ Microsoft Advertising
- ✅ Reddit Pixel
- ✅ Quora Pixel

## Event Data Structure

All events include standard e-commerce data:

```javascript
{
  event: 'add_to_cart',
  currency: 'PKR',
  value: 1500,
  items: [{
    item_id: 'product-uuid',
    item_name: 'Herbal Supplement',
    item_category: 'Supplements',
    item_brand: 'New Era Herbals',
    price: 1500,
    quantity: 1
  }]
}
```

This follows [Google Analytics 4 (GA4) e-commerce event schema](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce), which is compatible with most advertising platforms.

## Troubleshooting

### Events Not Showing in GTM Preview

1. Check browser console for errors
2. Verify `VITE_GTM_ID` is set correctly in `.env`
3. Make sure GTM container is published (not just saved)
4. Clear browser cache and reload

### Pixels Not Receiving Data

1. Check GTM Preview to verify events are firing
2. Review your tag configuration in GTM
3. Check pixel status in advertising platform dashboard
4. Verify pixel ID is correct in GTM tag

### Development vs Production

- GTM works the same in development and production
- Use GTM environments to separate dev/prod data if needed
- Consider using different GTM containers for staging vs production

## Benefits of This Approach

1. **No Code Changes**: Add/remove pixels entirely through GTM dashboard
2. **Better Performance**: GTM loads asynchronously and handles deduplication
3. **Easier Debugging**: GTM Preview mode shows exactly what's happening
4. **Version Control**: GTM tracks all changes with version history
5. **Team Collaboration**: Multiple team members can manage pixels
6. **Built-in Features**: GTM includes trigger conditions, variables, and more

## Migration Notes

The old system supported:
- ❌ Manual script injection for each platform
- ❌ Complex state management and deduplication
- ❌ Database performance tracking
- ❌ Product catalog syncing

The new system:
- ✅ Single GTM script
- ✅ Standard e-commerce events
- ✅ Platform handles deduplication
- ✅ Simpler, more reliable

All previous functionality is maintained, but implementation is 85% simpler.

## Support

For GTM-specific questions, see [Google Tag Manager Documentation](https://support.google.com/tagmanager).

For application-specific tracking issues, check the code in:
- `src/utils/analytics.ts` - Core tracking functions
- `src/components/Analytics.tsx` - GTM loader
- `src/hooks/useAnalytics.ts` - React hook for tracking
