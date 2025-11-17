# Novunt Database Schemas Documentation

## Overview

This is the complete and detailed documentation of all database models in the Novunt Financial Platform. The documentation is split into three JSON files for manageability, covering all 42 database schemas with complete field definitions, relationships, indexes, methods, hooks, and examples.

## Documentation Files

### 📄 DATABASE_SCHEMAS.json (Part 1)
**Core User & Staking Models** (6 schemas)
- User - Main user account with authentication and rank system
- UserWallet - Two-wallet system (Funded + Earning wallets)
- UserProfile - Extended profile with KYC and fraud detection
- UserPreferences - Application settings and preferences
- Stake - Goal-based staking system targeting 200% return
- Goal - Financial goals linked to stakes

### 📄 DATABASE_SCHEMAS_PART2.json (Part 2)
**Financial & Distribution Models** (12 schemas)
- Transaction - All financial transactions
- WithdrawalRequest - Withdrawal approval system
- Notification - In-app notifications with categorization
- WeeklyDeclaration - Admin weekly profit declarations
- ReferralBonus - 5-level referral system (5%, 2%, 1.5%, 1%, 0.5%)
- RegistrationBonus - 10% first stake bonus
- RankSystem - 6-tier rank configuration
- PoolDistribution - Three-tier pool distributions
- FinancialLedger - Immutable double-entry bookkeeping
- SystemSettings - Platform-wide configuration
- KYCSubmission - Identity verification
- ActivityFeed - User activity feed with gamification

### 📄 DATABASE_SCHEMAS_PART3.json (Part 3)
**Authentication, Security & Admin Models** (24 schemas)
- RefreshToken - JWT refresh tokens
- BiometricDevice - WebAuthn/FIDO2 biometric authentication
- SecurityLog - Security audit log
- AchievementBadge - Gamification badges
- ChatConversation - AI chatbot conversations
- AdminActivityLog - Admin action audit log
- RankAchievement - Historical rank achievements
- BonusHistory - Bonus earning history
- WeeklyProfit - Three-tier pool system
- Plus 15 more supporting models

## Key System Architectures

### 🏦 Two-Wallet System
```
┌─────────────────┐         ┌─────────────────┐
│  FUNDED WALLET  │         │ EARNING WALLET  │
├─────────────────┤         ├─────────────────┤
│ Sources:        │         │ Sources:        │
│ - Deposits      │         │ - Stake Pool    │
│ - P2P Transfers │         │ - Perf. Pool    │
│                 │         │ - Premium Pool  │
│ Can Be Used:    │         │ - Bonuses       │
│ ✓ Staking       │         │ - Referrals     │
│ ✗ Withdrawals   │         │                 │
│                 │         │ Can Be Used:    │
│                 │         │ ✓ Staking       │
│                 │         │ ✓ Withdrawals   │
└─────────────────┘         └─────────────────┘
```

### 🎯 Three-Tier Pool Distribution System
```
WEEKLY PROFIT DISTRIBUTION
┌────────────────────────────────────────────┐
│           TOTAL POOL AMOUNT                │
└──────┬──────┬──────┬──────────────────────┘
       │      │      │
   ┌───▼──┐ ┌─▼───┐ ┌▼─────┐
   │ T1   │ │ T2  │ │ T3   │
   │ 80%  │ │ 15% │ │ 5%   │
   └───┬──┘ └─┬───┘ └┬─────┘
       │      │      │
   ┌───▼─────────────▼──────▼────┐
   │ Tier 1: STAKE POOL           │
   │ Proportional to all stakes   │
   └──────────────────────────────┘
       │
   ┌───▼──────────────────────────┐
   │ Tier 2: PERFORMANCE POOL     │
   │ Equal share per rank         │
   │ (Blue Tick - Rank Qualified) │
   └──────────────────────────────┘
       │
   ┌───▼──────────────────────────┐
   │ Tier 3: PREMIUM POOL         │
   │ Leadership qualified         │
   │ (Green Tick - Premium)       │
   └──────────────────────────────┘
```

### 👥 5-Level Referral System
```
YOU (Referrer)
 │
 ├─► Level 1 (5.0%) ─────► Direct Referrals
 │
 ├─► Level 2 (2.0%) ─────► Your referrals' referrals
 │
 ├─► Level 3 (1.5%) ─────► Third generation
 │
 ├─► Level 4 (1.0%) ─────► Fourth generation
 │
 └─► Level 5 (0.5%) ─────► Fifth generation

All bonuses go to EARNING WALLET (can stake + withdraw)
```

