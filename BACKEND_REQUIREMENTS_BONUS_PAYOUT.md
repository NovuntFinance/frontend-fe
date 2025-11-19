# 🔧 Backend Requirements - Registration Bonus Gradual Payout

## 📋 Overview

This document outlines the backend changes required to implement the **correct** registration bonus payout mechanism: gradual payment via weekly ROI declarations instead of creating a separate bonus stake.

---

## 🗄️ Database Schema Updates

### 1. RegistrationBonus Model Updates

**Add new fields to track bonus credit:**

```javascript
const RegistrationBonusSchema = new Schema({
  // ... existing fields ...
  
  // First Stake Information
  firstStakeId: {
    type: Schema.Types.ObjectId,
    ref: 'Stake',
    default: null
  },
  firstStakeAmount: {
    type: Number,
    default: null,
    description: 'Amount of the first stake that triggered bonus'
  },
  
  // Bonus Credit Tracking (NEW)
  bonusAmount: {
    type: Number,
    default: null,
    description: 'Total bonus earned (10% of first stake)'
  },
  bonusPaidOut: {
    type: Number,
    default: 0,
    description: 'Cumulative amount paid out via weekly ROI'
  },
  remainingBonus: {
    type: Number,
    default: 0,
    description: 'Amount still to be paid out'
  },
  
  // Timeline Updates
  activatedAt: {
    type: Date,
    default: null,
    description: 'When user made first stake and bonus was activated'
  },
  completedAt: {
    type: Date,
    default: null,
    description: 'When remainingBonus reached 0 and all bonus paid out'
  },
  
  // ... rest of existing fields ...
});

// Add indexes for efficient queries
RegistrationBonusSchema.index({ userId: 1 });
RegistrationBonusSchema.index({ status: 1 });
RegistrationBonusSchema.index({ 'remainingBonus': 1 }); // For finding active bonuses
```

### 2. BonusPayoutHistory Model (NEW)

**Create new model to track individual payouts:**

```javascript
const BonusPayoutHistorySchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  registrationBonusId: {
    type: Schema.Types.ObjectId,
    ref: 'RegistrationBonus',
    required: true
  },
  week: {
    type: Number,
    required: true,
    description: 'Week number since bonus activation'
  },
  payoutDate: {
    type: Date,
    required: true,
    description: 'Date of the weekly payout'
  },
  declaredROIPercentage: {
    type: Number,
    required: true,
    description: 'Admin-declared ROI percentage for that week'
  },
  bonusAmountPaid: {
    type: Number,
    required: true,
    description: 'Amount of bonus paid in this week'
  },
  remainingAfterPayout: {
    type: Number,
    required: true,
    description: 'Remaining bonus after this payout'
  },
  transactionId: {
    type: String,
    description: 'Reference to wallet transaction'
  }
}, {
  timestamps: true
});

// Indexes
BonusPayoutHistorySchema.index({ userId: 1 });
BonusPayoutHistorySchema.index({ registrationBonusId: 1 });
BonusPayoutHistorySchema.index({ payoutDate: -1 });
```

---

## 🔄 Core Logic Changes

### 1. First Stake Processing (Update Existing)

**File:** `controllers/stakingController.js` or similar

**Function:** `createStake()`

```javascript
async function createStake(req, res) {
  const { amount, source } = req.body;
  const userId = req.user.id;
  
  // ... existing stake creation logic ...
  
  // Create the stake
  const stake = await Stake.create({
    userId,
    amount,
    source,
    targetReturn: amount * 2, // 200% ROI
    status: 'active'
  });
  
  // Check if this is user's first stake
  const stakeCount = await Stake.countDocuments({ 
    userId, 
    status: { $in: ['active', 'completed'] } 
  });
  
  if (stakeCount === 1) {
    // This is the first stake - check for registration bonus
    await processRegistrationBonus(userId, stake);
  }
  
  // ... rest of response ...
}
```

### 2. Registration Bonus Activation (NEW Logic)

**File:** `services/registrationBonusService.js`

**Function:** `processRegistrationBonus()`

