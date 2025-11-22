# Sentry Alert Setup & Dashboard Guide

## 🚨 Setting Up Critical Alerts

### Step 1: Create Error Rate Alert

1. **Navigate to Alerts**
   ```
   Sentry Dashboard → Alerts → Create Alert
   ```

2. **Select "Issues" Alert Type**
   - Choose: "Issues"
   - Click "Set Conditions"

3. **Configure Error Rate Alert**
   ```
   Alert Name: High Error Rate
   
   Conditions:
   - When the number of events
   - Is more than 10
   - In 1 hour
   
   Filters:
   - All environments
   - All projects
   
   Action:
   - Send notification to: [Your Email]
   - Frequency: At most once every 30 minutes
   ```

4. **Save Alert**

---

### Step 2: Create Critical Error Alert

1. **Create New Alert**
   ```
   Alert Name: Critical Errors
   
   Conditions:
   - When an event is tagged with level:error
   - Occurs
   
   Filters:
   - Environment: production
   - Tags: level equals error
   
   Action:
   - Send notification to: [Your Email]
   - Frequency: Immediately
   ```

---

### Step 3: Performance Degradation Alert

1. **Select "Metric Alert"**
   ```
   Alert Name: Slow Page Load
   
   Metric:
   - avg(transaction.duration)
   
   Conditions:
   - Is above 3000ms (3 seconds)
   - For 5 minutes
   
   Filters:
   - Transaction: GET /wallet OR GET /dashboard
   
   Action:
   - Send notification to: [Your Email]
   ```

---

### Step 4: User Impact Alert

1. **Create Alert**
   ```
   Alert Name: Many Users Affected
   
   Conditions:
   - When the number of users affected by an issue
   - Is more than 5
   - In 1 hour
   
   Action:
   - Send notification to: [Your Email]
   - Create Slack notification (if configured)
   ```

---

## 📊 Dashboard Exploration Guide

### 1. **Issues Tab** (Most Important!)

**How to Access:**
```
Sentry → Issues
```

**What You'll See:**
- List of all errors in your app
- Error frequency and trends
- Affected users count
- Browser/OS breakdown

**Key Actions:**
- Click on any issue to see:
  - Full stack trace
  - User context (who experienced it)
  - Breadcrumbs (what they did before error)
  - Session replay (if enabled)

**How to Use:**
1. Sort by "Events" to see most frequent errors
2. Review stack trace to identify bug
3. Assign to team member
4. Mark as "Resolved" when fixed

---

### 2. **Performance Tab**

**How to Access:**
```
Sentry → Performance
```

**What You'll See:**
- Transaction list (page loads, API calls)
- Average response time
- Slowest transactions
- P95/P99 percentiles

**Key Metrics to Watch:**
- **P95 Response Time**: Should be < 3 seconds
- **Throughput**: Requests per minute
- **Failure Rate**: Should be < 5%
- **Apdex Score**: User satisfaction (aim for > 0.8)

**How to Use:**
1. Click "Frontend" filter to see only client-side performance
2. Sort by "P95 Duration" to find slowest pages
3. Click transaction to see detailed trace
4. Identify slow API calls or render times

---

### 3. **Releases Tab**

**How to Access:**
```
Sentry → Releases
```

**What It Does:**
- Track errors by deployment version
- See if new release introduced bugs
- Compare performance across versions

**How to Set Up:**
Add to your build/deploy:
```bash
# In your CI/CD or package.json
export SENTRY_RELEASE=$(git rev-parse HEAD)
```

Or in Next.js:
```typescript
// In sentry config
release: process.env.NEXT_PUBLIC_APP_VERSION || 'development'
```

---

### 4. **Discover Tab** (Advanced Queries)

**How to Access:**
```
Sentry → Discover → Build new query
```

**Useful Queries:**

**Query 1: Errors in Last Hour**
```
Event Type: error
Time Range: Last 1 hour
```

**Query 2: Slow Transactions**
```
Event Type: transaction
transaction.duration: >3000
```

**Query 3: Errors by User**
```
Group By: user.email
Order By: count() desc
```

---

## 🔔 Notification Setup

### Email Notifications

1. **Personal Settings**
   ```
   User Icon → User settings → Notifications
   ```

2. **Configure:**
   - ✅ Workflow notifications
   - ✅ Deploy notifications
   - ✅ Weekly reports
   - Email frequency: Real-time for critical

### Slack Integration (Recommended!)

1. **Install Slack App**
   ```
   Settings → Integrations → Slack → Install
   ```

2. **Configure Channel**
   ```
   Channel: #alerts or #errors
   Notifications: All new issues
   ```

3. **Alert Rules:**
   - New issues → #errors
   - Critical errors → #critical-alerts
   - Weekly summary → #engineering

---

## 📈 Key Metrics to Monitor Daily

### 1. **Error Rate**
- **Target**: < 1% of requests
- **Alert**: If > 5%
- **Check**: Daily in morning

