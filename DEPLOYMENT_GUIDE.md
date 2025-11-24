# Pixel Tracking System - Deployment Guide

## Pre-Deployment Checklist

### Code Review
- [ ] All LSP errors fixed
- [ ] No console errors or warnings
- [ ] All imports resolve correctly
- [ ] TypeScript compilation successful

### Testing
- [ ] PageView event fires on navigation
- [ ] ViewContent fires once per product per session
- [ ] AddToCart event includes all required fields
- [ ] BeginCheckout includes coupon discounts
- [ ] Purchase event completes successfully
- [ ] Events appear in database within 10 seconds

### Configuration
- [ ] Database URL set correctly
- [ ] Environment variables configured
- [ ] API CORS settings correct
- [ ] Rate limiting tuned for expected load

### Monitoring
- [ ] Event queue monitoring setup
- [ ] Error logging configured
- [ ] Database backups scheduled
- [ ] Performance metrics tracked

---

## Development Environment Setup

```bash
# 1. Install dependencies
npm install

# 2. Setup database
npm run db:push

# 3. Start frontend (Terminal 1)
npm run dev
# Runs on http://localhost:5000

# 4. Start backend (Terminal 2)
npm run server:dev
# Runs on http://localhost:3001

# 5. Verify system
curl http://localhost:3001/health
# Should return: {"status":"ok",...}
```

---

## Production Deployment

### Option 1: Replit Deployment

```bash
# 1. Update deployment config
# File: .replit or Replit UI
# Set run command: npm run server
# Set build command: npm run build

# 2. Deploy
# Click "Publish" in Replit UI

# 3. Verify
curl https://your-app.replit.dev/api/pixels
```

### Option 2: Traditional Server

```bash
# 1. Build frontend
npm run build

# 2. Start backend
NODE_ENV=production npm run server

# 3. Configure reverse proxy (nginx)
```

**Nginx Config Example:**
```nginx
server {
  listen 80;
  server_name api.example.com;

  # API routes
  location /api/ {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }

  # Static frontend
  location / {
    root /var/www/html;
    try_files $uri /index.html;
  }
}
```

---

## Environment Variables

### Required
```
DATABASE_URL=postgresql://user:pass@host/db
PORT=3001
NODE_ENV=production
```

### Optional
```
VITE_GTM_ID=GTM-XXXXXX          # Google Tag Manager
VITE_META_PIXEL_ID=123456789    # Meta Pixel (if hardcoded)
API_RATE_LIMIT=100              # Requests per 15 min
LOG_LEVEL=info                  # error, warn, info, debug
```

---

## Database Migration to Production

### Step 1: Backup Existing Database
```sql
-- Backup entire database
pg_dump postgresql://user:pass@prod-host/db > backup.sql

-- Or just the pixel tables
pg_dump -t advertising_pixels -t pixel_events \
  postgresql://user:pass@prod-host/db > pixel_backup.sql
```

### Step 2: Push Schema Changes
```bash
# Test first in staging
NODE_ENV=staging npm run db:push

# Then push to production
NODE_ENV=production npm run db:push
```

### Step 3: Verify Migration
```sql
-- Check tables exist
\dt advertising_pixels
\dt pixel_events

-- Check row counts
SELECT COUNT(*) FROM advertising_pixels;
SELECT COUNT(*) FROM pixel_events;

-- Check indexes
\di on advertising_pixels
\di on pixel_events
```

---

## Monitoring & Logging

### Application Logs
```bash
# View all logs
tail -f /var/log/app.log

# Filter for errors
grep ERROR /var/log/app.log

# Filter for specific component
grep "Pixel" /var/log/app.log
```

### Database Performance
```sql
-- Check slow queries
SELECT query, mean_time 
FROM pg_stat_statements 
WHERE query LIKE '%pixel%'
ORDER BY mean_time DESC;

-- Monitor event queue size
SELECT COUNT(*) FROM pixel_events 
WHERE created_at > NOW() - INTERVAL '1 hour';

-- Check disk usage
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables 
WHERE tablename IN ('advertising_pixels', 'pixel_events')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Performance Monitoring
```bash
# Monitor event processing time
grep "Flushed.*events" /var/log/app.log \
  | awk -F'ms' '{print $2}' \
  | awk '{sum+=$1} END {print sum/NR}'

# Monitor queue size
grep "queue_size" /var/log/app.log \
  | tail -10
```

---

## Health Checks

### API Health
```bash
# Endpoint
GET /health

