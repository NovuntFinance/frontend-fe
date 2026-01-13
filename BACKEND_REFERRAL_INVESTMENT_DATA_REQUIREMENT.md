# 🔴 URGENT: Backend Referral Investment Data Missing

**Date:** January 12, 2026  
**Priority:** HIGH  
**Component:** Referral System API  
**Affected Endpoint:** `GET /api/v1/referral/my-tree`

---

## 📋 **Issue Summary**

The frontend is successfully fetching referral data from `/api/v1/referral/my-tree`, but **critical financial data is missing**. All referrals show **$0.00** for both Personal Investment and Referral Investment amounts.

### **Current vs Expected Behavior**

| Field               | Current Value | Expected Value                        |
| ------------------- | ------------- | ------------------------------------- |
| Personal Investment | $0.00         | Actual sum of referral's stakes       |
| Referral Investment | $0.00         | Actual sum of their referral earnings |

---

## 🔍 **Current API Response (INCOMPLETE)**

```json
{
  "success": true,
  "message": "Referral tree retrieved successfully",
  "data": {
    "tree": [
      {
        "level": 1,
        "referrer": "user-123",
        "referral": "user-456",
        "username": "cryptoowo",
        "email": "cry***com",
        "hasQualifyingStake": false,
        "joinedAt": "2025-11-25T10:30:00.000Z"

        // ❌ MISSING: personalInvestment
        // ❌ MISSING: referralInvestmentAmount
        // ❌ MISSING: totalStaked
        // ❌ MISSING: activeStakesCount
      }
    ],
    "stats": {
      "totalReferrals": 10,
      "activeReferrals": 0,
      "totalEarned": 0,
      "currentBalance": 0,
      "canWithdraw": false
    },
    "maxLevels": 20
  }
}
```

---

## ✅ **Required API Response (COMPLETE)**

```json
{
  "success": true,
  "message": "Referral tree retrieved successfully",
  "data": {
    "tree": [
      {
        "level": 1,
        "referrer": "user-123",
        "referral": "user-456",
        "username": "cryptoowo",
        "email": "cry***com",
        "hasQualifyingStake": true,
        "joinedAt": "2025-11-25T10:30:00.000Z",

        // ✅ REQUIRED: Personal investment data
        "personalInvestment": 500.0, // Sum of all their stakes
        "personalInvestmentUSDT": 500.0, // Same as above (for clarity)
        "totalStaked": 500.0, // Total amount they've staked
        "activeStakesCount": 2, // Number of active stakes

        // ✅ REQUIRED: Referral earnings data
        "referralInvestmentAmount": 125.5, // Their referral earnings
        "referralEarnings": 125.5, // Same as above (for clarity)
        "referralBonusBalance": 125.5, // Available referral balance

        // ✅ OPTIONAL BUT RECOMMENDED:
        "totalEarningsFromThis": 25.0, // How much YOU earned from THIS referral
        "commissionRate": 5, // Commission rate for this level (%)
        "isActive": true, // Has active stakes (computed from personalInvestment > 0)
        "lastStakeDate": "2025-12-15T14:20:00.000Z", // When they last staked
        "totalReferralsUnder": 5 // Number of referrals under this user
      }
    ],
    "stats": {
      "totalReferrals": 10,
      "activeReferrals": 6, // Count of referrals with stakes
      "totalEarned": 450.75, // Total you earned from all referrals
      "currentBalance": 450.75,
      "canWithdraw": true
    },
    "maxLevels": 20
  }
}
```

---

## 🔧 **Implementation Guide for Backend Team**

### **Database Schema Requirements**

Ensure you have access to these tables:

- `stakes` - User stake records
- `users` - User information
- `referral_bonuses` or `transactions` - Referral earnings records
- `referrals` - Referral relationships

### **SQL Queries for Each Field**

#### 1. **personalInvestment** (Sum of User's Active Stakes)

```sql
-- Calculate personal investment for each referral
SELECT
  r.referral_id,
  COALESCE(SUM(s.amount), 0) as personalInvestment,
  COUNT(s.id) as activeStakesCount
FROM referrals r
LEFT JOIN stakes s ON s.user_id = r.referral_id
  AND s.status = 'active'
  AND s.deleted_at IS NULL
WHERE r.referrer_id = :currentUserId
GROUP BY r.referral_id;
```

