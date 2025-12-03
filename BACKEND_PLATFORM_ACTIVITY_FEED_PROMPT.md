# Backend Implementation Prompt: Live Platform Activity Feed

## 🎯 **CURRENT SITUATION**

The frontend dashboard displays a "Live Platform Activity" card that shows real-time user activities (deposits, withdrawals, stakes, earnings, etc.) for social proof. **Currently, this is using 100% mock/fake data generated on the frontend.**

**Location**: `src/app/(dashboard)/dashboard/page.tsx` (lines 144-345)

**Current Behavior**:

- Generates random masked names (e.g., "J\*\*\*n A.")
- Randomly selects activity types (deposit, withdraw, stake, etc.)
- Generates random amounts within predefined ranges
- Updates every 30 seconds with new random data
- **No backend integration** - completely frontend-generated

**Requirement**: Replace mock data with **real platform activity data** from the backend, properly anonymized for privacy.

---

## 📋 **WHAT NEEDS TO BE IMPLEMENTED**

### 1. **Create New API Endpoint**

Create a new endpoint that returns recent platform activities (anonymized) for display on the dashboard.

**Endpoint**: `GET /api/v1/platform/activity` or `GET /api/v1/activity/feed`

**Alternative**: If you prefer, this could be part of the existing dashboard overview endpoint as `overview.recentActivity[]`

---

## 🔐 **AUTHENTICATION**

- **Required**: Yes
- **Method**: Bearer token in Authorization header OR cookie-based auth (match your existing auth pattern)
- **Header**: `Authorization: Bearer <access_token>`
- **OR Cookie**: `auth_token` (if using cookie-based auth)

---

## 📊 **REQUEST SPECIFICATION**

### Endpoint

```
GET /api/v1/platform/activity
```

### Query Parameters (Optional)

| Parameter | Type   | Default | Description                                 |
| --------- | ------ | ------- | ------------------------------------------- |
| `limit`   | number | 1       | Number of activities to return (default: 1) |
| `types`   | string | all     | Comma-separated activity types to filter    |

**Example Requests**:

```
GET /api/v1/platform/activity
GET /api/v1/platform/activity?limit=1
GET /api/v1/platform/activity?limit=5&types=deposit,withdraw,stake
```

### Activity Types to Support

The backend should support these activity types (matching frontend expectations):

1. **`deposit`** - User made a deposit
2. **`withdraw`** - User made a withdrawal
3. **`stake`** - User created a new stake
4. **`referral`** - User earned a referral bonus
5. **`ros`** - User received ROS (Return on Stake) payout
6. **`rank`** - User earned a rank bonus
7. **`promotion`** - User was promoted to a new rank
8. **`transfer`** - User transferred funds

---

## 📤 **RESPONSE SPECIFICATION**

### Success Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "act_1234567890",
      "type": "deposit",
      "user": "J***n A.",
      "action": "deposited",
      "amount": 1250.5,
      "timestamp": "2024-01-15T14:32:00.000Z",
      "timeAgo": "5 min ago"
    }
  ],
  "count": 1
}
```

### Response Fields

#### Root Object

| Field     | Type    | Description                            |
| --------- | ------- | -------------------------------------- |
| `success` | boolean | Always `true` for successful responses |
| `data`    | array   | Array of activity objects (see below)  |
| `count`   | number  | Number of activities returned          |

#### Activity Object

| Field       | Type   | Required | Description                                   |
| ----------- | ------ | -------- | --------------------------------------------- |
| `id`        | string | Yes      | Unique activity identifier                    |
| `type`      | string | Yes      | Activity type (see types above)               |
| `user`      | string | Yes      | **Anonymized** username (e.g., "J\*\*\*n A.") |
| `action`    | string | Yes      | Action description (see mapping below)        |
| `amount`    | number | No       | Amount involved (null for non-monetary acts)  |
| `timestamp` | string | Yes      | ISO 8601 timestamp of when activity occurred  |
| `timeAgo`   | string | Yes      | Human-readable time (e.g., "5 min ago")       |

### Activity Type → Action Mapping

| Type        | Action String              | Amount Required? |
| ----------- | -------------------------- | ---------------- |
| `deposit`   | `"deposited"`              | Yes              |
| `withdraw`  | `"withdrew"`               | Yes              |
| `stake`     | `"staked"`                 | Yes              |
| `referral`  | `"earned referral bonus"`  | Yes              |
| `ros`       | `"earned ROS"`             | Yes              |
| `rank`      | `"earned rank bonus"`      | Yes              |
| `promotion` | `"promoted to {rankName}"` | No               |
| `transfer`  | `"transferred"`            | Yes              |

**Note**: For `promotion` type, include the rank name in the action string (e.g., "promoted to Elite Capitalist").

---

## 🔒 **PRIVACY & ANONYMIZATION REQUIREMENTS**

### **CRITICAL**: User Data Must Be Anonymized

The `user` field **MUST** be anonymized to protect user privacy. Do **NOT** return real usernames or full names.

### Anonymization Rules

1. **Mask First Name**: Show first letter, then asterisks, then last letter
   - Example: "John" → "J\*\*n"
   - Example: "Sarah" → "S\*\*\*h"

2. **Show Last Initial Only**: Show only the first letter of last name followed by a period
   - Example: "Anderson" → "A."

3. **Final Format**: `"{maskedFirstName} {lastInitial}."`
   - Example: "J\*\*n A."
   - Example: "S\*\*\*h M."

### Implementation Example (Pseudocode)

```javascript
function anonymizeName(firstName, lastName) {
  // Mask first name
  const maskedFirst =
    firstName.length <= 2
      ? firstName
      : firstName[0] +
        '*'.repeat(Math.max(1, firstName.length - 2)) +
        firstName[firstName.length - 1];

  // Last initial only
  const lastInitial = lastName[0] + '.';

  return `${maskedFirst} ${lastInitial}`;
}

