# 🔴 URGENT: Backend Referral API Performance Issue

**Date:** January 12, 2026  
**Priority:** CRITICAL  
**Component:** Referral System API  
**Affected Endpoint:** `GET /api/v1/referral/my-tree`  
**Issue:** Request timing out after 30+ seconds

---

## 📋 **Problem Summary**

The `/api/v1/referral/my-tree` endpoint is taking **MORE than 30 seconds** to respond, causing frontend timeouts.

**Error:** `timeout of 30000ms exceeded` (ECONNABORTED)

**Current Performance:**

- ❌ Response time: >30 seconds
- ❌ User experience: Broken (timeouts)
- ❌ Database load: Very high

**Target Performance:**

- ✅ Response time: <2 seconds
- ✅ User experience: Instant load
- ✅ Database load: Optimized

---

## 🔍 **Root Cause Analysis**

The backend is likely running **unoptimized SQL queries** with:

1. Multiple LEFT JOINs without indexes
2. Aggregations (SUM, COUNT) on large datasets
3. No query result caching
4. Missing database indexes on foreign keys

### **Example of Slow Query:**

```sql
-- This query can be VERY slow without proper indexes
SELECT
  r.referral_id,
  COALESCE(SUM(s.amount), 0) as personalInvestment,
  COUNT(s.id) as activeStakesCount
FROM referrals r
LEFT JOIN stakes s ON s.user_id = r.referral_id  -- ⚠️ Slow without index
  AND s.status = 'active'
WHERE r.referrer_id = :currentUserId
GROUP BY r.referral_id;
```

---

## ⚡ **Immediate Solutions**

### **Solution 1: Add Database Indexes (CRITICAL)**

Add these indexes immediately to speed up queries:

```sql
-- Index on stakes table (CRITICAL)
CREATE INDEX IF NOT EXISTS idx_stakes_user_status
ON stakes(user_id, status)
WHERE deleted_at IS NULL;

-- Index on stakes for aggregations
CREATE INDEX IF NOT EXISTS idx_stakes_user_amount
ON stakes(user_id, amount, status);

-- Index on referrals table
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_level
ON referrals(referrer_id, level);

-- Index on referral_bonuses table
CREATE INDEX IF NOT EXISTS idx_referral_bonuses_referrer_status
ON referral_bonuses(referrer_id, status);

-- Index on referral_bonuses for aggregations
CREATE INDEX IF NOT EXISTS idx_referral_bonuses_user_completed
ON referral_bonuses(user_id, status, amount)
WHERE status = 'completed';
```

**Expected Impact:** Reduce query time by 90% (from 30s to 3s)

---

### **Solution 2: Optimize SQL Queries**

Instead of multiple subqueries, use optimized query:

```sql
-- OPTIMIZED VERSION
WITH stake_aggregates AS (
  -- Pre-aggregate stakes data
  SELECT
    user_id,
    SUM(amount) as total_staked,
    COUNT(*) as active_count,
    MAX(created_at) as last_stake_date
  FROM stakes
  WHERE status = 'active'
    AND deleted_at IS NULL
    AND user_id IN (
      SELECT referral_id
      FROM referrals
      WHERE referrer_id = :currentUserId
    )
  GROUP BY user_id
),
referral_earnings AS (
  -- Pre-aggregate referral earnings
  SELECT
    referrer_id,
    SUM(amount) as total_earned
  FROM referral_bonuses
  WHERE status = 'completed'
    AND referrer_id IN (
      SELECT referral_id
      FROM referrals
      WHERE referrer_id = :currentUserId
    )
  GROUP BY referrer_id
)
SELECT
  r.referral_id,
  r.level,
  u.username,
  u.email,
  r.created_at as joinedAt,
  COALESCE(sa.total_staked, 0) as personalInvestment,
  COALESCE(sa.active_count, 0) as activeStakesCount,
  sa.last_stake_date as lastStakeDate,
  COALESCE(re.total_earned, 0) as referralInvestmentAmount,
  CASE WHEN COALESCE(sa.total_staked, 0) > 0 THEN true ELSE false END as hasQualifyingStake
FROM referrals r
INNER JOIN users u ON u.id = r.referral_id
LEFT JOIN stake_aggregates sa ON sa.user_id = r.referral_id
LEFT JOIN referral_earnings re ON re.referrer_id = r.referral_id
WHERE r.referrer_id = :currentUserId
  AND r.level <= :maxLevels
ORDER BY r.level ASC, r.created_at DESC;
```

