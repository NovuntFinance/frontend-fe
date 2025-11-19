# 🎯 Backend Requirements: Registration Bonus Gradual Payout System

**Date:** November 18, 2025  
**Prepared By:** Frontend Team  
**Priority:** HIGH  
**Estimated Backend Effort:** 3-5 days

---

## 📋 Executive Summary

The registration bonus system currently has an incorrect payment mechanism. This document outlines the required changes to implement the **correct gradual payout system** where bonus credits are paid bit-by-bit using weekly ROI declarations, rather than creating a separate bonus stake.

### What Needs to Change

| Current (Incorrect) | Required (Correct) |
|---------------------|-------------------|
| Creates separate bonus stake | Create bonus credit tracking |
| Bonus stake earns 200% ROI | Bonus pays at weekly ROI % until depleted |
| Shows as second stake | Invisible to stakes list |
| Complex multi-stake logic | Simple credit depletion |

### Impact

- **Users:** More transparent bonus tracking
- **Admin:** Simpler weekly payout processing
- **Database:** New fields + new model for history
- **APIs:** Updated responses + 1 new endpoint

---

## 🗄️ Database Changes Required

### 1. Update RegistrationBonus Model

**Add these fields to existing `RegistrationBonus` schema:**

```javascript
// File: models/RegistrationBonus.js (or .ts)

const RegistrationBonusSchema = new Schema({
  // ========================================
  // EXISTING FIELDS (keep as-is)
  // ========================================
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'requirements_met', 'bonus_active', 'completed', 'expired', 'cancelled'],
    default: 'pending'
  },
  bonusPercentage: {
    type: Number,
    default: 10, // 10% of first stake
    required: true
  },
  requirements: {
    profileCompletion: {
      completed: { type: Boolean, default: false },
      percentage: { type: Number, default: 0 }
    },
    socialMediaVerification: {
      completed: { type: Boolean, default: false },
      verifiedCount: { type: Number, default: 0 },
      totalRequired: { type: Number, default: 5 }
    },
    firstStake: {
      completed: { type: Boolean, default: false },
      stakeId: { type: Schema.Types.ObjectId, ref: 'Stake', default: null }
    }
  },
  allRequirementsMet: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  // ========================================
  // NEW FIELDS (ADD THESE)
  // ========================================
  
  // First Stake Information
  firstStakeId: {
    type: Schema.Types.ObjectId,
    ref: 'Stake',
    default: null,
    index: true
  },
  firstStakeAmount: {
    type: Number,
    default: null,
    min: 0
  },
  
  // Bonus Credit Tracking
  bonusAmount: {
    type: Number,
    default: null,
    min: 0,
    description: 'Total bonus credit earned (10% of first stake amount)'
  },
  bonusPaidOut: {
    type: Number,
    default: 0,
    min: 0,
    description: 'Cumulative amount already paid via weekly ROI'
  },
  remainingBonus: {
    type: Number,
    default: 0,
    min: 0,
    description: 'Amount still to be paid out',
    index: true // For efficient querying of active bonuses
  },
  
  // Timeline
  activatedAt: {
    type: Date,
    default: null,
    description: 'When user made first stake and bonus was activated'
  },
  completedAt: {
    type: Date,
    default: null,
    description: 'When remainingBonus reached 0 and bonus fully paid'
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add indexes for performance
RegistrationBonusSchema.index({ userId: 1 });
RegistrationBonusSchema.index({ status: 1 });
RegistrationBonusSchema.index({ remainingBonus: 1 }); // For weekly payout queries
RegistrationBonusSchema.index({ status: 1, remainingBonus: 1 }); // Compound for active bonuses

// Update timestamp on save
RegistrationBonusSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});
```

### 2. Create New BonusPayoutHistory Model

**Create this new model to track individual weekly payouts:**

```javascript
// File: models/BonusPayoutHistory.js (or .ts)

const BonusPayoutHistorySchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  registrationBonusId: {
    type: Schema.Types.ObjectId,
    ref: 'RegistrationBonus',
    required: true,
    index: true
  },
  week: {
    type: Number,
    required: true,
    min: 1,
    description: 'Week number since bonus activation (1, 2, 3, ...)'
  },
  payoutDate: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  declaredROIPercentage: {
    type: Number,
    required: true,
    min: 0,
    description: 'Admin-declared ROI percentage for that week'
  },
  bonusAmountPaid: {
    type: Number,
    required: true,
    min: 0,
    description: 'Amount of bonus credit paid in this week'
  },
  remainingAfterPayout: {
    type: Number,
    required: true,
    min: 0,
    description: 'Remaining bonus credit after this payout'
  },
  transactionId: {
    type: String,
    default: null,
    description: 'Reference to wallet transaction ID'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient history queries
BonusPayoutHistorySchema.index({ userId: 1, payoutDate: -1 });
BonusPayoutHistorySchema.index({ registrationBonusId: 1, week: 1 });

module.exports = mongoose.model('BonusPayoutHistory', BonusPayoutHistorySchema);
```