// Example usage:
anonymizeName('John', 'Anderson'); // Returns: "J**n A."
anonymizeName('Sarah', 'Martinez'); // Returns: "S***h M."
```

### Additional Privacy Considerations

- **Don't return activities from the current user** (filter out activities where `userId === currentUserId`)
- **Only return activities from the last 24-48 hours** (recent activities only)
- **Limit to 1-5 activities** per request (default: 1)
- **Randomize selection** if multiple activities match (don't always return the same ones)

---

## 📅 **TIME FORMATTING**

### `timestamp` Field

- **Format**: ISO 8601 string
- **Example**: `"2024-01-15T14:32:00.000Z"`

### `timeAgo` Field

Calculate relative time and return human-readable string:

| Time Range   | Format            | Example       |
| ------------ | ----------------- | ------------- |
| < 1 minute   | `"just now"`      | "just now"    |
| 1 minute     | `"1 min ago"`     | "1 min ago"   |
| 2-59 minutes | `"{n} min ago"`   | "5 min ago"   |
| 1 hour       | `"1 hour ago"`    | "1 hour ago"  |
| 2-23 hours   | `"{n} hours ago"` | "3 hours ago" |
| 1 day        | `"1 day ago"`     | "1 day ago"   |
| 2+ days      | `"{n} days ago"`  | "2 days ago"  |

**Note**: For the dashboard card, activities older than 24-48 hours should probably not be returned.

---

## 🗄️ **DATA SOURCES**

The backend should aggregate activities from these sources:

### 1. **Deposits** (`type: "deposit"`)

- **Source**: Wallet/transaction records
- **Table**: `transactions` or `wallet_transactions`
- **Filter**: `type = 'deposit'` AND `status = 'completed'`
- **Amount**: Transaction amount
- **Timestamp**: Transaction completion time

### 2. **Withdrawals** (`type: "withdraw"`)

- **Source**: Wallet/transaction records
- **Table**: `transactions` or `wallet_transactions`
- **Filter**: `type = 'withdrawal'` AND `status = 'completed'`
- **Amount**: Transaction amount
- **Timestamp**: Transaction completion time

### 3. **Stakes** (`type: "stake"`)

- **Source**: Staking records
- **Table**: `stakes` or `staking_transactions`
- **Filter**: `type = 'stake'` AND `status = 'active'` or `'completed'`
- **Amount**: Stake amount
- **Timestamp**: Stake creation time

### 4. **Referral Bonuses** (`type: "referral"`)

- **Source**: Referral/commission records
- **Table**: `referrals`, `commissions`, or `bonuses`
- **Filter**: `type = 'referral_bonus'` AND `status = 'completed'`
- **Amount**: Bonus amount
- **Timestamp**: Bonus credit time

### 5. **ROS Payouts** (`type: "ros"`)

- **Source**: ROS payout records
- **Table**: `ros_payouts`, `staking_payouts`, or `transactions`
- **Filter**: `type = 'ros_payout'` AND `status = 'completed'`
- **Amount**: Payout amount
- **Timestamp**: Payout time

### 6. **Rank Bonuses** (`type: "rank"`)

- **Source**: Rank bonus/achievement records
- **Table**: `rank_bonuses`, `achievements`, or `bonuses`
- **Filter**: `type = 'rank_bonus'` AND `status = 'completed'`
- **Amount**: Bonus amount
- **Timestamp**: Bonus credit time

### 7. **Rank Promotions** (`type: "promotion"`)

- **Source**: User rank history
- **Table**: `user_ranks`, `rank_history`, or `users` (with rank tracking)
- **Filter**: Rank change events
- **Amount**: `null` (no amount for promotions)
- **Timestamp**: Rank change time
- **Special**: Include rank name in `action` field (e.g., "promoted to Elite Capitalist")

### 8. **Transfers** (`type: "transfer"`)

- **Source**: Transfer records
- **Table**: `transfers` or `transactions`
- **Filter**: `type IN ('transfer_in', 'transfer_out')` AND `status = 'completed'`
- **Amount**: Transfer amount
- **Timestamp**: Transfer completion time

---

## 💾 **IMPLEMENTATION APPROACH**

### Option 1: Single Query with UNION (Recommended)

Query all activity sources in a single database query using UNION:

```sql
-- Example PostgreSQL/MongoDB Aggregation
SELECT
  id,
  'deposit' as type,
  user_id,
  amount,
  completed_at as timestamp