```javascript
async function processRegistrationBonus(userId, stake) {
  try {
    // Find active registration bonus
    const bonus = await RegistrationBonus.findOne({
      userId,
      status: { $in: ['pending', 'requirements_met'] },
      expiresAt: { $gt: new Date() } // Not expired
    });
    
    if (!bonus) {
      console.log(`[Registration Bonus] No active bonus for user ${userId}`);
      return;
    }
    
    // Check if stake meets minimum requirement
    const MIN_STAKE_AMOUNT = 20;
    if (stake.amount < MIN_STAKE_AMOUNT) {
      console.log(`[Registration Bonus] Stake ${stake.amount} below minimum ${MIN_STAKE_AMOUNT}`);
      return;
    }
    
    // Verify all requirements are met
    const requirementsMet = await checkAllRequirements(userId);
    if (!requirementsMet.allMet) {
      console.log(`[Registration Bonus] Not all requirements met for user ${userId}`);
      return;
    }
    
    // Calculate bonus amount (10% of first stake)
    const bonusAmount = stake.amount * (bonus.bonusPercentage / 100);
    
    // Update registration bonus with bonus credit
    bonus.status = 'bonus_active';
    bonus.firstStakeId = stake._id;
    bonus.firstStakeAmount = stake.amount;
    bonus.bonusAmount = bonusAmount;
    bonus.bonusPaidOut = 0;
    bonus.remainingBonus = bonusAmount;
    bonus.activatedAt = new Date();
    bonus.requirements.firstStake.completed = true;
    bonus.requirements.firstStake.stakeId = stake._id;
    
    await bonus.save();
    
    console.log(`[Registration Bonus] ✅ Activated for user ${userId}: $${bonusAmount} bonus credit`);
    
    // Optional: Send notification to user
    await sendBonusActivationNotification(userId, bonusAmount);
    
    return bonus;
  } catch (error) {
    console.error('[Registration Bonus] Error processing bonus:', error);
    throw error;
  }
}

async function checkAllRequirements(userId) {
  // Check profile completion
  const userProfile = await UserProfile.findOne({ userId });
  const profileComplete = checkProfileCompletion(userProfile);
  
  // Check social media verification
  const socialMediaVerified = userProfile?.socialMediaAccounts?.some(
    account => account.isVerified
  ) || false;
  
  return {
    allMet: profileComplete && socialMediaVerified,
    profile: profileComplete,
    socialMedia: socialMediaVerified
  };
}
```

### 3. Weekly Payout Processing (UPDATE)

**File:** `services/weeklyPayoutService.js` or `controllers/adminController.js`

**Function:** `processWeeklyPayouts()`