---

## 🔧 Core Logic Changes

### 1. First Stake Processing (CRITICAL UPDATE)

**File:** `controllers/stakingController.js` (or similar)  
**Function:** `createStake()` or equivalent

**What to change:**

```javascript
// CURRENT CODE (approximate):
async function createStake(req, res) {
  const { amount, source } = req.body;
  const userId = req.user.id;
  
  // ... validation ...
  
  // Create stake
  const stake = await Stake.create({
    userId,
    amount,
    source,
    targetReturn: amount * 2,
    status: 'active'
  });
  
  // ... maybe some bonus processing here ...
  
  return res.json({ success: true, stake });
}

// NEW CODE (add this logic):
async function createStake(req, res) {
  const { amount, source } = req.body;
  const userId = req.user.id;
  
  // ... validation ...
  
  // Create stake
  const stake = await Stake.create({
    userId,
    amount,
    source,
    targetReturn: amount * 2,
    status: 'active'
  });
  
  // ============================================
  // ADD THIS: Check if this is the first stake
  // ============================================
  const stakeCount = await Stake.countDocuments({ 
    userId, 
    status: { $in: ['active', 'completed'] } 
  });
  
  if (stakeCount === 1) {
    // This is the first stake - process registration bonus
    try {
      const bonusResult = await processRegistrationBonus(userId, stake);
      if (bonusResult) {
        console.log(`[Registration Bonus] ✅ Activated for user ${userId}: $${bonusResult.bonusAmount}`);
      }
    } catch (error) {
      console.error('[Registration Bonus] Error processing bonus:', error);
      // Don't fail stake creation if bonus processing fails
    }
  }
  
  return res.json({ 
    success: true, 
    stake,
    message: stakeCount === 1 ? 'Stake created and bonus activated!' : 'Stake created successfully'
  });
}
```

### 2. Registration Bonus Activation Logic (NEW FUNCTION)