#### 2. **referralInvestmentAmount** (Referral's Own Referral Earnings)

```sql
-- Calculate how much this referral has earned from THEIR referrals
SELECT
  user_id,
  COALESCE(SUM(amount), 0) as referralInvestmentAmount
FROM referral_bonuses
WHERE user_id = :referralUserId
  AND status = 'completed'
GROUP BY user_id;

-- OR if stored in transactions table:
SELECT
  user_id,
  COALESCE(SUM(amount), 0) as referralInvestmentAmount
FROM transactions
WHERE user_id = :referralUserId
  AND type = 'referral_bonus'
  AND status = 'completed'
GROUP BY user_id;
```

#### 3. **totalEarningsFromThis** (What YOU Earned from This Referral)

```sql
-- Calculate how much the current user earned from this specific referral
SELECT
  referral_id,
  COALESCE(SUM(amount), 0) as totalEarningsFromThis
FROM referral_bonuses
WHERE referrer_id = :currentUserId
  AND referral_id = :referralUserId
  AND status = 'completed'
GROUP BY referral_id;
```

#### 4. **Complete Query Example (Optimized)**

```sql
-- Single optimized query to get all data
SELECT
  r.referral_id,
  r.level,
  u.username,
  u.email,
  r.created_at as joinedAt,

  -- Personal Investment Data
  COALESCE(stakes_data.total_staked, 0) as personalInvestment,
  COALESCE(stakes_data.active_count, 0) as activeStakesCount,
  COALESCE(stakes_data.last_stake_date, NULL) as lastStakeDate,

  -- Referral Earnings Data (what THEY earned from their referrals)
  COALESCE(ref_earnings.total_earned, 0) as referralInvestmentAmount,

  -- Your Earnings from This Referral
  COALESCE(your_earnings.total_earned, 0) as totalEarningsFromThis,

  -- Computed Fields
  CASE
    WHEN COALESCE(stakes_data.total_staked, 0) > 0 THEN true
    ELSE false
  END as hasQualifyingStake,

  CASE
    WHEN COALESCE(stakes_data.total_staked, 0) > 0 THEN true
    ELSE false
  END as isActive

FROM referrals r
INNER JOIN users u ON u.id = r.referral_id

-- Get personal investment (stakes)
LEFT JOIN (
  SELECT
    user_id,
    SUM(amount) as total_staked,
    COUNT(*) as active_count,
    MAX(created_at) as last_stake_date
  FROM stakes
  WHERE status = 'active' AND deleted_at IS NULL
  GROUP BY user_id
) stakes_data ON stakes_data.user_id = r.referral_id

-- Get referral earnings (what they earned from their own referrals)
LEFT JOIN (
  SELECT
    referrer_id,
    SUM(amount) as total_earned
  FROM referral_bonuses
  WHERE status = 'completed'
  GROUP BY referrer_id
) ref_earnings ON ref_earnings.referrer_id = r.referral_id

-- Get your earnings from this referral
LEFT JOIN (
  SELECT
    referral_id,
    SUM(amount) as total_earned
  FROM referral_bonuses
  WHERE referrer_id = :currentUserId AND status = 'completed'
  GROUP BY referral_id
) your_earnings ON your_earnings.referral_id = r.referral_id

WHERE r.referrer_id = :currentUserId
  AND r.level <= :maxLevels
ORDER BY r.level ASC, r.created_at DESC;
```

---

## 💻 **Backend Implementation (Node.js Example)**