# Expected Response
{
  "status": "ok",
  "timestamp": "2025-11-24T..."
}
```

### Database Health
```bash
# Test connection
curl -X GET http://localhost:3001/api/pixels

# Should return pixel list
# If timeout/error, database connection issue
```

### Event Processing Health
```bash
# Check recent events
curl http://localhost:3001/api/pixel-events?limit=1

# Should return within 100ms
# If slow, database indexes may need optimization
```

---

## Backup & Recovery

### Automated Backups
```bash
# Create daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL | gzip > /backups/db_$DATE.sql.gz

# Keep last 30 days
find /backups -name 'db_*.sql.gz' -mtime +30 -delete
```

### Restore from Backup
```bash
# Restore full database
gunzip -c /backups/db_20251124.sql.gz | psql $DATABASE_URL

# Restore specific table
gunzip -c /backups/db_20251124.sql.gz | \
  psql $DATABASE_URL -c "DELETE FROM pixel_events; \
  \copy pixel_events FROM STDIN"
```

---

## Scaling Considerations

### For 1K Events/Day
- Single server
- Standard database
- No optimization needed

### For 10K Events/Day
- Add database indexing
- Implement connection pooling
- Consider read replicas

### For 100K+ Events/Day
- Sharded database
- Event stream processing (Kafka)
- Cache layer (Redis)
- Separate read replicas

---

## Troubleshooting Production Issues

### High Event Queue
```
Problem: Queue size stays > 100

Solutions:
1. Check database connection: test psql connection
2. Increase batch size: BATCH_SIZE = 100
3. Reduce flush interval: FLUSH_INTERVAL = 5000
4. Check disk space: df -h
5. Monitor CPU: top
```

### Slow Event Processing
```
Problem: Events take > 5 seconds to appear

Solutions:
1. Check database indexes: ANALYZE pixel_events;
2. Check network latency: ping database-host
3. Check query plans: EXPLAIN ANALYZE SELECT...;
4. Add database connection pooling
```

### API Rate Limiting Issues
```
Problem: 429 (Too Many Requests) errors

Solutions:
1. Increase rate limit: API_RATE_LIMIT=500
2. Implement caching
3. Check for DDoS patterns
4. Use CDN for static assets
```

### Memory Leaks
```
Problem: Server memory grows continuously

Solutions:
1. Check for event queue memory: getPixelLogger().getQueueSize()
2. Monitor Node memory: node --max-old-space-size=4096
3. Check for stuck connections: lsof | grep node
4. Review circular references in code
```

---

## Post-Deployment

### Day 1 Checklist
- [ ] Monitor error logs continuously
- [ ] Check event processing latency
- [ ] Verify database backups created
- [ ] Test admin pixel management
- [ ] Confirm events in Meta Pixel dashboard

### Week 1 Checklist
- [ ] Review performance metrics
- [ ] Optimize slow queries
- [ ] Set up production alerts
- [ ] Document any issues found
- [ ] Train team on monitoring

### Monthly Checklist
- [ ] Review event volume trends
- [ ] Optimize database (VACUUM, ANALYZE)
- [ ] Check backup integrity
- [ ] Review error patterns
- [ ] Plan capacity upgrades

---

## Rollback Plan

If critical issues arise:

### Immediate (< 5 min)
1. Stop server: `pm2 stop app`
2. Revert code: `git revert HEAD`
3. Restart server: `pm2 start app`
4. Verify: `curl /health`

### Database Issues (< 30 min)
1. Stop server
2. Restore from backup: `psql < backup.sql`
3. Restart server
4. Verify event counts

### Complete Rollback (< 1 hour)
1. Switch DNS to previous server
2. Restore from full backup
3. Verify all systems working
4. Investigate issue in staging

---

## Support & Escalation

### Critical Issues
```
1. Events not processing
2. Database not responding
3. High error rate (> 5%)
4. Memory/CPU at 100%

Action: Page on-call engineer
```

### High Priority Issues
```
1. Slow event processing (> 10 sec)
2. Pixel dashboard unavailable
3. Pixel IDs not saving

Action: Create incident ticket
Resolve within: 2 hours
```

### Normal Issues
```
1. Typos in UI
2. Minor optimization requests
3. Documentation updates

Action: Create feature ticket
Resolve within: 1 week
```

---

**Last Updated:** November 24, 2025  
**Version:** 1.0  
**Status:** Ready for Production ✅
