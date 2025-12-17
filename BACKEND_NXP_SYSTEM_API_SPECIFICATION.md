# Backend API Specification: NXP (Novunt Experience Points) System

**Date:** January 2025  
**Status:** 🔨 **REQUIRED FOR IMPLEMENTATION**  
**Priority:** High  
**Frontend Status:** ✅ Ready - Waiting for Backend Implementation

---

## 🎯 Overview

The NXP (Novunt Experience Points) system is a gamification feature that rewards users with experience points for various achievements and activities. This document specifies all required API endpoints and data structures needed to power the Achievement Page frontend.

---

## 📋 Required Endpoints

### **1. Get User's NXP Balance**

**Endpoint:** `GET /api/v1/nxp/me`  
**Authentication:** Required (Bearer Token)  
**Description:** Returns the user's current NXP balance, level, progress to next level, and breakdown by source.

### **2. Get NXP Transaction History**

**Endpoint:** `GET /api/v1/nxp/me/history`  
**Authentication:** Required (Bearer Token)  
**Description:** Returns paginated list of NXP transactions (earnings history).

### **3. Get NXP Leaderboard**

**Endpoint:** `GET /api/v1/nxp/leaderboard`  
**Authentication:** Optional (Bearer Token - if provided, includes user's position)  
**Description:** Returns top users by NXP with optional user position.

---

## 🔧 Endpoint #1: Get User's NXP Balance

### **Request**

```http
GET /api/v1/nxp/me
Authorization: Bearer {token}
Content-Type: application/json
```

### **Response Structure**

```json
{
  "success": true,
  "data": {
    "totalNXP": 1250,
    "nxpLevel": 4,
    "nxpToNextLevel": 150,
    "totalNxpEarned": 1250,
    "breakdown": {
      "fromBadges": 800,
      "fromRanks": 350,
      "fromMilestones": 100,
      "fromActivities": 0
    }
  },
  "meta": {
    "response_time_ms": 45
  }
}
```

### **Field Specifications**

| Field                      | Type   | Required | Description                                                     |
| -------------------------- | ------ | -------- | --------------------------------------------------------------- |
| `totalNXP`                 | number | ✅       | Total NXP currently owned by user (cumulative, never decreases) |
| `nxpLevel`                 | number | ✅       | Current NXP level (calculated from totalNXP)                    |
| `nxpToNextLevel`           | number | ✅       | NXP needed to reach next level                                  |
| `totalNxpEarned`           | number | ✅       | Total NXP ever earned (same as totalNXP, for consistency)       |
| `breakdown.fromBadges`     | number | ✅       | NXP earned from unlocking badges                                |
| `breakdown.fromRanks`      | number | ✅       | NXP earned from rank upgrades                                   |
| `breakdown.fromMilestones` | number | ✅       | NXP earned from reaching milestones                             |
| `breakdown.fromActivities` | number | ✅       | NXP earned from daily/weekly activities                         |

### **Level Calculation Formula**

The NXP level should be calculated using this formula:

```typescript
// Level formula: level = floor(sqrt(totalNXP / 100)) + 1
// Minimum level is 1

function calculateLevel(totalNXP: number): number {
  if (totalNXP <= 0) return 1;
  return Math.floor(Math.sqrt(totalNXP / 100)) + 1;
}

// Example calculations:
// 0 NXP = Level 1
// 100 NXP = Level 2 (sqrt(1) = 1, floor = 1, +1 = 2)
// 400 NXP = Level 3 (sqrt(4) = 2, floor = 2, +1 = 3)
// 900 NXP = Level 4 (sqrt(9) = 3, floor = 3, +1 = 4)
// 1600 NXP = Level 5 (sqrt(16) = 4, floor = 4, +1 = 5)
```

### **NXP to Next Level Calculation**

```typescript
function calculateNXPToNextLevel(
  totalNXP: number,
  currentLevel: number
): number {
  const nextLevelNXP = Math.pow(currentLevel, 2) * 100;
  return Math.max(0, nextLevelNXP - totalNXP);
}

// Example:
// Level 4: Need 1600 NXP total
// User has 1250 NXP
// nxpToNextLevel = 1600 - 1250 = 350
```

### **Breakdown Calculation**

The breakdown should sum all NXP transactions by source type:

- `fromBadges`: Sum of all NXP where `source = 'badge'`
- `fromRanks`: Sum of all NXP where `source = 'rank'`
- `fromMilestones`: Sum of all NXP where `source = 'milestone'`
- `fromActivities`: Sum of all NXP where `source = 'activity'`

### **Error Responses**

```json
{
  "success": false,
  "message": "Unauthorized",
  "statusCode": 401
}
```

---

## 🔧 Endpoint #2: Get NXP Transaction History

### **Request**

```http
GET /api/v1/nxp/me/history?page=1&limit=20
Authorization: Bearer {token}
Content-Type: application/json
```

### **Query Parameters**

| Parameter | Type   | Required | Default | Description              |
| --------- | ------ | -------- | ------- | ------------------------ |
| `page`    | number | ❌       | 1       | Page number (1-indexed)  |
| `limit`   | number | ❌       | 20      | Items per page (max 100) |

### **Response Structure**

```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "amount": 75,
        "source": "badge",
        "sourceName": "First Stake Badge",
        "description": "Earned 75 NXP for unlocking First Stake Badge",
        "metadata": {
          "badgeType": "first_stake",
          "badgeRarity": "rare"
        },
        "createdAt": "2024-01-15T10:30:00.000Z"
      },
      {
        "_id": "507f1f77bcf86cd799439012",
        "amount": 200,
        "source": "rank",
        "sourceName": "Associate Stakeholder",
        "description": "Earned 200 NXP for upgrading to Associate Stakeholder",
        "metadata": {
          "rankName": "Associate Stakeholder"
        },
        "createdAt": "2024-01-14T08:15:00.000Z"
      },
      {
        "_id": "507f1f77bcf86cd799439013",
        "amount": 50,
        "source": "milestone",
        "sourceName": "First $1000 Staked",
        "description": "Earned 50 NXP for reaching milestone: First $1000 Staked",
        "metadata": {
          "milestoneType": "staking_amount",
          "milestoneValue": 1000
        },
        "createdAt": "2024-01-13T14:20:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  },
  "meta": {
    "response_time_ms": 62
  }
}
```

### **Field Specifications**

#### **Transaction Object**

| Field         | Type   | Required | Description                                                                            |
| ------------- | ------ | -------- | -------------------------------------------------------------------------------------- |
| `_id`         | string | ✅       | Unique transaction ID                                                                  |
| `amount`      | number | ✅       | NXP amount earned (always positive)                                                    |
| `source`      | string | ✅       | Source type: `'badge'`, `'rank'`, `'milestone'`, `'activity'`, or `'bonus'`            |
| `sourceName`  | string | ✅       | Human-readable name of the source (e.g., "First Stake Badge", "Associate Stakeholder") |
| `description` | string | ✅       | Full description of how NXP was earned                                                 |
| `metadata`    | object | ✅       | Additional context (see metadata specifications below)                                 |
| `createdAt`   | string | ✅       | ISO 8601 timestamp of when NXP was earned                                              |

#### **Metadata Specifications**

**For Badge Source:**

```json
{
  "badgeType": "first_stake",
  "badgeRarity": "rare"
}
```

**For Rank Source:**

```json
{
  "rankName": "Associate Stakeholder"
}
```

**For Milestone Source:**

```json
{
  "milestoneType": "staking_amount",
  "milestoneValue": 1000
}
```

**For Activity Source:**

```json
{
  "activityType": "daily_login",
  "streak": 7
}
```

**For Bonus Source:**

```json
{
  "bonusType": "referral_bonus",
  "referralId": "507f1f77bcf86cd799439014"
}
```

#### **Pagination Object**

| Field        | Type   | Required | Description                  |
| ------------ | ------ | -------- | ---------------------------- |
| `page`       | number | ✅       | Current page number          |
| `limit`      | number | ✅       | Items per page               |
| `total`      | number | ✅       | Total number of transactions |
| `totalPages` | number | ✅       | Total number of pages        |

### **Sorting**

Transactions should be sorted by:

1. `createdAt` DESC (newest first)
2. `_id` DESC (as tiebreaker)

### **Error Responses**

```json
{
  "success": false,
  "message": "Invalid page number",
  "statusCode": 400
}
```

---

## 🔧 Endpoint #3: Get NXP Leaderboard

### **Request**

```http
GET /api/v1/nxp/leaderboard?limit=50
Authorization: Bearer {token}  # Optional - if provided, includes user position
Content-Type: application/json
```

### **Query Parameters**

| Parameter | Type   | Required | Default | Description                             |
| --------- | ------ | -------- | ------- | --------------------------------------- |
| `limit`   | number | ❌       | 50      | Number of top users to return (max 100) |

### **Response Structure**

```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "position": 1,
        "userId": "507f1f77bcf86cd799439015",
        "username": "elite_trader",
        "fname": "John",
        "lname": "Doe",
        "totalNXP": 12500,
        "nxpLevel": 12,
        "rank": "Elite Capitalist"
      },
      {
        "position": 2,
        "userId": "507f1f77bcf86cd799439016",
        "username": "crypto_master",
        "fname": "Jane",
        "lname": "Smith",
        "totalNXP": 11200,
        "nxpLevel": 11,
        "rank": "Wealth Architect"
      },
      {
        "position": 3,
        "userId": "507f1f77bcf86cd799439017",
        "username": "stake_king",
        "fname": "Bob",
        "lname": "Johnson",
        "totalNXP": 9800,
        "nxpLevel": 10,
        "rank": "Principal Strategist"
      }
    ],
    "userPosition": 25
  },
  "meta": {
    "response_time_ms": 85
  }
}
```

### **Field Specifications**

#### **Leaderboard Entry Object**

| Field      | Type   | Required | Description                                                            |
| ---------- | ------ | -------- | ---------------------------------------------------------------------- |
| `position` | number | ✅       | User's position in leaderboard (1 = first place)                       |
| `userId`   | string | ✅       | User's unique ID                                                       |
| `username` | string | ✅       | User's username                                                        |
| `fname`    | string | ❌       | User's first name (if available)                                       |
| `lname`    | string | ❌       | User's last name (if available)                                        |
| `totalNXP` | number | ✅       | User's total NXP                                                       |
| `nxpLevel` | number | ✅       | User's current NXP level                                               |
| `rank`     | string | ✅       | User's current platform rank (e.g., "Stakeholder", "Elite Capitalist") |

#### **User Position**

| Field          | Type           | Required | Description                                                                             |
| -------------- | -------------- | -------- | --------------------------------------------------------------------------------------- |
| `userPosition` | number \| null | ✅       | Current user's position in leaderboard (null if not authenticated or user not in top N) |

### **Sorting**

Leaderboard should be sorted by:

1. `totalNXP` DESC (highest first)
2. `createdAt` ASC (earlier registration = tiebreaker)
3. `userId` ASC (final tiebreaker)

### **Privacy Considerations**

- Only include users who have opted into leaderboard visibility (if applicable)
- Consider excluding banned/suspended users
- Respect user privacy settings

### **Error Responses**

```json
{
  "success": false,
  "message": "Invalid limit parameter",
  "statusCode": 400
}
```

---

## 🔄 NXP Awarding Logic

### **When to Award NXP**

NXP should be automatically awarded when:

1. **Badge Unlocked:**
   - Common Badge: +25 NXP
   - Rare Badge: +75 NXP
   - Epic Badge: +150 NXP
   - Legendary Badge: +400 NXP

2. **Rank Upgraded:**
   - Stakeholder → Associate Stakeholder: +200 NXP
   - Associate Stakeholder → Principal Strategist: +300 NXP
   - Principal Strategist → Elite Capitalist: +400 NXP
   - Elite Capitalist → Wealth Architect: +500 NXP
   - Wealth Architect → Finance Titan: +600 NXP

3. **Milestone Reached:**
   - First $100 staked: +25 NXP
   - First $1,000 staked: +50 NXP
   - First $10,000 staked: +100 NXP
   - First referral: +25 NXP
   - 10 referrals: +75 NXP
   - 50 referrals: +150 NXP

4. **Activities (Optional - Future):**
   - Daily login streak: +5 NXP per day
   - Weekly challenge completion: +50 NXP

### **Transaction Creation**

When awarding NXP, create a transaction record:

```typescript
interface NXPTransaction {
  userId: string;
  amount: number;
  source: 'badge' | 'rank' | 'milestone' | 'activity' | 'bonus';
  sourceName: string;
  description: string;
  metadata: Record<string, any>;
  createdAt: Date;
}
```

### **Important Rules**

1. **NXP Never Decreases:** Once earned, NXP cannot be lost or deducted
2. **One-Time Awards:** Badges and rank upgrades award NXP only once
3. **Cumulative:** Total NXP is the sum of all transactions
4. **Real-Time Updates:** NXP should be calculated in real-time, not cached

---

## 📊 Database Schema Recommendations

### **NXP Transactions Collection**

```javascript
{
  _id: ObjectId,
  userId: ObjectId, // Reference to User
  amount: Number, // Always positive
  source: String, // 'badge', 'rank', 'milestone', 'activity', 'bonus'
  sourceName: String, // Human-readable name
  description: String, // Full description
  metadata: {
    badgeType: String, // If source is 'badge'
    badgeRarity: String, // If source is 'badge'
    rankName: String, // If source is 'rank'
    milestoneType: String, // If source is 'milestone'
    milestoneValue: Number, // If source is 'milestone'
    // ... other fields as needed
  },
  createdAt: Date,
  // Indexes:
  // - userId + createdAt (for user history)
  // - userId + source (for breakdown calculations)
  // - createdAt (for leaderboard sorting)
}
```

### **User NXP Summary (Optional - for performance)**

```javascript
{
  userId: ObjectId,
  totalNXP: Number, // Cached total (sum of all transactions)
  lastCalculated: Date, // When total was last recalculated
  // Note: Can be recalculated from transactions if needed
}
```

---

## 🧪 Testing Scenarios

### **Test Case 1: New User (No NXP)**

**Request:**

```http
GET /api/v1/nxp/me
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "totalNXP": 0,
    "nxpLevel": 1,
    "nxpToNextLevel": 100,
    "totalNxpEarned": 0,
    "breakdown": {
      "fromBadges": 0,
      "fromRanks": 0,
      "fromMilestones": 0,
      "fromActivities": 0
    }
  }
}
```

### **Test Case 2: User with Multiple NXP Sources**

**Request:**

```http
GET /api/v1/nxp/me
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "totalNXP": 1250,
    "nxpLevel": 4,
    "nxpToNextLevel": 350,
    "totalNxpEarned": 1250,
    "breakdown": {
      "fromBadges": 800,
      "fromRanks": 350,
      "fromMilestones": 100,
      "fromActivities": 0
    }
  }
}
```

### **Test Case 3: NXP History Pagination**

**Request:**

```http
GET /api/v1/nxp/me/history?page=1&limit=10
```

**Expected Response:**

- Returns 10 most recent transactions
- Pagination shows correct total and totalPages

### **Test Case 4: Leaderboard with User Position**

**Request:**

```http
GET /api/v1/nxp/leaderboard?limit=10
Authorization: Bearer {user_token}
```

**Expected Response:**

- Returns top 10 users
- Includes `userPosition` if user is not in top 10

---

## ✅ Implementation Checklist

### **Phase 1: Core NXP System**

- [ ] Create NXP transactions collection/schema
- [ ] Implement NXP awarding logic for badges
- [ ] Implement NXP awarding logic for rank upgrades
- [ ] Implement NXP awarding logic for milestones
- [ ] Create transaction records when NXP is awarded

### **Phase 2: API Endpoints**

- [ ] Implement `GET /api/v1/nxp/me` endpoint
- [ ] Implement level calculation logic
- [ ] Implement breakdown calculation
- [ ] Implement `GET /api/v1/nxp/me/history` endpoint
- [ ] Implement pagination for history
- [ ] Implement `GET /api/v1/nxp/leaderboard` endpoint
- [ ] Implement user position calculation

### **Phase 3: Integration**

- [ ] Integrate NXP awarding with badge system
- [ ] Integrate NXP awarding with rank system
- [ ] Integrate NXP awarding with milestone system
- [ ] Add indexes for performance
- [ ] Add caching if needed (with invalidation)

### **Phase 4: Testing**

- [ ] Test with new users (0 NXP)
- [ ] Test with users who have earned NXP
- [ ] Test pagination edge cases
- [ ] Test leaderboard sorting
- [ ] Test error handling
- [ ] Test authentication/authorization

---

## 🚨 Important Notes

### **Performance Considerations**

1. **Indexes:** Ensure proper indexes on:
   - `userId + createdAt` for history queries
   - `totalNXP` for leaderboard queries
   - `userId + source` for breakdown calculations

2. **Caching:** Consider caching:
   - User's total NXP (with invalidation on new transactions)
   - Leaderboard top 100 (refresh every 5-10 minutes)

3. **Aggregation:** Use database aggregation for:
   - Total NXP calculation
   - Breakdown by source
   - Leaderboard ranking

### **Data Consistency**

- NXP transactions should be created atomically with the action that triggers them
- Use database transactions to ensure consistency
- Recalculate totals if needed (from transactions, not cached values)

### **Security**

- All endpoints require authentication (except leaderboard, which is optional)
- Users can only view their own NXP data
- Leaderboard should respect privacy settings
- Validate all input parameters

---

## 📚 Related Documentation

- **Achievement System:** See `FRONTEND_ACHIEVEMENT_PAGE_INTEGRATION_GUIDE.md`
- **Badge System:** See achievement system documentation
- **Rank System:** See rank progress documentation

---

## 🆘 Support

### **Questions?**

- **API Structure:** Check this document
- **Frontend Integration:** Check `FRONTEND_ACHIEVEMENT_PAGE_INTEGRATION_GUIDE.md`
- **Testing:** Use the test scenarios above

### **Example API Calls**

```bash
# Get NXP Balance
curl -X GET http://localhost:5000/api/v1/nxp/me \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Get NXP History
curl -X GET "http://localhost:5000/api/v1/nxp/me/history?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Get Leaderboard
curl -X GET "http://localhost:5000/api/v1/nxp/leaderboard?limit=50" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

---

**Last Updated:** January 2025  
**Status:** 🔨 **READY FOR BACKEND IMPLEMENTATION**