**Expected Impact:** Reduce query execution time by 50-80%

---

### **Solution 3: Add Query Result Caching**

Cache the results for 5 minutes to reduce database load:

```javascript
// Using Node-Cache or Redis
const NodeCache = require('node-cache');
const referralTreeCache = new NodeCache({ stdTTL: 300 }); // 5 minutes

async function getMyReferralTree(req, res) {
  const userId = req.user.id;
  const maxLevels = parseInt(req.query.maxLevels) || 5;

  // Check cache first
  const cacheKey = `referral_tree_${userId}_${maxLevels}`;
  const cached = referralTreeCache.get(cacheKey);

  if (cached) {
    console.log('[Cache] Returning cached referral tree for user:', userId);
    return res.json(cached);
  }

  // If not in cache, fetch from database
  const result = await fetchReferralTreeFromDB(userId, maxLevels);

  // Store in cache
  referralTreeCache.set(cacheKey, result);

  return res.json(result);
}
```

**Expected Impact:**

- First request: Still slow (but faster with indexes)
- Subsequent requests: <100ms (instant)
- Reduce database load by 80%

---

### **Solution 4: Add Pagination**

For users with many referrals (>100), add pagination:

```javascript
// Add pagination parameters
GET /api/v1/referral/my-tree?maxLevels=20&page=1&limit=50

// Response includes pagination info
{
  "success": true,
  "data": {
    "tree": [...],
    "stats": {...},
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalReferrals": 150,
      "limit": 50
    }
  }
}
```

**Expected Impact:**

- Always fast (<2s) regardless of referral count
- Better user experience with progressive loading

---

### **Solution 5: Use Materialized View (Advanced)**

For frequently accessed data, create a materialized view:

```sql
-- Create materialized view (PostgreSQL)
CREATE MATERIALIZED VIEW referral_tree_summary AS
SELECT
  r.referrer_id,
  r.referral_id,
  r.level,
  u.username,
  u.email,
  r.created_at as joinedAt,
  COALESCE(SUM(s.amount), 0) as personalInvestment,
  COUNT(s.id) as activeStakesCount,
  MAX(s.created_at) as lastStakeDate
FROM referrals r
INNER JOIN users u ON u.id = r.referral_id
LEFT JOIN stakes s ON s.user_id = r.referral_id
  AND s.status = 'active'
  AND s.deleted_at IS NULL
GROUP BY r.referrer_id, r.referral_id, r.level, u.username, u.email, r.created_at;

-- Create index on materialized view
CREATE INDEX idx_ref_tree_summary_referrer
ON referral_tree_summary(referrer_id, level);

-- Refresh materialized view every 5 minutes (scheduled job)
REFRESH MATERIALIZED VIEW CONCURRENTLY referral_tree_summary;
```

**Expected Impact:**

- Query time: <500ms (constant, regardless of data size)
- Slightly stale data (5 min delay)
- Best for production with many users

---

## 🧪 **Testing & Verification**

### **Step 1: Check Current Query Performance**

```sql
-- Enable query timing
EXPLAIN ANALYZE
SELECT ... -- Your current query

-- Look for:
-- - Seq Scan (bad) vs Index Scan (good)
-- - Execution time
-- - Number of rows processed
```

### **Step 2: Test After Adding Indexes**

```sql
-- Run the same query again
EXPLAIN ANALYZE
SELECT ... -- Your optimized query

-- Compare:
-- - Execution time should be 10x faster
-- - Should show "Index Scan" instead of "Seq Scan"
```

### **Step 3: Load Testing**

```bash
# Use Apache Bench or similar
ab -n 100 -c 10 \
  -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/v1/referral/my-tree?maxLevels=5

# Look for:
# - Average response time <2000ms
# - No timeouts
# - Consistent performance
```

