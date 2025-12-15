# Backend Implementation Guide: NXP Calculation from Badges

**Priority:** 🔴 **HIGH**  
**Status:** ⏳ **AWAITING BACKEND IMPLEMENTATION**  
**Date:** January 2025

---

## 🎯 Problem Statement

The frontend is currently showing **0 NXP** for users who have earned badges. The backend NXP system needs to:

1. **Calculate NXP from earned badges** based on their rarity
2. **Award NXP automatically** when badges are earned
3. **Calculate user levels** from total NXP
4. **Track NXP history** (transactions)
5. **Provide accurate NXP balance** via the `/api/v1/nxp/me` endpoint

---

## 📋 Current Frontend Workaround

The frontend has implemented a **temporary calculation** that computes NXP from earned badges:

```typescript
// Frontend temporary calculation (to be removed once backend is ready)
const nxpByRarity = {
  common: 25,
  rare: 75,
  epic: 150,
  legendary: 400,
};

// Calculates total NXP from all earned badges
const totalNXP = earnedBadges.reduce((total, badge) => {
  return total + (nxpByRarity[badge.rarity] || 25);
}, 0);
```

**This is a temporary solution.** The backend must implement the proper NXP system so the frontend can remove this workaround.

---

## ✅ What Backend Needs to Implement

### 1. **NXP Award System for Badges**

When a user earns a badge, the backend must:

1. **Award NXP immediately** based on badge rarity
2. **Create an NXP transaction** record
3. **Update user's total NXP**
4. **Recalculate user's level**
5. **Update NXP breakdown** (fromBadges count)

#### NXP Amounts by Badge Rarity

| Badge Rarity | NXP Awarded |
| ------------ | ----------- |
| `common`     | **25 NXP**  |
| `rare`       | **75 NXP**  |
| `epic`       | **150 NXP** |
| `legendary`  | **400 NXP** |

**Important:** These values must match exactly what the frontend expects.

---

### 2. **NXP Level Calculation Formula**

The level calculation uses this formula:

```javascript
// Calculate level from total NXP
nxpLevel = Math.floor(Math.sqrt(totalNXP / 100)) + 1;

// Calculate NXP needed for next level
currentLevelNXP = Math.pow(nxpLevel - 1, 2) * 100;
nextLevelNXP = Math.pow(nxpLevel, 2) * 100;
nxpToNextLevel = Math.max(0, nextLevelNXP - totalNXP);
```

**Example:**

- **0-99 NXP** → Level 1 (need 100 for Level 2)
- **100-399 NXP** → Level 2 (need 400 for Level 3)
- **400-899 NXP** → Level 3 (need 900 for Level 4)
- **900-1599 NXP** → Level 4 (need 1600 for Level 5)

**Formula Breakdown:**

- Level 1: `sqrt(0/100) + 1 = 1`
- Level 2: `sqrt(100/100) + 1 = 2`
- Level 3: `sqrt(400/100) + 1 = 3`
- Level 4: `sqrt(900/100) + 1 = 4`

---

### 3. **NXP Transaction Record Structure**

When awarding NXP from a badge, create a transaction record:

```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  amount: number,              // NXP amount (25, 75, 150, or 400)
  source: 'badge',             // Source type
  sourceName: string,          // Badge title (e.g., "First Stake Badge")
  description: string,         // "Earned [Badge Title] badge"
  metadata: {
    badgeType: string,          // Badge type identifier
    badgeRarity: string,        // 'common', 'rare', 'epic', 'legendary'
    badgeIcon: string,          // Badge icon emoji
    awardedAt: string          // ISO 8601 timestamp
  },
  createdAt: string,           // ISO 8601 timestamp
  updatedAt: string            // ISO 8601 timestamp
}
```

---

### 4. **User NXP Balance Schema**

Each user must have an NXP balance document:

```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  totalNXP: number,            // Total NXP ever earned
  nxpLevel: number,            // Current level (calculated)
  nxpToNextLevel: number,      // NXP needed for next level
  totalNxpEarned: number,      // Same as totalNXP (for consistency)
  breakdown: {
    fromBadges: number,        // Total NXP from badges
    fromRanks: number,         // Total NXP from rank upgrades
    fromMilestones: number,    // Total NXP from milestones
    fromActivities: number     // Total NXP from activities
  },
  lastCalculatedAt: string,    // ISO 8601 timestamp
  createdAt: string,
  updatedAt: string
}
```

---

### 5. **Backend Endpoint Requirements**

#### **GET `/api/v1/nxp/me`** - NXP Balance

**Response Structure:**

```json
{
  "success": true,
  "data": {
    "totalNXP": 150,
    "nxpLevel": 2,
    "nxpToNextLevel": 250,
    "totalNxpEarned": 150,
    "breakdown": {
      "fromBadges": 150,
      "fromRanks": 0,
      "fromMilestones": 0,
      "fromActivities": 0
    }
  },
  "meta": {
    "response_time_ms": 45
  }
}
```

**Calculation Logic:**

1. Sum all NXP transactions for the user
2. Group by `source` to calculate breakdown
3. Calculate level from `totalNXP`
4. Calculate `nxpToNextLevel`

---

### 6. **Badge Awarding Integration**

When a badge is awarded (existing badge system), add this logic:

```javascript
// Pseudo-code for badge awarding
async function awardBadge(userId, badge) {
  // 1. Award the badge (existing logic)
  await BadgeModel.create({
    userId,
    badgeType: badge.badgeType,
    title: badge.title,
    rarity: badge.rarity,
    // ... other badge fields
  });

  // 2. Calculate NXP amount based on rarity
  const nxpAmounts = {
    common: 25,
    rare: 75,
    epic: 150,
    legendary: 400,
  };
  const nxpAmount = nxpAmounts[badge.rarity] || 25;

  // 3. Create NXP transaction
  await NXPTransactionModel.create({
    userId,
    amount: nxpAmount,
    source: 'badge',
    sourceName: badge.title,
    description: `Earned ${badge.title} badge`,
    metadata: {
      badgeType: badge.badgeType,
      badgeRarity: badge.rarity,
      badgeIcon: badge.icon,
      awardedAt: new Date().toISOString(),
    },
  });

  // 4. Update user's NXP balance
  await updateUserNXPBalance(userId);
}

async function updateUserNXPBalance(userId) {
  // Sum all transactions
  const transactions = await NXPTransactionModel.find({ userId });
  const totalNXP = transactions.reduce((sum, t) => sum + t.amount, 0);

  // Calculate breakdown
  const breakdown = {
    fromBadges: transactions
      .filter((t) => t.source === 'badge')
      .reduce((sum, t) => sum + t.amount, 0),
    fromRanks: transactions
      .filter((t) => t.source === 'rank')
      .reduce((sum, t) => sum + t.amount, 0),
    fromMilestones: transactions
      .filter((t) => t.source === 'milestone')
      .reduce((sum, t) => sum + t.amount, 0),
    fromActivities: transactions
      .filter((t) => t.source === 'activity')
      .reduce((sum, t) => sum + t.amount, 0),
  };

  // Calculate level
  const nxpLevel = Math.floor(Math.sqrt(totalNXP / 100)) + 1;
  const nextLevelNXP = Math.pow(nxpLevel, 2) * 100;
  const nxpToNextLevel = Math.max(0, nextLevelNXP - totalNXP);

  // Update or create balance document
  await NXPBalanceModel.findOneAndUpdate(
    { userId },
    {
      totalNXP,
      nxpLevel,
      nxpToNextLevel,
      totalNxpEarned: totalNXP,
      breakdown,
      lastCalculatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    { upsert: true, new: true }
  );
}
```

---

### 7. **Migration: Sync Existing Badges to NXP**

**CRITICAL:** Users who already have badges need their NXP calculated retroactively.

#### Migration Script Required