```javascript
// controllers/referralController.js

/**
 * Get referral tree with investment data
 * GET /api/v1/referral/my-tree?maxLevels=20
 */
async function getMyReferralTree(req, res) {
  try {
    const userId = req.user.id; // From auth middleware
    const maxLevels = parseInt(req.query.maxLevels) || 5;
    const validMaxLevels = Math.max(1, Math.min(20, maxLevels));

    // Get referral tree with all financial data
    const treeData = await db.query(
      `
      SELECT 
        r.referral_id,
        r.level,
        u.username,
        u.email,
        r.created_at as "joinedAt",
        
        -- Personal Investment
        COALESCE(stakes_data.total_staked, 0) as "personalInvestment",
        COALESCE(stakes_data.active_count, 0) as "activeStakesCount",
        stakes_data.last_stake_date as "lastStakeDate",
        
        -- Referral Earnings
        COALESCE(ref_earnings.total_earned, 0) as "referralInvestmentAmount",
        
        -- Computed Fields
        CASE 
          WHEN COALESCE(stakes_data.total_staked, 0) > 0 THEN true 
          ELSE false 
        END as "hasQualifyingStake",
        
        CASE 
          WHEN COALESCE(stakes_data.total_staked, 0) > 0 THEN true 
          ELSE false 
        END as "isActive"

      FROM referrals r
      INNER JOIN users u ON u.id = r.referral_id
      
      LEFT JOIN (
        SELECT 
          user_id,
          SUM(amount) as total_staked,
          COUNT(*) as active_count,
          MAX(created_at) as last_stake_date
        FROM stakes
        WHERE status = 'active' AND deleted_at IS NULL
        GROUP BY user_id
      ) stakes_data ON stakes_data.user_id = r.referral_id
      
      LEFT JOIN (
        SELECT 
          referrer_id,
          SUM(amount) as total_earned
        FROM referral_bonuses
        WHERE status = 'completed'
        GROUP BY referrer_id
      ) ref_earnings ON ref_earnings.referrer_id = r.referral_id

      WHERE r.referrer_id = $1
        AND r.level <= $2
      ORDER BY r.level ASC, r.created_at DESC
    `,
      [userId, validMaxLevels]
    );

    // Calculate stats
    const stats = {
      totalReferrals: treeData.rows.length,
      activeReferrals: treeData.rows.filter((r) => r.hasQualifyingStake).length,
      totalEarned: treeData.rows.reduce(
        (sum, r) => sum + parseFloat(r.personalInvestment || 0),
        0
      ),
      currentBalance: 0, // Get from wallet or referral_bonuses table
      canWithdraw: false, // Based on minimum withdrawal amount
    };

    // Format response
    const tree = treeData.rows.map((row) => ({
      level: row.level,
      referrer: userId,
      referral: row.referral_id,
      username: row.username,
      email: maskEmail(row.email), // Mask email for privacy
      hasQualifyingStake: row.hasQualifyingStake,
      isActive: row.isActive,
      joinedAt: row.joinedAt,

      // Financial data
      personalInvestment: parseFloat(row.personalInvestment || 0),
      personalInvestmentUSDT: parseFloat(row.personalInvestment || 0),
      totalStaked: parseFloat(row.personalInvestment || 0),
      activeStakesCount: parseInt(row.activeStakesCount || 0),

      referralInvestmentAmount: parseFloat(row.referralInvestmentAmount || 0),
      referralEarnings: parseFloat(row.referralInvestmentAmount || 0),

      lastStakeDate: row.lastStakeDate,
    }));

    return res.json({
      success: true,
      message: 'Referral tree retrieved successfully',
      data: {
        tree,
        stats,
        maxLevels: validMaxLevels,
      },
    });
  } catch (error) {
    console.error('[Referral Tree] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve referral tree',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

// Helper function to mask email
function maskEmail(email) {
  if (!email) return '';
  const [local, domain] = email.split('@');
  if (local.length <= 3) return email;
  return `${local.substring(0, 3)}***${domain}`;
}
```

---

## 🧪 **Testing Requirements**

### **Test Cases**

1. **User with no referrals**
   - Should return empty tree array
   - Stats should show all zeros

2. **User with referrals but no stakes**
   - Should show referrals
   - personalInvestment = $0.00 for each
   - hasQualifyingStake = false

3. **User with referrals who have stakes**
   - personalInvestment should show actual stake amounts
   - hasQualifyingStake = true for those with stakes
   - activeStakesCount should be correct

4. **Multi-level referrals**
   - Level 1 (direct) referrals
   - Level 2-5 (indirect) referrals
   - Each should have correct financial data

### **Sample Test Request**