### 🏆 6-Tier Rank System
```
1. Stakeholder (Default)
   - No requirements

2. Associate Stakeholder
   - Personal: $500 stake
   - Team: $2,000 total
   - Downlines: 3 direct

3. Principal Strategist
   - Personal: $1,500 stake
   - Team: $10,000 total
   - Downlines: 5 direct (2 Associate+)

4. Elite Capitalist
   - Personal: $5,000 stake
   - Team: $50,000 total
   - Downlines: 10 direct (3 Principal+)

5. Wealth Architect
   - Personal: $15,000 stake
   - Team: $150,000 total
   - Downlines: 20 direct (5 Elite+)

6. Finance Titan
   - Personal: $50,000 stake
   - Team: $500,000 total
   - Downlines: 50 direct (10 Wealth+)
```

## Registration Bonus System

### Requirements (Must complete ALL within 7 days):
1. ✓ Complete profile (full name, phone, address, DOB, gender)
2. ✓ Follow ALL 5 social platforms (YouTube, Facebook, TikTok, Instagram, Telegram)
3. ✓ Create first stake (minimum $20)

### Bonus Details:
- **Amount**: 10% of first stake
- **Returns**: Up to 100% (not 200% like regular stakes)
- **Deadline**: 7 days from registration
- **Approval**: Requires admin approval after anti-fraud checks

## Schema Structure

Each schema in the JSON files includes:

### 📋 Complete Field Documentation
```json
{
  "fieldName": {
    "type": "String|Number|ObjectId|Date|Boolean|Array|Object|Mixed",
    "required": true|false,
    "unique": true|false,
    "default": "value",
    "min": 0,
    "max": 100,
    "enum": ["value1", "value2"],
    "validation": "description",
    "description": "Human-readable explanation"
  }
}
```

### 🔗 Relationship Mapping
```json
{
  "relationships": {
    "fieldName": {
      "type": "one-to-one|one-to-many|many-to-one|many-to-many",
      "model": "ModelName",
      "foreignKey": "fieldName",
      "description": "Relationship explanation"
    }
  }
}
```

### 🎯 Virtual Fields
```json
{
  "virtuals": {
    "virtualFieldName": {
      "type": "String|Number|Boolean",
      "description": "Computed field explanation"
    }
  }
}
```

### ⚙️ Instance Methods
```json
{
  "methods": {
    "methodName": {
      "params": ["param1: type", "param2: type"],
      "returns": "ReturnType",
      "description": "Method purpose and behavior"
    }
  }
}
```

### 🪝 Schema Hooks
```json
{
  "hooks": {
    "pre-save": [
      "Action performed before saving",
      "Another pre-save action"
    ],
    "post-save": ["..."],
    "pre-validate": ["..."]
  }
}
```

### 📊 Database Indexes
```json
{
  "indexes": [
    "fieldName (unique)",
    "field1, field2 (compound)",
    "fieldName (descending)",
    "fieldName (TTL - auto-delete)",
    "fieldName (text search)"
  ]
}
```

### 💡 Example Documents
Every schema includes a realistic example showing all fields with sample data.

## Frontend Development Guide

### For Each Schema:

1. **Read the `description`** - Understand the model's purpose
2. **Check `fields`** - Know all available properties and their types
3. **Review `relationships`** - Understand data dependencies
4. **Use `example`** - See realistic data structure
5. **Note `virtuals`** - These are computed, not stored in DB
6. **Check `notes`** - Important business logic and rules

### Common Patterns:

#### User Authentication Flow
```typescript
// 1. Login with BetterAuth
POST /api/v1/better-auth/login
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

// Response includes:
// - User object (see User schema)
// - RefreshToken (see RefreshToken schema)
// - Access token (JWT)

// 2. Get user profile
GET /api/v1/users/profile
// Returns: User + UserProfile + UserWallet + UserPreferences
```

#### Creating a Stake
```typescript
// 1. Check wallet balances
GET /api/v1/wallets/balance
// Returns: fundedWallet + earningWallet

// 2. Create stake (uses both wallets)
POST /api/v1/stakes
{
  "amount": 1000,
  "goalDescription": "Vacation fund"
}

// 3. System creates:
// - Stake record (status: active)
// - Goal record (progressPercentage: 100)
// - Updates UserWallet (totalStaked)
// - Creates Transaction record
// - Generates ActivityFeed entry
```

#### Referral System
```typescript
// 1. User gets referred
POST /api/v1/auth/register
{
  "referralCode": "ABC123",
  // ... other fields
}

// 2. When referred user stakes:
// - System calculates 5-level bonuses
// - Creates ReferralBonus records for each level
// - Credits earningWallet of referrers
// - Creates Notification for each referrer
// - Updates BonusHistory
```