```javascript
// Migration script to sync existing badges to NXP
async function syncExistingBadgesToNXP() {
  const users = await UserModel.find({});

  for (const user of users) {
    // Get all earned badges for user
    const earnedBadges = await BadgeModel.find({
      userId: user._id,
      // Add any filters for "earned" status
    });

    const nxpAmounts = {
      common: 25,
      rare: 75,
      epic: 150,
      legendary: 400,
    };

    // Create NXP transactions for each badge
    for (const badge of earnedBadges) {
      const nxpAmount = nxpAmounts[badge.rarity] || 25;

      // Check if transaction already exists
      const existingTransaction = await NXPTransactionModel.findOne({
        userId: user._id,
        source: 'badge',
        'metadata.badgeType': badge.badgeType,
      });

      if (!existingTransaction) {
        await NXPTransactionModel.create({
          userId: user._id,
          amount: nxpAmount,
          source: 'badge',
          sourceName: badge.title,
          description: `Earned ${badge.title} badge`,
          metadata: {
            badgeType: badge.badgeType,
            badgeRarity: badge.rarity,
            badgeIcon: badge.icon,
            awardedAt: badge.awardedAt || badge.createdAt,
          },
          createdAt: badge.awardedAt || badge.createdAt,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    // Update user's NXP balance
    await updateUserNXPBalance(user._id);
  }
}
```

**Run this migration once** to sync all existing badges to NXP.

---

### 8. **Database Schema Recommendations**

#### **NXP Transactions Collection**

```javascript
{
  _id: ObjectId,
  userId: { type: ObjectId, required: true, index: true },
  amount: { type: Number, required: true },
  source: {
    type: String,
    required: true,
    enum: ['badge', 'rank', 'milestone', 'activity', 'bonus'],
    index: true
  },
  sourceName: { type: String, required: true },
  description: { type: String, required: true },
  metadata: {
    badgeType: String,
    badgeRarity: String,
    badgeIcon: String,
    rankName: String,
    milestoneType: String,
    [key: string]: any
  },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
}
```

**Indexes:**

- `userId` (for fast user queries)
- `userId + createdAt` (for history pagination)
- `source` (for breakdown calculations)

#### **NXP Balance Collection**