```bash
curl -X GET "http://localhost:5000/api/v1/referral/my-tree?maxLevels=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### **Expected Response Format**

```json
{
  "success": true,
  "message": "Referral tree retrieved successfully",
  "data": {
    "tree": [
      {
        "level": 1,
        "referrer": "current-user-id",
        "referral": "referral-user-id",
        "username": "cryptoowo",
        "email": "cry***com",
        "hasQualifyingStake": true,
        "isActive": true,
        "joinedAt": "2025-11-25T10:30:00.000Z",
        "personalInvestment": 500.0,
        "personalInvestmentUSDT": 500.0,
        "totalStaked": 500.0,
        "activeStakesCount": 2,
        "referralInvestmentAmount": 125.5,
        "referralEarnings": 125.5,
        "lastStakeDate": "2025-12-15T14:20:00.000Z"
      }
    ],
    "stats": {
      "totalReferrals": 10,
      "activeReferrals": 6,
      "totalEarned": 450.75,
      "currentBalance": 450.75,
      "canWithdraw": true
    },
    "maxLevels": 20
  }
}
```

---

## 📊 **Frontend Requirements (Already Implemented)**

The frontend is **already configured** to display these fields:

### **Team Page Display**

| Column              | Source Field               |
| ------------------- | -------------------------- |
| Personal Investment | `personalInvestment`       |
| Referral Investment | `referralInvestmentAmount` |
| Username            | `username`                 |
| Email (masked)      | `email`                    |
| Joined Date         | `joinedAt`                 |
| Level               | `level`                    |

### **Frontend Code Reference**

```typescript
// src/app/(dashboard)/dashboard/team/page.tsx (lines 512-517)
<td className="hidden px-4 py-2 align-middle md:table-cell">
  {formatCurrency(
    (referral as any).personalInvestment ?? 0  // ← Using this field
  )}
</td>
<td className="hidden px-4 py-2 align-middle lg:table-cell">
  {formatCurrency(
    (referral as any).referralInvestmentAmount ?? 0  // ← Using this field
  )}
</td>
```

---

## ⚠️ **Critical Fields Required**

### **MUST HAVE (Minimum)**

✅ `personalInvestment` - Sum of user's active stakes  
✅ `referralInvestmentAmount` - Their referral earnings

### **SHOULD HAVE (Recommended)**

✅ `activeStakesCount` - Number of active stakes  
✅ `totalStaked` - Total amount staked  
✅ `lastStakeDate` - Last stake timestamp  
✅ `isActive` - Boolean indicating if they have stakes

### **NICE TO HAVE (Optional)**

- `totalEarningsFromThis` - What you earned from this referral
- `commissionRate` - Commission percentage for this level
- `totalReferralsUnder` - Number of sub-referrals

---

## 🚀 **Deployment Checklist**

- [ ] Update database query to include financial calculations
- [ ] Add LEFT JOINs for stakes and referral_bonuses tables
- [ ] Test with users who have no referrals
- [ ] Test with users who have referrals but no stakes
- [ ] Test with users who have referrals with stakes
- [ ] Test multi-level referral scenarios (L1-L5)
- [ ] Verify email masking is working
- [ ] Verify decimal precision for amounts (2 decimal places)
- [ ] Test API response time (should be < 2 seconds)
- [ ] Update API documentation
- [ ] Notify frontend team when deployed

---

## 📞 **Contact & Support**

**Frontend Team Contact:** [Your Name/Team]  
**Issue Reference:** BACKEND_REFERRAL_INVESTMENT_DATA_MISSING  
**Date Required:** ASAP (Users are seeing $0.00 for all investments)

---

## 🎯 **Summary for Backend Team**

**What's Wrong:**

- API returns referrals but all financial amounts are $0.00

**What's Needed:**

- Add `personalInvestment` (sum of referral's stakes)
- Add `referralInvestmentAmount` (referral's own earnings)

**How to Fix:**

- Use the SQL queries provided above
- Add LEFT JOINs to stakes and referral_bonuses tables
- Return the additional fields in the API response

**Timeline:**

- **Critical Priority** - Users cannot see their referral performance

---

**End of Specification**