FROM transactions
WHERE type = 'deposit' AND status = 'completed' AND completed_at >= NOW() - INTERVAL '48 hours'

UNION ALL

SELECT
  id,
  'withdraw' as type,
  user_id,
  amount,
  completed_at as timestamp
FROM transactions
WHERE type = 'withdrawal' AND status = 'completed' AND completed_at >= NOW() - INTERVAL '48 hours'

UNION ALL

SELECT
  id,
  'stake' as type,
  user_id,
  amount,
  created_at as timestamp
FROM stakes
WHERE status IN ('active', 'completed') AND created_at >= NOW() - INTERVAL '48 hours'

-- ... continue for other types
ORDER BY timestamp DESC
LIMIT 1;
```

### Option 2: Separate Queries (If UNION is not feasible)

Query each activity source separately, combine results, sort by timestamp, and return the most recent ones.

### Option 3: Activity Log Table (Best for Performance)

If you have or can create a dedicated `platform_activities` or `activity_log` table:

```sql
CREATE TABLE platform_activities (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  activity_type VARCHAR(50) NOT NULL,
  amount DECIMAL(10, 2),
  metadata JSONB, -- For storing rank names, etc.
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_created_at (created_at),
  INDEX idx_user_id (user_id)
);
```

Then populate this table via triggers or application logic whenever activities occur, and query it directly.

---

## 🎯 **EXAMPLE IMPLEMENTATION (Pseudocode)**

### Node.js/Express Example

```javascript
async function getPlatformActivity(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 1;
    const userId = req.user.id; // Current user (to exclude their activities)

    // Query recent activities (last 48 hours)
    const activities = await db.query(
      `
      SELECT 
        a.id,
        a.type,
        a.user_id,
        a.amount,
        a.timestamp,
        u.first_name,
        u.last_name
      FROM (
        -- Deposits
        SELECT 
          id,
          'deposit' as type,
          user_id,
          amount,
          completed_at as timestamp
        FROM transactions
        WHERE type = 'deposit' 
          AND status = 'completed' 
          AND completed_at >= NOW() - INTERVAL '48 hours'
          AND user_id != $1
        
        UNION ALL
        
        -- Withdrawals
        SELECT 
          id,
          'withdraw' as type,
          user_id,
          amount,
          completed_at as timestamp
        FROM transactions
        WHERE type = 'withdrawal' 
          AND status = 'completed' 
          AND completed_at >= NOW() - INTERVAL '48 hours'
          AND user_id != $1
        
        -- ... add other activity types
      ) a
      JOIN users u ON a.user_id = u.id
      ORDER BY a.timestamp DESC
      LIMIT $2
    `,
      [userId, limit]
    );

    // Anonymize and format
    const formattedActivities = activities.map((activity) => {
      const maskedName = anonymizeName(activity.first_name, activity.last_name);

      const action = getActionString(activity.type, activity.metadata);
      const timeAgo = formatTimeAgo(activity.timestamp);

      return {
        id: `act_${activity.id}`,
        type: activity.type,
        user: maskedName,
        action: action,
        amount: activity.amount,
        timestamp: activity.timestamp.toISOString(),
        timeAgo: timeAgo,
      };
    });

    res.json({
      success: true,
      data: formattedActivities,
      count: formattedActivities.length,
    });
  } catch (error) {
    console.error('Error fetching platform activity:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch platform activity',
    });
  }
}