```javascript
{
  _id: ObjectId,
  userId: { type: ObjectId, required: true, unique: true, index: true },
  totalNXP: { type: Number, required: true, default: 0 },
  nxpLevel: { type: Number, required: true, default: 1 },
  nxpToNextLevel: { type: Number, required: true, default: 100 },
  totalNxpEarned: { type: Number, required: true, default: 0 },
  breakdown: {
    fromBadges: { type: Number, default: 0 },
    fromRanks: { type: Number, default: 0 },
    fromMilestones: { type: Number, default: 0 },
    fromActivities: { type: Number, default: 0 }
  },
  lastCalculatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

**Indexes:**

- `userId` (unique, for fast lookups)
- `totalNXP` (for leaderboard queries)

---

### 9. **Testing Scenarios**

#### **Test Case 1: New Badge Award**

**Given:** User has 0 NXP  
**When:** User earns a "common" badge  
**Then:**

- NXP transaction created with `amount: 25`
- User's `totalNXP` = 25
- User's `nxpLevel` = 1
- User's `nxpToNextLevel` = 75
- User's `breakdown.fromBadges` = 25

#### **Test Case 2: Multiple Badges**

**Given:** User has 0 NXP  
**When:** User earns:

- 1 common badge (25 NXP)
- 1 rare badge (75 NXP)
- 1 epic badge (150 NXP)

**Then:**

- `totalNXP` = 250
- `nxpLevel` = 2 (sqrt(250/100) + 1 = 2)
- `nxpToNextLevel` = 150 (400 - 250)
- `breakdown.fromBadges` = 250

#### **Test Case 3: Level Up**

**Given:** User has 99 NXP (Level 1)  
**When:** User earns a common badge (25 NXP)  
**Then:**

- `totalNXP` = 124
- `nxpLevel` = 2 (sqrt(124/100) + 1 = 2)
- `nxpToNextLevel` = 276 (400 - 124)

#### **Test Case 4: Migration of Existing Badges**

**Given:** User has 3 earned badges:

- 1 common (25 NXP)
- 1 rare (75 NXP)
- 1 epic (150 NXP)

**When:** Migration script runs  
**Then:**

- 3 NXP transactions created
- `totalNXP` = 250
- `nxpLevel` = 2
- `breakdown.fromBadges` = 250

---

### 10. **API Endpoint Implementation Details**

#### **GET `/api/v1/nxp/me`**

**Implementation:**

```javascript
async function getNXPBalance(req, res) {
  try {
    const userId = req.user._id;

    // Get or create balance
    let balance = await NXPBalanceModel.findOne({ userId });

    if (!balance) {
      // Initialize balance if doesn't exist
      balance = await initializeNXPBalance(userId);
    }

    // Return formatted response
    return res.status(200).json({
      success: true,
      data: {
        totalNXP: balance.totalNXP,
        nxpLevel: balance.nxpLevel,
        nxpToNextLevel: balance.nxpToNextLevel,
        totalNxpEarned: balance.totalNxpEarned,
        breakdown: balance.breakdown,
      },
      meta: {
        response_time_ms: Date.now() - startTime,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch NXP balance',
      error: error.message,
    });
  }
}
```

---

### 11. **Performance Considerations**

1. **Cache NXP Balance:** Consider caching the balance in Redis for frequently accessed users
2. **Batch Updates:** When awarding multiple badges, batch update the balance once
3. **Background Jobs:** For migration, use background jobs to avoid blocking
4. **Indexes:** Ensure proper database indexes for fast queries

---

### 12. **Error Handling**

- **Duplicate Transactions:** Prevent duplicate NXP transactions for the same badge
- **Invalid Rarity:** Default to 25 NXP if rarity is unknown
- **Missing Balance:** Auto-initialize balance if missing
- **Calculation Errors:** Log errors but don't fail badge awarding

---

### 13. **Frontend Integration Notes**

Once backend is implemented:

1. **Frontend will remove temporary calculation** (lines 36-50 in `AchievementsSummaryCard.tsx`)
2. **Frontend will use backend data directly** from `/api/v1/nxp/me`
3. **Frontend expects exact response structure** as specified above
4. **Frontend handles 0 NXP gracefully** (shows "Coming Soon" if needed)

---

## ✅ Implementation Checklist

- [ ] **Create NXP Transaction Model** with proper schema
- [ ] **Create NXP Balance Model** with proper schema
- [ ] **Add NXP awarding logic** to badge awarding function
- [ ] **Implement level calculation** formula
- [ ] **Update `/api/v1/nxp/me` endpoint** to return correct data
- [ ] **Create migration script** to sync existing badges
- [ ] **Add database indexes** for performance
- [ ] **Test badge awarding** with NXP calculation
- [ ] **Test level calculation** at various NXP amounts
- [ ] **Test migration script** on test data
- [ ] **Verify response structure** matches frontend expectations
- [ ] **Test edge cases** (0 NXP, level boundaries, etc.)

---

## 📊 Expected Results

After implementation:

1. **Users with badges will see correct NXP** (not 0)
2. **NXP levels will calculate correctly** based on total NXP
3. **NXP breakdown will show accurate sources**
4. **NXP history will show all badge awards**
5. **Frontend can remove temporary calculation**

---

## 🆘 Questions or Issues?

If you have questions about:

- **Calculation formulas** → See Section 2
- **Database schema** → See Section 8
- **API structure** → See Section 5
- **Migration** → See Section 7
- **Testing** → See Section 9

---

## 📝 Summary

**What Backend Must Do:**

1. ✅ Award NXP when badges are earned (25/75/150/400 based on rarity)
2. ✅ Calculate user levels from total NXP (formula: `sqrt(totalNXP/100) + 1`)
3. ✅ Track NXP transactions for history
4. ✅ Update NXP balance breakdown (fromBadges, fromRanks, etc.)
5. ✅ Migrate existing badges to NXP retroactively
6. ✅ Return accurate data from `/api/v1/nxp/me` endpoint

**Priority:** 🔴 **HIGH** - Users are currently seeing incorrect NXP values (0) despite having earned badges.

**Timeline:** As soon as possible to provide accurate user experience.

---

**Last Updated:** January 2025  
**Status:** ⏳ **AWAITING BACKEND IMPLEMENTATION**