```javascript
async function processWeeklyPayouts(declaredROIPercentage) {
  try {
    console.log(`[Weekly Payout] Processing with ${declaredROIPercentage}% ROI`);
    
    // 1. Process Regular Stake Payouts (existing logic)
    const activeStakes = await Stake.find({ status: 'active' });
    
    for (const stake of activeStakes) {
      const regularPayout = stake.amount * (declaredROIPercentage / 100);
      
      // Credit to earning wallet
      await creditEarningWallet(stake.userId, regularPayout, {
        type: 'stake_roi',
        stakeId: stake._id,
        percentage: declaredROIPercentage
      });
      
      // Update stake tracking
      stake.totalEarned += regularPayout;
      stake.progressToTarget = ((stake.totalEarned / stake.targetReturn) * 100).toFixed(2) + '%';
      stake.remainingToTarget = stake.targetReturn - stake.totalEarned;
      
      // Check if target reached
      if (stake.totalEarned >= stake.targetReturn) {
        stake.status = 'completed';
      }
      
      await stake.save();
      console.log(`[Weekly Payout] Stake ${stake._id}: $${regularPayout} paid`);
    }
    
    // 2. Process Registration Bonus Payouts (NEW LOGIC)
    await processRegistrationBonusPayouts(declaredROIPercentage);
    
    console.log('[Weekly Payout] ✅ All payouts processed successfully');
    
    return {
      success: true,
      roiPercentage: declaredROIPercentage,
      stakesProcessed: activeStakes.length
    };
  } catch (error) {
    console.error('[Weekly Payout] Error:', error);
    throw error;
  }
}

async function processRegistrationBonusPayouts(declaredROIPercentage) {
  // Find all active registration bonuses with remaining balance
  const activeBonuses = await RegistrationBonus.find({
    status: 'bonus_active',
    remainingBonus: { $gt: 0 }
  });
  
  console.log(`[Bonus Payout] Processing ${activeBonuses.length} active bonuses`);
  
  for (const bonus of activeBonuses) {
    try {
      // Calculate bonus payout at same rate as stakes
      const calculatedPayout = bonus.bonusAmount * (declaredROIPercentage / 100);
      
      // Don't pay more than remaining balance
      const actualPayout = Math.min(calculatedPayout, bonus.remainingBonus);
      
      // Credit to earning wallet
      const transaction = await creditEarningWallet(bonus.userId, actualPayout, {
        type: 'registration_bonus',
        bonusId: bonus._id,
        percentage: declaredROIPercentage
      });
      
      // Update bonus tracking
      bonus.bonusPaidOut += actualPayout;
      bonus.remainingBonus = Math.max(0, bonus.remainingBonus - actualPayout);
      
      // Check if fully paid out
      if (bonus.remainingBonus <= 0) {
        bonus.status = 'completed';
        bonus.completedAt = new Date();
        console.log(`[Bonus Payout] ✅ Bonus ${bonus._id} fully paid out: $${bonus.bonusAmount}`);
      }
      
      await bonus.save();
      
      // Record in payout history
      await BonusPayoutHistory.create({
        userId: bonus.userId,
        registrationBonusId: bonus._id,
        week: calculateWeekNumber(bonus.activatedAt),
        payoutDate: new Date(),
        declaredROIPercentage,
        bonusAmountPaid: actualPayout,
        remainingAfterPayout: bonus.remainingBonus,
        transactionId: transaction?._id
      });
      
      console.log(`[Bonus Payout] User ${bonus.userId}: $${actualPayout} paid, $${bonus.remainingBonus} remaining`);
      
    } catch (error) {
      console.error(`[Bonus Payout] Error processing bonus ${bonus._id}:`, error);
      // Continue with other bonuses even if one fails
    }
  }
}

function calculateWeekNumber(activatedDate) {
  const now = new Date();
  const diffTime = Math.abs(now - new Date(activatedDate));
  const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
  return diffWeeks;
}
```

### 4. Wallet Crediting Helper

**File:** `services/walletService.js`

```javascript
async function creditEarningWallet(userId, amount, metadata = {}) {
  try {
    // Find or create user wallet
    let wallet = await Wallet.findOne({ userId });
    
    if (!wallet) {
      wallet = await Wallet.create({
        userId,
        fundedWallet: 0,
        earningWallet: 0
      });
    }
    
    // Credit earning wallet
    wallet.earningWallet += amount;
    await wallet.save();
    
    // Create transaction record
    const transaction = await Transaction.create({
      userId,
      type: metadata.type || 'credit',
      amount,
      walletType: 'earning',
      status: 'completed',
      description: generateDescription(metadata),
      metadata
    });
    
    console.log(`[Wallet] Credited $${amount} to earning wallet for user ${userId}`);
    
    return transaction;
  } catch (error) {
    console.error('[Wallet] Error crediting wallet:', error);
    throw error;
  }
}

function generateDescription(metadata) {
  if (metadata.type === 'stake_roi') {
    return `Weekly ROI payout (${metadata.percentage}%)`;
  } else if (metadata.type === 'registration_bonus') {
    return `Registration bonus payout (${metadata.percentage}%)`;
  }
  return 'Wallet credit';
}
```

---

## 🌐 API Endpoints

### 1. Get Registration Bonus Status (UPDATE)

**Endpoint:** `GET /api/v1/bonuses/registration/status`

**Updated Response:**