## Data Validation Rules

### Common Validations:

1. **Email**: RFC 5322 format, lowercase, trimmed
2. **Username**: 3-30 chars, alphanumeric + underscore, lowercase
3. **Password**: Min 8 chars, 1 upper, 1 lower, 1 digit, 1 special
4. **Phone**: E.164 format (+1234567890)
5. **Amount**: Min 0, max varies by operation
6. **Stake**: Minimum 20 USDT
7. **Withdrawal**: Only from earningWallet, min 10 USDT

## Security Considerations

### Password Handling
- ✅ Hashed using BetterAuth bcrypt (10 rounds)
- ✅ Never returned in API responses (`select: false`)
- ✅ Complexity requirements enforced

### Token Management
- ✅ RefreshToken with JTI for revocation
- ✅ TTL indexes for automatic expiration
- ✅ IP and User-Agent tracking

### Financial Operations
- ✅ Double-entry bookkeeping in FinancialLedger
- ✅ Immutable ledger entries
- ✅ Transaction integrity with verification hashes
- ✅ Balance reconciliation

### Fraud Prevention
- ✅ Device fingerprinting (UserProfile)
- ✅ IP address tracking
- ✅ Phone reuse detection
- ✅ Similar account flagging
- ✅ Admin verification for bonuses

## Error Handling

When working with these schemas:

1. **Validation Errors**: Check `required`, `min`, `max`, `enum` constraints
2. **Unique Constraints**: Handle duplicate key errors for unique fields
3. **Foreign Keys**: Ensure referenced documents exist
4. **Balance Checks**: Verify sufficient funds before operations
5. **Status Checks**: Verify entity status before state changes

## Performance Optimization

### Index Usage:
- All foreign keys are indexed
- Common query patterns have compound indexes
- Text search on relevant fields
- TTL indexes for auto-cleanup

### Query Patterns:
```javascript
// ✅ Good: Uses index
User.find({ email: 'user@example.com' })

// ✅ Good: Uses compound index
Notification.find({ user: userId, isRead: false })
  .sort({ createdAt: -1 })

// ❌ Bad: Table scan
Stake.find({ "weeklyReturnsHistory.amount": { $gt: 50 } })

// ✅ Better: Use aggregation or specific fields
Stake.find({ totalReturnsEarned: { $gt: 50 } })
```

## Testing Considerations

### Required for Frontend Testing:

1. **User Creation**:
   - Creates User + UserWallet + UserProfile + UserPreferences
   - All happen automatically on registration

2. **Stake Creation**:
   - Requires minimum balance (20 USDT)
   - Creates Stake + Goal + Transaction records

3. **Referral Testing**:
   - Need multi-level user hierarchy
   - Test all 5 levels of bonuses

4. **Rank Testing**:
   - Need users with various stake amounts
   - Test qualification logic

5. **Weekly Distribution**:
   - Admin creates WeeklyDeclaration
   - System distributes to eligible stakes/goals

## MongoDB Aggregation Examples

### Get User Dashboard Summary:
```javascript
// Aggregate user's complete financial picture
db.userwallets.aggregate([
  { $match: { userId: ObjectId("...") } },
  { $lookup: { from: "stakes", localField: "userId", foreignField: "userId", as: "stakes" } },
  { $lookup: { from: "goals", localField: "userId", foreignField: "user", as: "goals" } },
  { $project: {
      totalBalance: { $add: ["$fundedWallet", "$earningWallet"] },
      totalStaked: 1,
      totalReturns: 1,
      activeStakes: { $size: { $filter: { input: "$stakes", cond: { $eq: ["$$this.status", "active"] } } } },
      activeGoals: { $size: { $filter: { input: "$goals", cond: { $eq: ["$$this.status", "active"] } } } }
  }}
])
```

## Version History

- **October 2, 2025**: Two-Wallet System implementation
- **September 2024**: Three-Tier Pool System
- **August 2024**: BetterAuth migration
- **July 2024**: 5-Level Referral System
- **June 2024**: Registration Bonus System
- **May 2024**: Initial Platform Launch

## Contact & Support

For questions about these schemas or the database structure:
- Frontend Team Lead: Review this documentation first
- Backend Team: Refer to source code in `src/models/`
- Documentation Issues: Create ticket with specific schema questions

---

**Generated**: October 12, 2025  
**Source**: Novunt Backend API (`src/models/*.model.ts`)  
**Total Schemas**: 42  
**MongoDB Version**: 4.4+  
**Mongoose Version**: 6.x+