---

## 📊 **Performance Benchmarks**

| Optimization   | Before | After  | Improvement |
| -------------- | ------ | ------ | ----------- |
| Add Indexes    | >30s   | ~3s    | 90% faster  |
| Optimize Query | 3s     | 1.5s   | 50% faster  |
| Add Caching    | 1.5s   | <100ms | 15x faster  |
| Pagination     | N/A    | <2s    | Always fast |

**Combined Impact:**

- First load: 1-3 seconds (acceptable)
- Cached loads: <100ms (excellent)
- No more timeouts ✅

---

## 🚀 **Implementation Priority**

### **Phase 1: Immediate (Do This NOW)**

1. ✅ Add database indexes (30 minutes)
2. ✅ Increase connection pool size if needed
3. ✅ Test query performance

### **Phase 2: Short-term (Do This Today)**

1. ✅ Optimize SQL queries using CTEs
2. ✅ Add result caching (Node-Cache or Redis)
3. ✅ Add query logging to monitor slow queries

### **Phase 3: Medium-term (Do This Week)**

1. ✅ Implement pagination
2. ✅ Add rate limiting to prevent abuse
3. ✅ Set up monitoring/alerts for slow queries

### **Phase 4: Long-term (Optional)**

1. ✅ Implement materialized views
2. ✅ Add background job to refresh aggregates
3. ✅ Consider read replicas for heavy loads

---

## 💻 **Quick Fix Code**

### **Add Indexes (Run this SQL now):**

```sql
-- PostgreSQL
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stakes_user_status
ON stakes(user_id, status) WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_referrals_referrer
ON referrals(referrer_id, level);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_referral_bonuses_user
ON referral_bonuses(referrer_id, status, amount);

-- MySQL
CREATE INDEX idx_stakes_user_status
ON stakes(user_id, status);

CREATE INDEX idx_referrals_referrer
ON referrals(referrer_id, level);

CREATE INDEX idx_referral_bonuses_user
ON referral_bonuses(referrer_id, status);
```

### **Add Caching (Add this to your controller):**

```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes

async function getMyReferralTree(req, res) {
  const userId = req.user.id;
  const cacheKey = `ref_tree_${userId}`;

  // Check cache
  const cached = cache.get(cacheKey);
  if (cached) return res.json(cached);

  // Fetch from DB (your existing code)
  const result = await fetchFromDatabase(userId);

  // Cache result
  cache.set(cacheKey, result);

  return res.json(result);
}
```

---

## 📞 **Support & Monitoring**

### **How to Monitor Performance:**

```javascript
// Add timing logs to your endpoint
const startTime = Date.now();

// ... your database query ...

const duration = Date.now() - startTime;
console.log(`[Referral Tree] Query took ${duration}ms for user ${userId}`);

// Alert if slow
if (duration > 5000) {
  console.error(`⚠️ SLOW QUERY: ${duration}ms for user ${userId}`);
  // Send alert to monitoring system
}
```

### **Set Up Alerts:**

- Alert when query time > 5 seconds
- Alert when timeout rate > 5%
- Monitor database CPU usage

---

## 🎯 **Success Criteria**

The optimization is complete when:

✅ 95% of requests complete in <3 seconds  
✅ 0% timeout rate  
✅ Database CPU usage <50%  
✅ User satisfaction improves  
✅ Frontend no longer shows errors

---

## 📝 **Deployment Checklist**

Before deploying these changes:

- [ ] Back up database
- [ ] Test indexes on staging environment
- [ ] Run EXPLAIN ANALYZE on optimized queries
- [ ] Test with production-like data volume
- [ ] Monitor database performance during deployment
- [ ] Have rollback plan ready
- [ ] Notify frontend team when deployed
- [ ] Monitor for 24 hours after deployment

---

**Contact:** Frontend Team  
**Reference:** BACKEND_REFERRAL_PERFORMANCE_CRITICAL  
**Status:** CRITICAL - Immediate action required

---

**End of Document**