```javascript
async function getRegistrationBonusStatus(req, res) {
  const userId = req.user.id;
  
  const bonus = await RegistrationBonus.findOne({ userId })
    .sort({ createdAt: -1 });
  
  if (!bonus) {
    return res.status(404).json({
      success: false,
      message: 'No registration bonus found'
    });
  }
  
  // Get first stake details if exists
  let firstStakeDetails = null;
  if (bonus.firstStakeId) {
    const stake = await Stake.findById(bonus.firstStakeId);
    if (stake) {
      firstStakeDetails = {
        stakeId: stake._id,
        amount: stake.amount,
        createdAt: stake.createdAt
      };
    }
  }
  
  // Calculate progress
  const progressPercentage = calculateProgressPercentage(bonus);
  
  // Build response
  const response = {
    success: true,
    data: {
      status: bonus.status,
      bonusPercentage: bonus.bonusPercentage,
      progressPercentage,
      
      // Bonus credit tracking (NEW)
      bonus: bonus.status === 'bonus_active' || bonus.status === 'completed' ? {
        bonusAmount: bonus.bonusAmount,
        bonusPaidOut: bonus.bonusPaidOut,
        remainingBonus: bonus.remainingBonus,
        payoutPercentage: Math.round((bonus.bonusPaidOut / bonus.bonusAmount) * 100),
        activatedAt: bonus.activatedAt
      } : null,
      
      // First stake info (NEW)
      firstStake: firstStakeDetails,
      
      // Timeline
      timeline: {
        registeredAt: bonus.createdAt,
        expiresAt: bonus.expiresAt,
        activatedAt: bonus.activatedAt,
        completedAt: bonus.completedAt,
        daysRemaining: calculateDaysRemaining(bonus.expiresAt)
      },
      
      // Requirements
      requirements: bonus.requirements,
      allRequirementsMet: bonus.allRequirementsMet
    }
  };
  
  res.json(response);
}
```

### 2. Get Bonus Payout History (NEW)

**Endpoint:** `GET /api/v1/bonuses/registration/payout-history`

```javascript
async function getBonusPayoutHistory(req, res) {
  const userId = req.user.id;
  
  // Find user's registration bonus
  const bonus = await RegistrationBonus.findOne({ 
    userId,
    status: { $in: ['bonus_active', 'completed'] }
  });
  
  if (!bonus) {
    return res.status(404).json({
      success: false,
      message: 'No active or completed bonus found'
    });
  }
  
  // Get payout history
  const payouts = await BonusPayoutHistory.find({
    registrationBonusId: bonus._id
  }).sort({ payoutDate: -1 });
  
  res.json({
    success: true,
    data: {
      bonusAmount: bonus.bonusAmount,
      totalPaidOut: bonus.bonusPaidOut,
      remainingBonus: bonus.remainingBonus,
      payouts: payouts.map(p => ({
        week: p.week,
        date: p.payoutDate,
        roiPercentage: p.declaredROIPercentage,
        amount: p.bonusAmountPaid,
        remainingAfter: p.remainingAfterPayout
      }))
    }
  });
}
```

### 3. Admin: Declare Weekly ROI (UPDATE)

**Endpoint:** `POST /api/v1/admin/declare-weekly-roi`

**Updated to include bonus processing:**

```javascript
async function declareWeeklyROI(req, res) {
  const { percentage } = req.body;
  
  // Validate admin permission
  if (!req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Unauthorized'
    });
  }
  
  // Validate percentage
  if (!percentage || percentage <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid percentage'
    });
  }
  
  try {
    // Process all payouts (stakes + bonuses)
    const result = await processWeeklyPayouts(percentage);
    
    // Record the declaration
    await WeeklyROIDeclaration.create({
      declaredBy: req.user.id,
      percentage,
      processedAt: new Date()
    });
    
    res.json({
      success: true,
      message: `Successfully processed ${result.stakesProcessed} stakes with ${percentage}% ROI`,
      data: result
    });
  } catch (error) {
    console.error('[Admin] Error declaring weekly ROI:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process weekly payouts'
    });
  }
}
```

---

## 🧪 Testing Checklist

### Unit Tests

- [ ] `processRegistrationBonus()` activates bonus correctly
- [ ] `processRegistrationBonusPayouts()` calculates payouts correctly
- [ ] `creditEarningWallet()` updates wallet balance
- [ ] Bonus depletion logic (remainingBonus reaches 0)
- [ ] Week number calculation
- [ ] Edge case: Bonus payout > remaining balance

### Integration Tests

