# Backend Team: Weekly ROS Summary Endpoint - Implementation Required

**Priority:** 🔴 **HIGH**  
**Status:** ⏳ **AWAITING BACKEND IMPLEMENTATION**  
**Date:** January 2025

---

## 🎯 Quick Summary

The frontend needs a new endpoint `/api/analytics/weekly-summary` to display the Weekly ROS card on the user dashboard. The frontend is **fully implemented and ready**, but the endpoint currently returns 404.

---

## 📋 What You Need to Do

**Implement:** `GET /api/analytics/weekly-summary`

**Returns:** User's weekly ROS (Return on Stake) performance for the current week

**Authentication:** Required (Bearer token from user login)

---

## 🔑 Key Requirements

### **1. Weekly ROS Source**

- ✅ Get from `rosCalendar.totalWeeklyPercentage` (admin-declared at start of week)
- ❌ **DO NOT** calculate by summing daily percentages
- ❌ **DO NOT** calculate as average

### **2. Display Timing Rules (CRITICAL)**

- **Weekly ROS**: Only show at end of week (return `0.00` during week, even though predetermined)
- **Daily Profit**: Only show at close of that day
- **During Week**: Only include completed days in `dailyBreakdown`
- **At End of Week**: Include all 7 days

### **3. ROS is Stake-Only**

- ✅ Include: Stake returns only
- ❌ Exclude: Referrals, bonuses, pool distributions, or any other earnings

### **4. Week Format**

- Monday-Sunday weeks (not Sunday-Saturday)
- Week starts Monday 00:00:00
- Week ends Sunday 23:59:59

---

## 📊 Response Format

```json
{
  "success": true,
  "data": {
    "weekNumber": 51,
    "year": 2025,
    "startDate": "2024-12-16T00:00:00.000Z",
    "endDate": "2024-12-22T23:59:59.999Z",
    "totalEarnings": 38.5,
    "weeklyRos": 3.85,
    "status": "pending",
    "dailyBreakdown": [
      {
        "date": "2024-12-16T00:00:00.000Z",
        "dayOfWeek": "Monday",
        "ros": 1.12,
        "earnings": 11.2
      }
      // ... more days
    ]
  }
}
```

**Important:**

- `weeklyRos`: `0.00` during week, actual value at end of week
- `dailyBreakdown`: Only completed days during week, all 7 days at end

---

## 📚 Complete Documentation

**Full Implementation Guide:**

- `BACKEND_WEEKLY_ROS_SUMMARY_IMPLEMENTATION_GUIDE.md` - Complete step-by-step guide with code examples

**Additional Documentation:**

- `BACKEND_WEEKLY_ROS_SUMMARY_API_SPECIFICATION.md` - Detailed API specification
- `WEEKLY_ROS_CARD_COMPLETE_ANALYSIS.md` - Complete analysis of the card

---

## ✅ Implementation Checklist

- [ ] Create endpoint `GET /api/analytics/weekly-summary`
- [ ] Get weekly ROS from `rosCalendar.totalWeeklyPercentage` (NOT calculated)
- [ ] Get user's total active stake amount
- [ ] Build daily breakdown (7 days) with ROS % and earnings
- [ ] Filter to only completed days during week
- [ ] Apply display timing rules (weekly ROS only at end of week)
- [ ] Calculate total earnings (stake returns only)
- [ ] Return response in exact format specified
- [ ] Test with complete week, incomplete week, no stakes scenarios

---

## 🧪 Quick Test

**Test Scenario:** User with $1,000 active stake, Wednesday during the day

**Expected:**

- `weeklyRos`: `0.00` (not shown until end of week)
- `dailyBreakdown`: Only Monday and Tuesday (completed days)
- `totalEarnings`: Sum of Monday + Tuesday earnings only

---

## 🆘 Need Help?

All details, code examples, and test cases are in:

- **`BACKEND_WEEKLY_ROS_SUMMARY_IMPLEMENTATION_GUIDE.md`** (833 lines, complete guide)

---

**Status:** ⏳ **AWAITING BACKEND IMPLEMENTATION**  
**Frontend Status:** ✅ **READY**