function anonymizeName(firstName, lastName) {
  if (!firstName || !lastName) return 'Anonymous User';

  const maskedFirst =
    firstName.length <= 2
      ? firstName
      : firstName[0] +
        '*'.repeat(Math.max(1, firstName.length - 2)) +
        firstName[firstName.length - 1];

  return `${maskedFirst} ${lastName[0]}.`;
}

function getActionString(type, metadata) {
  const actions = {
    deposit: 'deposited',
    withdraw: 'withdrew',
    stake: 'staked',
    referral: 'earned referral bonus',
    ros: 'earned ROS',
    rank: 'earned rank bonus',
    promotion: `promoted to ${metadata?.rankName || 'new rank'}`,
    transfer: 'transferred',
  };

  return actions[type] || 'performed an action';
}

function formatTimeAgo(timestamp) {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now - time;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins === 1) return '1 min ago';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours === 1) return '1 hour ago';
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return '1 day ago';
  return `${diffDays} days ago`;
}
```

---

## ⚠️ **ERROR HANDLING**

### Error Responses

#### 401 Unauthorized

```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

#### 500 Internal Server Error

```json
{
  "success": false,
  "error": "Internal Server Error",
  "message": "Failed to fetch platform activity"
}
```

### Frontend Handling

The frontend will handle errors gracefully:

- If the endpoint returns an error or doesn't exist, it will fall back to mock data
- If the endpoint returns empty data, it will show a loading state or fallback message
- The frontend polls this endpoint every 30 seconds

---

## 🧪 **TESTING CHECKLIST**

Please test the following scenarios:

- [ ] **Authentication**: Endpoint requires valid auth token
- [ ] **Anonymization**: User names are properly masked (e.g., "J\*\*\*n A.")
- [ ] **Privacy**: Current user's activities are excluded
- [ ] **Activity Types**: All 8 activity types are supported
- [ ] **Time Formatting**: `timeAgo` field is correctly formatted
- [ ] **Amount Handling**: Activities without amounts (promotions) return `null`
- [ ] **Recent Activities**: Only activities from last 24-48 hours are returned
- [ ] **Limit Parameter**: `limit` query parameter works correctly
- [ ] **Empty Results**: Returns empty array if no activities found
- [ ] **Error Handling**: Proper error responses for auth failures and server errors

---

## 📝 **ACCEPTANCE CRITERIA**

The implementation is complete when:

1. ✅ Endpoint returns real platform activities (not mock data)
2. ✅ User names are properly anonymized (masked format)
3. ✅ Current user's activities are excluded
4. ✅ All 8 activity types are supported
5. ✅ Activities are from the last 24-48 hours only
6. ✅ `timeAgo` field is human-readable (e.g., "5 min ago")
7. ✅ Response format matches the specification exactly
8. ✅ Endpoint handles errors gracefully
9. ✅ Performance is acceptable (< 500ms response time)

---

## 🔄 **FRONTEND INTEGRATION**

Once the backend endpoint is ready, the frontend will:

1. Replace `generateRandomActivity()` with an API call
2. Use React Query to fetch and cache activities
3. Poll the endpoint every 30 seconds for new activities
4. Fall back to mock data if the endpoint is unavailable (for backward compatibility)

**Frontend will update automatically** - no changes needed from backend team once the endpoint is live.

---

## 📞 **QUESTIONS OR CLARIFICATIONS**

If you need clarification on any of the above requirements, please reach out to the frontend team. The key requirements are:

1. **Privacy First**: User data must be anonymized
2. **Real Data**: Replace mock data with actual platform activities
3. **Recent Only**: Show activities from last 24-48 hours
4. **Multiple Types**: Support all 8 activity types
5. **Performance**: Fast response times (< 500ms)

---

**Thank you for implementing this feature!** This will make the platform activity feed much more authentic and trustworthy for users. 🚀