### 2. **User Impact**
- **Target**: < 5 users affected per day
- **Alert**: If > 10 users
- **Check**: Before EOD

### 3. **Performance**
- **Target**: P95 < 3s
- **Alert**: If P95 > 5s
- **Check**: After each deploy

### 4. **Unresolved Issues**
- **Target**: < 10 open issues
- **Alert**: If > 20
- **Check**: Weekly review

---

## 🎯 Best Practices

### Daily Routine
```
Morning (5 min):
1. Check "Issues" tab for new errors
2. Review error rate trend
3. Triage critical issues

After Deploy (10 min):
1. Monitor dashboard for 10 minutes
2. Check for new error spikes
3. Verify performance metrics stable

Weekly (30 min):
1. Review "Weekly Report" email
2. Analyze error trends
3. Prioritize fixes for next sprint
```

### Issue Triage Process
```
For each new issue:
1. Assign severity (Critical/High/Medium/Low)
2. Estimate users affected
3. Assign to team member or mark for sprint
4. Add comment with reproduction steps
5. Link to GitHub issue if needed
```

---

## 🚀 Production Deployment Checklist

### Before Launch:
- [ ] Verify Sentry DSN in production env vars
- [ ] Set up critical error alerts
- [ ] Configure Slack notifications
- [ ] Set performance budgets in alerts
- [ ] Test that errors are captured
- [ ] Enable session replay for production

### After Launch:
- [ ] Monitor dashboard for first 24 hours
- [ ] Check error rate stays < 1%
- [ ] Verify users experiencing smooth performance
- [ ] Review any new issues immediately
- [ ] Send status update to team

---

## 🔍 Advanced Features to Explore

### 1. **Session Replay**
- Watch user sessions before errors
- See exactly what user clicked
- Debug UI issues visually

**How to View:**
```
Issues → Click on issue → Session Replay tab
```

### 2. **Breadcrumbs**
- See sequence of events before error
- Track user navigation path
- Understand error context

**Already Configured:** ✅ Working in your test!

### 3. **Release Health**
- Track crash-free sessions per release
- Compare versions
- Identify problematic deploys

**Set Up:**
```typescript
// In your deploy script
sentry-cli releases new $VERSION
sentry-cli releases set-commits $VERSION --auto
```

### 4. **Custom Tags**
- Tag errors by feature area
- Filter by user tier (free/paid)
- Track A/B test variants

**Example:**
```typescript
Sentry.setTags({
  feature: 'wallet',
  user_tier: 'premium',
  ab_test: 'variant_a'
});
```

---

## 📱 Mobile App

**Download Sentry Mobile App:**
- iOS: App Store
- Android: Google Play

**Benefits:**
- Get push notifications for critical errors
- Review issues on the go
- Quick triage from phone

---

## 💡 Pro Tips

1. **Create Saved Searches**
   - Save your common queries in Discover
   - Quick access to important metrics

2. **Use Issue Grouping**
   - Sentry groups similar errors
   - Review fingerprinting if too many duplicates

3. **Set Up Source Maps**
   - Already configured in next.config.js ✅
   - Enables readable stack traces

4. **Monitor Third-Party APIs**
   - Track external API failures
   - Set up alerts for payment gateway errors

5. **Regular Cleanup**
   - Archive resolved issues monthly
   - Review and merge duplicate issues

---

## 🎓 Learning Resources

**Sentry Docs:**
- https://docs.sentry.io/platforms/javascript/guides/nextjs/

**Best Practices:**
- https://docs.sentry.io/product/alerts/best-practices/

**Performance Monitoring:**
- https://docs.sentry.io/product/performance/

**Video Tutorials:**
- https://www.youtube.com/c/Sentry

---

## ✅ Quick Wins (Do These Now!)

1. **Set up High Error Rate alert** (5 min)
2. **Configure Slack integration** (10 min)
3. **Create saved search for your top errors** (2 min)
4. **Download mobile app** (3 min)
5. **Share dashboard link with team** (1 min)

---

## 🎯 Your Current Status

Based on what I see in your dashboard:

✅ **Working Perfectly:**
- Error tracking (7 events, 5 issues)
- Performance monitoring (High throughput transactions)
- User tracking (2 users experiencing slow transactions)
- Browser tracking (Chrome detected)

⚠️ **Recommendations:**
1. Set up alerts (critical for production)
2. Configure Slack notifications  
3. Review the 5 issues and mark as resolved if they're test errors
4. Monitor failure rate (currently 3.78% - good!)

---

## 📞 Support

**Sentry Support:**
- Community Forum: https://forum.sentry.io/
- Discord: https://discord.gg/sentry
- Status Page: https://status.sentry.io/

**Your Dashboard:**
- https://o4510407588315136.sentry.io/

---

**You're all set!** 🎉 

Your monitoring is production-ready. Set up those alerts and you'll have enterprise-grade error tracking!