**File:** `services/registrationBonusService.js` (create if doesn't exist)  
**Function:** `processRegistrationBonus()` (NEW)

```javascript
/**
 * Process registration bonus when user creates first stake
 * @param {ObjectId} userId - User ID
 * @param {Object} stake - The first stake object
 * @returns {Object|null} - Updated bonus object or null if not eligible
 */
async function processRegistrationBonus(userId, stake) {
  try {
    // 1. Find active registration bonus
    const bonus = await RegistrationBonus.findOne({
      userId,
      status: { $in: ['pending', 'requirements_met'] },
      expiresAt: { $gt: new Date() } // Not expired
    });
    
    if (!bonus) {
      console.log(`[Registration Bonus] No active bonus found for user ${userId}`);
      return null;
    }
    
    // 2. Check minimum stake amount
    const MIN_STAKE_AMOUNT = 20;
    if (stake.amount < MIN_STAKE_AMOUNT) {
      console.log(`[Registration Bonus] Stake amount ${stake.amount} below minimum ${MIN_STAKE_AMOUNT}`);
      return null;
    }
    
    // 3. Verify all requirements are met
    const userProfile = await UserProfile.findOne({ userId });
    
    // Check profile completion
    const profileComplete = checkProfileCompletion(userProfile);
    
    // Check social media verification
    const socialMediaVerified = userProfile?.socialMediaAccounts?.some(
      account => account.isVerified
    ) || false;
    
    if (!profileComplete || !socialMediaVerified) {
      console.log(`[Registration Bonus] Requirements not met - Profile: ${profileComplete}, Social: ${socialMediaVerified}`);
      return null;
    }
    
    // 4. Calculate bonus amount
    const bonusAmount = stake.amount * (bonus.bonusPercentage / 100);
    
    // 5. Update registration bonus with bonus credit
    bonus.status = 'bonus_active';
    bonus.firstStakeId = stake._id;
    bonus.firstStakeAmount = stake.amount;
    bonus.bonusAmount = bonusAmount;
    bonus.bonusPaidOut = 0;
    bonus.remainingBonus = bonusAmount;
    bonus.activatedAt = new Date();
    bonus.requirements.firstStake.completed = true;
    bonus.requirements.firstStake.stakeId = stake._id;
    bonus.allRequirementsMet = true;
    
    await bonus.save();
    
    console.log(`[Registration Bonus] ✅ Bonus activated:`, {
      userId,
      firstStakeAmount: stake.amount,
      bonusAmount,
      bonusPercentage: bonus.bonusPercentage
    });
    
    // 6. Optional: Send notification to user
    try {
      await sendBonusActivationNotification(userId, bonusAmount);
    } catch (notifError) {
      console.error('[Registration Bonus] Notification error:', notifError);
      // Don't fail the bonus activation if notification fails
    }
    
    return bonus;
  } catch (error) {
    console.error('[Registration Bonus] Error in processRegistrationBonus:', error);
    throw error;
  }
}

/**
 * Check if user profile is 100% complete
 */
function checkProfileCompletion(userProfile) {
  if (!userProfile) return false;
  
  return Boolean(
    userProfile.dateOfBirth &&
    userProfile.gender &&
    userProfile.profilePhoto &&
    userProfile.address
  );
}

module.exports = {
  processRegistrationBonus
};
```

### 3. Weekly Payout Processing (MAJOR UPDATE)

**File:** `services/weeklyPayoutService.js` or `controllers/adminController.js`  
**Function:** `processWeeklyPayouts()` or similar

**What to change:**

```javascript
/**
 * Process weekly ROI payouts for all active stakes AND registration bonuses
 * @param {Number} declaredROIPercentage - Admin-declared ROI percentage
 * @returns {Object} - Payout results
 */
async function processWeeklyPayouts(declaredROIPercentage) {
  try {
    console.log(`\n========================================`);
    console.log(`[Weekly Payout] Starting with ${declaredROIPercentage}% ROI`);
    console.log(`========================================\n`);
    
    const results = {
      success: true,
      roiPercentage: declaredROIPercentage,
      stakes: { processed: 0, totalPaid: 0 },
      bonuses: { processed: 0, totalPaid: 0, completed: 0 },
      errors: []
    };
    
    // ============================================
    // PART 1: Process Regular Stake Payouts
    // ============================================
    const activeStakes = await Stake.find({ status: 'active' });
    console.log(`[Weekly Payout] Processing ${activeStakes.length} active stakes...`);
    
    for (const stake of activeStakes) {
      try {
        const regularPayout = stake.amount * (declaredROIPercentage / 100);
        
        // Credit to earning wallet
        await creditEarningWallet(stake.userId, regularPayout, {
          type: 'stake_roi',
          stakeId: stake._id,
          percentage: declaredROIPercentage
        });
        
        // Update stake tracking
        stake.totalEarned = (stake.totalEarned || 0) + regularPayout;
        stake.progressToTarget = ((stake.totalEarned / stake.targetReturn) * 100).toFixed(2) + '%';
        stake.remainingToTarget = stake.targetReturn - stake.totalEarned;
        
        // Check if target reached (200% ROI = 2x original amount)
        if (stake.totalEarned >= stake.targetReturn) {
          stake.status = 'completed';
          console.log(`[Weekly Payout] 🎉 Stake ${stake._id} completed! Total earned: $${stake.totalEarned}`);
        }
        
        await stake.save();
        
        results.stakes.processed++;
        results.stakes.totalPaid += regularPayout;
        
        console.log(`[Weekly Payout] Stake ${stake._id}: $${regularPayout.toFixed(2)} paid (${stake.progressToTarget} complete)`);
      } catch (error) {
        console.error(`[Weekly Payout] Error processing stake ${stake._id}:`, error);
        results.errors.push({ stakeId: stake._id, error: error.message });
      }
    }
    
    // ============================================
    // PART 2: Process Registration Bonus Payouts (NEW)
    // ============================================
    await processRegistrationBonusPayouts(declaredROIPercentage, results);
    
    console.log(`\n========================================`);
    console.log(`[Weekly Payout] ✅ COMPLETED`);
    console.log(`Stakes: ${results.stakes.processed} processed, $${results.stakes.totalPaid.toFixed(2)} paid`);
    console.log(`Bonuses: ${results.bonuses.processed} processed, $${results.bonuses.totalPaid.toFixed(2)} paid`);
    console.log(`Bonuses Completed: ${results.bonuses.completed}`);
    console.log(`========================================\n`);
    
    return results;
  } catch (error) {
    console.error('[Weekly Payout] CRITICAL ERROR:', error);
    throw error;
  }
}

/**
 * Process registration bonus payouts (NEW FUNCTION)
 */
async function processRegistrationBonusPayouts(declaredROIPercentage, results) {
  // Find all active registration bonuses with remaining balance
  const activeBonuses = await RegistrationBonus.find({
    status: 'bonus_active',
    remainingBonus: { $gt: 0 }
  }).populate('userId', 'email username');
  
  console.log(`\n[Bonus Payout] Processing ${activeBonuses.length} active bonuses...`);
  
  for (const bonus of activeBonuses) {
    try {
      // Calculate bonus payout at same rate as stakes
      const calculatedPayout = bonus.bonusAmount * (declaredROIPercentage / 100);
      
      // Don't pay more than remaining balance
      const actualPayout = Math.min(calculatedPayout, bonus.remainingBonus);
      
      // Credit to earning wallet
      const transaction = await creditEarningWallet(bonus.userId._id || bonus.userId, actualPayout, {
        type: 'registration_bonus',
        bonusId: bonus._id,
        percentage: declaredROIPercentage
      });
      
      // Update bonus tracking
      bonus.bonusPaidOut = (bonus.bonusPaidOut || 0) + actualPayout;
      bonus.remainingBonus = Math.max(0, bonus.remainingBonus - actualPayout);
      
      // Calculate week number
      const weekNumber = calculateWeeksSinceActivation(bonus.activatedAt);
      
      // Check if fully paid out
      const isCompleted = bonus.remainingBonus <= 0.01; // Account for floating point
      if (isCompleted) {
        bonus.status = 'completed';
        bonus.completedAt = new Date();
        bonus.remainingBonus = 0; // Ensure it's exactly 0
        results.bonuses.completed++;
        console.log(`[Bonus Payout] 🎉 Bonus ${bonus._id} FULLY PAID! Total: $${bonus.bonusAmount.toFixed(2)}`);
      }
      
      await bonus.save();
      
      // Record in payout history
      await BonusPayoutHistory.create({
        userId: bonus.userId._id || bonus.userId,
        registrationBonusId: bonus._id,
        week: weekNumber,
        payoutDate: new Date(),
        declaredROIPercentage,
        bonusAmountPaid: actualPayout,
        remainingAfterPayout: bonus.remainingBonus,
        transactionId: transaction?._id?.toString()
      });
      
      results.bonuses.processed++;
      results.bonuses.totalPaid += actualPayout;
      
      const payoutPercent = ((bonus.bonusPaidOut / bonus.bonusAmount) * 100).toFixed(1);
      console.log(`[Bonus Payout] User ${bonus.userId.email || bonus.userId}: $${actualPayout.toFixed(2)} paid | ${payoutPercent}% complete | $${bonus.remainingBonus.toFixed(2)} remaining`);
      
    } catch (error) {
      console.error(`[Bonus Payout] Error processing bonus ${bonus._id}:`, error);
      results.errors.push({ bonusId: bonus._id, error: error.message });
    }
  }
}

/**
 * Calculate weeks since bonus activation
 */
function calculateWeeksSinceActivation(activatedDate) {
  if (!activatedDate) return 1;
  const now = new Date();
  const diffTime = Math.abs(now - new Date(activatedDate));
  const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
  return Math.max(1, diffWeeks);
}

module.exports = {
  processWeeklyPayouts,
  processRegistrationBonusPayouts
};
```

### 4. Wallet Crediting Function

**File:** `services/walletService.js`

```javascript
/**
 * Credit amount to user's earning wallet
 * @param {ObjectId} userId - User ID
 * @param {Number} amount - Amount to credit
 * @param {Object} metadata - Transaction metadata
 * @returns {Object} - Transaction record
 */
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
      console.log(`[Wallet] Created new wallet for user ${userId}`);
    }
    
    // Credit earning wallet
    wallet.earningWallet = (wallet.earningWallet || 0) + amount;
    await wallet.save();
    
    // Generate description
    let description = 'Wallet credit';
    if (metadata.type === 'stake_roi') {
      description = `Weekly ROI payout (${metadata.percentage}% on stake)`;
    } else if (metadata.type === 'registration_bonus') {
      description = `Registration bonus payout (${metadata.percentage}% ROI)`;
    }
    
    // Create transaction record
    const transaction = await Transaction.create({
      userId,
      type: metadata.type || 'credit',
      amount,
      walletType: 'earning',
      status: 'completed',
      description,
      metadata: {
        ...metadata,
        creditedAt: new Date()
      }
    });
    
    console.log(`[Wallet] ✅ Credited $${amount.toFixed(2)} to earning wallet for user ${userId}`);
    
    return transaction;
  } catch (error) {
    console.error('[Wallet] Error crediting wallet:', error);
    throw error;
  }
}

module.exports = {
  creditEarningWallet
};
```

---

## 🌐 API Endpoint Changes

### 1. GET /api/v1/bonuses/registration/status (UPDATE)

**Current response:** (may vary)
**Required response:**

```javascript
// File: controllers/registrationBonusController.js

async function getRegistrationBonusStatus(req, res) {
  try {
    const userId = req.user.id;
    
    // Find user's registration bonus
    const bonus = await RegistrationBonus.findOne({ userId })
      .sort({ createdAt: -1 })
      .lean();
    
    if (!bonus) {
      return res.status(404).json({
        success: false,
        message: 'No registration bonus found'
      });
    }
    
    // Get first stake details if exists
    let firstStakeDetails = null;
    if (bonus.firstStakeId) {
      const stake = await Stake.findById(bonus.firstStakeId).lean();
      if (stake) {
        firstStakeDetails = {
          stakeId: stake._id,
          amount: stake.amount,
          createdAt: stake.createdAt
        };
      }
    }
    
    // Calculate progress percentage
    let progressPercentage = 0;
    if (bonus.requirements.profileCompletion.completed) progressPercentage += 25;
    if (bonus.requirements.socialMediaVerification.completed) progressPercentage += 25;
    if (bonus.requirements.firstStake.completed) progressPercentage += 25;
    if (bonus.status === 'bonus_active' || bonus.status === 'completed') progressPercentage = 100;
    
    // Calculate days remaining
    const now = new Date();
    const expiryDate = new Date(bonus.expiresAt);
    const daysRemaining = Math.max(0, Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24)));
    
    // Build response
    const response = {
      success: true,
      data: {
        // Status
        status: bonus.status,
        bonusPercentage: bonus.bonusPercentage,
        progressPercentage,
        
        // Bonus credit tracking (NEW - crucial for frontend)
        bonus: (bonus.status === 'bonus_active' || bonus.status === 'completed') ? {
          bonusAmount: bonus.bonusAmount,
          bonusPaidOut: bonus.bonusPaidOut || 0,
          remainingBonus: bonus.remainingBonus || 0,
          payoutPercentage: bonus.bonusAmount > 0 
            ? Math.round((bonus.bonusPaidOut / bonus.bonusAmount) * 100) 
            : 0,
          activatedAt: bonus.activatedAt
        } : null,
        
        // First stake info (NEW)
        firstStake: firstStakeDetails,
        
        // Timeline
        timeline: {
          registeredAt: bonus.createdAt,
          expiresAt: bonus.expiresAt,
          activatedAt: bonus.activatedAt || null,
          completedAt: bonus.completedAt || null,
          daysRemaining
        },
        
        // Requirements
        requirements: bonus.requirements,
        allRequirementsMet: bonus.allRequirementsMet || false
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('[Registration Bonus API] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch registration bonus status'
    });
  }
}
```

### 2. GET /api/v1/bonuses/registration/payout-history (NEW)

**Create this new endpoint:**

```javascript
// File: controllers/registrationBonusController.js

async function getBonusPayoutHistory(req, res) {
  try {
    const userId = req.user.id;
    
    // Find user's registration bonus
    const bonus = await RegistrationBonus.findOne({ 
      userId,
      status: { $in: ['bonus_active', 'completed'] }
    }).lean();
    
    if (!bonus) {
      return res.status(404).json({
        success: false,
        message: 'No active or completed bonus found'
      });
    }
    
    // Get payout history, sorted by most recent first
    const payouts = await BonusPayoutHistory.find({
      registrationBonusId: bonus._id
    })
      .sort({ payoutDate: -1 })
      .lean();
    
    res.json({
      success: true,
      data: {
        bonusAmount: bonus.bonusAmount,
        totalPaidOut: bonus.bonusPaidOut || 0,
        remainingBonus: bonus.remainingBonus || 0,
        status: bonus.status,
        payouts: payouts.map(p => ({
          week: p.week,
          date: p.payoutDate,
          roiPercentage: p.declaredROIPercentage,
          amount: p.bonusAmountPaid,
          remainingAfter: p.remainingAfterPayout
        }))
      }
    });
  } catch (error) {
    console.error('[Bonus Payout History API] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payout history'
    });
  }
}

// Add route
router.get('/bonuses/registration/payout-history', 
  authenticate, 
  getBonusPayoutHistory
);
```

### 3. POST /api/v1/admin/declare-weekly-roi (UPDATE)

**Update to include bonus processing:**

```javascript
// File: controllers/adminController.js

async function declareWeeklyROI(req, res) {
  try {
    const { percentage } = req.body;
    
    // Validate admin permission
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Admin access required'
      });
    }
    
    // Validate percentage
    if (!percentage || percentage <= 0 || percentage > 100) {
      return res.status(400).json({
        success: false,
        message: 'Invalid percentage value'
      });
    }
    
    console.log(`[Admin] Declaring ${percentage}% weekly ROI...`);
    
    // Process all payouts (stakes + bonuses)
    const result = await processWeeklyPayouts(percentage);
    
    // Record the declaration
    await WeeklyROIDeclaration.create({
      declaredBy: req.user.id,
      percentage,
      processedAt: new Date(),
      stakesProcessed: result.stakes.processed,
      bonusesProcessed: result.bonuses.processed,
      totalPaid: result.stakes.totalPaid + result.bonuses.totalPaid
    });
    
    res.json({
      success: true,
      message: `Successfully processed payouts with ${percentage}% ROI`,
      data: {
        roiPercentage: percentage,
        stakes: result.stakes,
        bonuses: result.bonuses,
        errors: result.errors
      }
    });
  } catch (error) {
    console.error('[Admin] Error declaring weekly ROI:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process weekly payouts',
      error: error.message
    });
  }
}
```

---

## 📊 Testing Requirements

### Unit Tests to Add

```javascript
// tests/registrationBonus.test.js

describe('Registration Bonus - Gradual Payout', () => {
  
  test('Should activate bonus on first stake', async () => {
    // Create user with completed requirements
    // Create first stake >= $20
    // Verify bonus.status = 'bonus_active'
    // Verify bonusAmount = stake.amount * 0.10
    // Verify remainingBonus = bonusAmount
    // Verify bonusPaidOut = 0
  });
  
  test('Should not activate if stake < $20', async () => {
    // Create stake of $15
    // Verify bonus status unchanged
  });
  
  test('Should not activate if requirements incomplete', async () => {
    // Create stake with incomplete profile
    // Verify bonus not activated
  });
  
  test('Should pay bonus at same ROI percentage', async () => {
    // Activate bonus with $100 stake ($10 bonus)
    // Process weekly payout at 2.5%
    // Verify $0.25 paid from bonus
    // Verify remainingBonus = $9.75
  });
  
  test('Should complete bonus when depleted', async () => {
    // Set remainingBonus to $5
    // Process weekly payout at 10% (would pay $10)
    // Verify only $5 paid (remaining amount)
    // Verify remainingBonus = 0
    // Verify status = 'completed'
    // Verify completedAt is set
  });
  
  test('Should create payout history records', async () => {
    // Process weekly payout
    // Verify BonusPayoutHistory record created
    // Verify all fields populated correctly
  });
});
```

### Integration Tests

```javascript
describe('End-to-End: Registration Bonus Flow', () => {
  
  test('Complete flow: Registration → Stake → Weekly Payouts → Completion', async () => {
    // 1. Register user
    // 2. Complete profile
    // 3. Verify social media
    // 4. Create first stake $100
    // 5. Verify bonus activated ($10 credit)
    // 6. Process 5 weekly payouts at 2.5%
    // 7. Verify bonus partially paid
    // 8. Continue until bonus depleted
    // 9. Verify bonus completed
    // 10. Verify payout history accurate
  });
});
```

### Manual Testing Checklist

- [ ] **Fresh User Flow:**
  - [ ] Register new user
  - [ ] Complete profile (100%)
  - [ ] Verify 1 social media platform
  - [ ] Create first stake ($50)
  - [ ] Verify bonus activated with $5 credit
  - [ ] Check database: bonusAmount=5, remainingBonus=5, bonusPaidOut=0

- [ ] **Weekly Payout:**
  - [ ] Admin declares 2.5% ROI
  - [ ] Verify stake payout: $1.25 credited
  - [ ] Verify bonus payout: $0.125 credited
  - [ ] Verify remainingBonus decreased
  - [ ] Check BonusPayoutHistory record created

- [ ] **Bonus Completion:**
  - [ ] Continue weekly payouts
  - [ ] Monitor remainingBonus approaching 0
  - [ ] Verify final payout doesn't exceed remaining
  - [ ] Verify status changes to 'completed'
  - [ ] Verify completedAt timestamp set

- [ ] **Edge Cases:**
  - [ ] Stake < $20 (should not activate)
  - [ ] Stake after 7 days (bonus expired)
  - [ ] Incomplete requirements (should not activate)
  - [ ] Multiple users with active bonuses (concurrent processing)
  - [ ] Very high ROI percentage (10%+) with low remaining bonus

---

## 🔄 Database Migration Script

**Run this once to migrate existing data:**

```javascript
// migrations/add_bonus_credit_tracking.js

const mongoose = require('mongoose');
const RegistrationBonus = require('../models/RegistrationBonus');
const Stake = require('../models/Stake');

async function migrateBonusCreditTracking() {
  try {
    console.log('Starting registration bonus migration...\n');
    
    const bonuses = await RegistrationBonus.find({});
    console.log(`Found ${bonuses.length} registration bonus records\n`);
    
    let migrated = 0;
    let skipped = 0;
    
    for (const bonus of bonuses) {
      // Skip if already migrated
      if (bonus.hasOwnProperty('bonusPaidOut')) {
        skipped++;
        continue;
      }
      
      // If bonus was activated (has bonusAmount from old system)
      if (bonus.bonusAmount && bonus.bonusAmount > 0) {
        bonus.bonusPaidOut = 0;
        bonus.remainingBonus = bonus.bonusAmount;
        
        // Try to get first stake details
        if (bonus.requirements?.firstStake?.stakeId) {
          const stake = await Stake.findById(bonus.requirements.firstStake.stakeId);
          if (stake) {
            bonus.firstStakeId = stake._id;
            bonus.firstStakeAmount = stake.amount;
            bonus.activatedAt = stake.createdAt;
          }
        }
        
        await bonus.save();
        migrated++;
        console.log(`✅ Migrated bonus for user ${bonus.userId} - $${bonus.bonusAmount} credit`);
      } else {
        // Not yet activated - just add fields with default values
        bonus.bonusPaidOut = 0;
        bonus.remainingBonus = 0;
        await bonus.save();
        migrated++;
        console.log(`✅ Initialized fields for user ${bonus.userId}`);
      }
    }
    
    console.log(`\n========================================`);
    console.log(`Migration completed!`);
    console.log(`Migrated: ${migrated}`);
    console.log(`Skipped: ${skipped}`);
    console.log(`========================================`);
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Run migration
if (require.main === module) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => migrateBonusCreditTracking())
    .then(() => {
      console.log('\n✅ Migration successful');
      process.exit(0);
    })
    .catch(err => {
      console.error('\n❌ Migration failed:', err);
      process.exit(1);
    });
}

module.exports = { migrateBonusCreditTracking };
```

---

## 🚀 Deployment Steps

### Pre-Deployment

1. **Backup Production Database**
   ```bash
   # Backup entire database
   mongodump --uri="mongodb://..." --out=backup_$(date +%Y%m%d)
   
   # Or just RegistrationBonus collection
   mongodump --uri="mongodb://..." --collection=registrationbonuses --out=backup_bonus_$(date +%Y%m%d)
   ```

2. **Test in Development**
   - Deploy all changes to dev environment
   - Run migration script
   - Create test user and complete flow
   - Process test weekly payout
   - Verify all calculations correct

3. **Test in Staging**
   - Deploy to staging with production-like data
   - Run full test suite
   - Manual end-to-end testing
   - Load testing (multiple concurrent bonuses)

### Deployment Sequence

**Step 1: Database Models** (Low Risk)
```bash
# Deploy model changes first
git checkout main
git pull
# Deploy RegistrationBonus model updates
# Deploy new BonusPayoutHistory model
pm2 restart api
```

**Step 2: Run Migration** (Medium Risk)
```bash
# Run during low-traffic period
node migrations/add_bonus_credit_tracking.js

# Verify migration success
mongo <database-url>
db.registrationbonuses.find({ bonusPaidOut: { $exists: true } }).count()
```

**Step 3: Core Logic** (High Risk - Deploy Carefully)
```bash
# Deploy in order:
# 1. Wallet service (creditEarningWallet)
# 2. Registration bonus service (processRegistrationBonus)
# 3. Weekly payout service (processRegistrationBonusPayouts)
# 4. Staking controller (first stake detection)

pm2 restart api
# Monitor logs immediately
pm2 logs api --lines 100
```

**Step 4: API Endpoints** (Low Risk)
```bash
# Deploy updated API responses
# Add new payout history endpoint
pm2 restart api
```

**Step 5: Verify** (Critical)
```bash
# Test APIs
curl -X GET https://api.novunt.com/v1/bonuses/registration/status \
  -H "Authorization: Bearer <token>"

# Should see new "bonus" object in response
```

### Post-Deployment Monitoring

**Monitor for 24 hours:**
- [ ] Check error logs every hour
- [ ] Verify wallet credits are correct
- [ ] Monitor bonus depletion rates
- [ ] Verify payout history records creating
- [ ] Check user complaints/support tickets
- [ ] Verify admin weekly payout works correctly

**Key Metrics to Watch:**
- Active bonuses count: `db.registrationbonuses.find({ status: 'bonus_active' }).count()`
- Total remaining bonus: `db.registrationbonuses.aggregate([{ $match: { status: 'bonus_active' }}, { $group: { _id: null, total: { $sum: '$remainingBonus' }}}])`
- Payout history records: `db.bonuspayouthistories.count()`
- Failed transactions: Check transaction logs for errors

---

## 🔒 Rollback Plan

**If critical issues occur:**

### Immediate Rollback Steps

1. **Revert Code Deploy**
   ```bash
   git revert <commit-hash>
   pm2 restart api
   ```

2. **Restore Database** (If needed)
   ```bash
   mongorestore --uri="mongodb://..." backup_20251118/
   ```

3. **Disable Bonus Processing** (Emergency)
   ```javascript
   // Quick fix: Add feature flag check
   if (!process.env.ENABLE_BONUS_GRADUAL_PAYOUT) {
     return; // Skip bonus processing
   }
   ```

### Partial Rollback (If only bonus broken)

- Keep stake creation working
- Disable bonus activation temporarily
- Fix issue and redeploy
- Re-enable bonus processing

---

## 📞 Communication Plan

### Internal Team

**Before Deployment:**
- Notify all developers of changes
- Schedule deployment during low-traffic window
- Ensure backend team lead available for monitoring

**During Deployment:**
- Live updates in team chat
- Alert if any issues detected
- Ready for immediate rollback if needed

**After Deployment:**
- Success confirmation to all teams
- Summary of changes deployed
- Monitoring schedule for next 24h

### Frontend Team

**Send this message after deployment:**

```
✅ Backend Updates Deployed - Registration Bonus Gradual Payout

API Changes:
1. GET /bonuses/registration/status
   - Now includes "bonus" object with credit tracking
   - New fields: bonusPaidOut, remainingBonus, payoutPercentage

2. NEW: GET /bonuses/registration/payout-history
   - Returns complete payout history
   - Sorted by most recent first

Documentation:
- Full API specs in BACKEND_TEAM_REQUIREMENTS.md
- TypeScript types already updated on your end
- Ready for frontend integration

Testing:
- All endpoints tested in staging
- Sample user created with $50 stake ($5 bonus)
- Weekly payout processing verified working

Next Steps:
1. Update registration bonus banner UI
2. Add bonus payout history component
3. Test end-to-end flow
4. Deploy frontend updates

Questions? Contact backend team lead.
```

---

## ❓ FAQ

### Q1: What happens to existing active bonuses?

**A:** The migration script will initialize all fields with appropriate values. Existing bonuses will start with `bonusPaidOut = 0` and `remainingBonus = bonusAmount`.

### Q2: Can a user have multiple registration bonuses?

**A:** No. Each user gets only ONE registration bonus, activated by their first stake within 7 days of registration.

### Q3: What if admin forgets to declare weekly ROI?

**A:** No payouts occur that week. Bonuses remain in "bonus_active" status and will resume when next ROI is declared.

### Q4: Can bonus payout exceed remaining balance?

**A:** No. Code explicitly uses `Math.min(calculatedPayout, remainingBonus)` to prevent overpayment.

### Q5: What happens if weekly ROI is very high (e.g., 10%)?

**A:** Bonus pays out faster but never exceeds remaining balance. If remaining is $5 and calculated payout is $10, only $5 is paid and bonus completes.

### Q6: Are bonus payouts refundable?

**A:** No. Once credited to earning wallet, they follow standard wallet policies.

### Q7: What if user creates second stake before weekly payout?

**A:** Doesn't affect bonus. Only the first stake triggers bonus activation. Second stake is independent.

### Q8: How to manually complete a bonus (admin)?

**A:** Update in database:
```javascript
await RegistrationBonus.updateOne(
  { _id: bonusId },
  { 
    status: 'completed', 
    remainingBonus: 0,
    completedAt: new Date()
  }
);
```

---

## ✅ Acceptance Criteria

Before marking this as COMPLETE, verify:

- [ ] RegistrationBonus model updated with new fields
- [ ] BonusPayoutHistory model created
- [ ] First stake detection implemented
- [ ] Bonus activation logic working
- [ ] Weekly payout processing includes bonuses
- [ ] Wallet crediting function handles both types
- [ ] Migration script tested and works
- [ ] All unit tests passing
- [ ] Integration tests passing
- [ ] API endpoints returning correct structure
- [ ] New payout history endpoint working
- [ ] Deployed to staging successfully
- [ ] Manual testing completed
- [ ] Frontend team notified
- [ ] Documentation complete

---

## 📝 Summary

### What Changed

| Area | Change | Impact |
|------|--------|--------|
| Database | Added bonus credit tracking fields | Required migration |
| Database | New BonusPayoutHistory model | New collection |
| Logic | First stake bonus activation | Updated staking flow |
| Logic | Weekly bonus payout processing | Updated admin workflow |
| API | Updated status endpoint response | Frontend integration needed |
| API | New payout history endpoint | Frontend can display history |

### Key Benefits

1. **Transparency:** Users see exact remaining bonus amount
2. **Fairness:** Bonus tied to actual weekly performance
3. **Simplicity:** No confusing second stake in list
4. **Accuracy:** Complete audit trail via payout history
5. **Scalability:** Handles unlimited active bonuses efficiently

### Timeline Estimate

- **Backend Implementation:** 3-5 days
- **Testing:** 2-3 days
- **Deployment:** 1 day
- **Monitoring:** 1-2 days
- **Total:** ~1.5 weeks

---

**This document contains everything the backend team needs to implement the correct registration bonus payment system. Please review and let me know if you need any clarifications!**