- [ ] End-to-end: User registration → profile → social → first stake → bonus activation
- [ ] Weekly payout: Both stake ROI and bonus payout credited
- [ ] Bonus completion: Status changes to 'completed' when depleted
- [ ] Payout history: Records created for each weekly payout
- [ ] Multiple users: Concurrent bonus payouts

### Manual Testing Scenarios

1. **New User Flow:**
   - Register → Complete profile → Verify Instagram → Stake $100
   - Verify bonus activated with $10 credit
   - Check earning wallet for initial state

2. **Weekly Payout:**
   - Admin declares 2.5% ROI
   - Verify stake ROI: $2.50 credited
   - Verify bonus payout: $0.25 credited
   - Check bonus remaining: $9.75

3. **Bonus Depletion:**
   - Continue weekly payouts over multiple weeks
   - Verify remainingBonus decreases each week
   - Verify status changes to 'completed' when depleted

4. **Edge Cases:**
   - User stakes < $20 (should not activate)
   - User stakes after 7 days (bonus expired)
   - User with incomplete requirements

---

## 📊 Database Migration Script

```javascript
// migration_add_bonus_credit_tracking.js

async function migrateBonusTracking() {
  console.log('Starting registration bonus migration...');
  
  // Find all bonuses with old structure
  const bonuses = await RegistrationBonus.find({});
  
  for (const bonus of bonuses) {
    // If bonus was already activated (has bonusAmount)
    if (bonus.bonusAmount && !bonus.hasOwnProperty('bonusPaidOut')) {
      // Assume no payouts yet (fresh migration)
      bonus.bonusPaidOut = 0;
      bonus.remainingBonus = bonus.bonusAmount;
      
      // If there's a first stake, get its details
      if (bonus.requirements?.firstStake?.stakeId) {
        const stake = await Stake.findById(bonus.requirements.firstStake.stakeId);
        if (stake) {
          bonus.firstStakeId = stake._id;
          bonus.firstStakeAmount = stake.amount;
          bonus.activatedAt = stake.createdAt;
        }
      }
      
      await bonus.save();
      console.log(`Migrated bonus for user ${bonus.userId}`);
    }
  }
  
  console.log('Migration completed!');
}

// Run migration
migrateBonusTracking()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
```

---

## 🚀 Deployment Steps

1. **Backup Database**
   ```bash
   mongodump --db novunt --out backup_before_bonus_migration
   ```

2. **Update Models**
   - Add new fields to RegistrationBonus model
   - Create BonusPayoutHistory model

3. **Run Migration**
   ```bash
   node migrations/migration_add_bonus_credit_tracking.js
   ```

4. **Deploy Updated Services**
   - Update stakingController (first stake processing)
   - Update registrationBonusService (activation logic)
   - Update weeklyPayoutService (bonus payout processing)

5. **Deploy New API Endpoints**
   - Update GET `/bonuses/registration/status` response
   - Add GET `/bonuses/registration/payout-history`
   - Update POST `/admin/declare-weekly-roi`

6. **Test in Staging**
   - Run full test suite
   - Manual testing of complete flow
   - Verify payout calculations

7. **Deploy to Production**
   - Deploy during low-traffic window
   - Monitor logs for errors
   - Verify first bonus payout works correctly

8. **Notify Frontend Team**
   - API response structure updated
   - New payout history endpoint available
   - Ready for frontend integration

---

## 📝 Summary

### Key Changes:

1. **No Separate Bonus Stake:** Bonus is tracked as credit, not stake
2. **Gradual Payout:** Paid bit-by-bit using weekly ROI percentage
3. **Same ROI Rate:** Bonus earns at same rate as regular stakes
4. **Transparent Tracking:** User can see remaining bonus at all times
5. **Payout History:** Complete record of each week's bonus distribution

### Benefits:

- ✅ Simpler for users (no confusing second stake)
- ✅ Transparent tracking (clear remaining balance)
- ✅ Fair distribution (tied to actual weekly ROI)
- ✅ Easy to audit (complete payout history)
- ✅ Scalable (handles any number of active bonuses)

### Next Steps:

1. Backend team implements changes
2. Run database migration
3. Deploy to staging
4. Test thoroughly
5. Deploy to production
6. Frontend integrates updated API
7. Monitor and refine

---

**Questions or clarifications needed? Contact frontend team!**
