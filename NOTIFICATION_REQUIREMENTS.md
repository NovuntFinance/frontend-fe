# Notification Requirements - Complete List

This document lists all places in the application that require notifications, organized by category for better grouping and management.

---

## 📊 **1. FINANCIAL TRANSACTIONS**

### 💰 **Deposits**

- **Location**: `src/components/wallet/modals/DepositModal.tsx`
- **Triggers**:
  - ✅ Deposit initiated (when user creates deposit request)
  - ✅ Deposit confirmed (when payment is received and confirmed)
  - ✅ Deposit failed (when payment fails or expires)
- **Notification Type**: `deposit`
- **Current Status**: ✅ Working (backend creates notification on deposit confirmation)
- **Metadata Needed**: `{ txId, amount, currency, status }`

### 💸 **Withdrawals**

- **Location**: `src/hooks/useWallet.ts` - `useCreateWithdrawal()`
- **Triggers**:
  - ✅ Withdrawal requested (when user submits withdrawal)
  - ✅ Withdrawal processing (status update)
  - ✅ Withdrawal completed (funds sent)
  - ✅ Withdrawal failed/rejected (with reason)
- **Notification Type**: `withdrawal`
- **Current Status**: ⚠️ Needs backend implementation
- **Metadata Needed**: `{ txId, amount, walletAddress, status, rejectionReason? }`

### 🔄 **Transfers (P2P & Internal)**

- **Location**:
  - `src/lib/mutations.ts` - `useTransferBetweenWallets()`
  - `src/lib/mutations/transactionMutations.ts` - `useInitiateP2PTransfer()`
- **Triggers**:
  - ✅ Transfer sent (user sends money to another user)
  - ✅ Transfer received (user receives money from another user)
  - ✅ Internal wallet transfer (funded ↔ earning wallet)
- **Notification Type**: `deposit` (for received) / `withdrawal` (for sent)
- **Current Status**: ⚠️ Needs backend implementation
- **Metadata Needed**: `{ txId, amount, fromUser, toUser, type: 'p2p' | 'internal' }`

---

## 📈 **2. STAKING & EARNINGS**

### 🎯 **Stake Creation**

- **Location**: `src/lib/mutations/stakingMutations.ts` - `useCreateStake()`
- **Triggers**:
  - ✅ Stake created successfully
  - ✅ Stake creation failed
- **Notification Type**: `earning`
- **Current Status**: ⚠️ Needs backend implementation
- **Metadata Needed**: `{ stakeId, amount, targetReturn, duration }`

### 💵 **ROI Payouts**

- **Location**: Backend (weekly ROI calculations)
- **Triggers**:
  - ✅ Weekly ROI payout received
  - ✅ ROI milestone reached (e.g., 50%, 100%, 200%)
  - ✅ Stake completed (200% ROI achieved)
- **Notification Type**: `earning`
- **Current Status**: ⚠️ Needs backend implementation
- **Metadata Needed**: `{ stakeId, payoutAmount, weekNumber, totalEarned, remainingPayouts }`

### ⏰ **Stake Updates**

- **Location**: Backend (stake status changes)
- **Triggers**:
  - ✅ Stake status changed (active → completed)
  - ✅ Early withdrawal requested (if implemented)
  - ✅ Stake milestone reached
- **Notification Type**: `earning`
- **Current Status**: ⚠️ Needs backend implementation
- **Metadata Needed**: `{ stakeId, status, milestone? }`

---

## 🎁 **3. BONUSES & REWARDS**

### 🎉 **Registration Bonus**

- **Location**:
  - `src/hooks/useRegistrationBonus.ts` - `useProcessStake()`
  - `src/components/registration-bonus/RegistrationBonusBanner.tsx`
- **Triggers**:
  - ✅ Registration bonus available (when user signs up)
  - ✅ Bonus requirement completed (profile, social media, stake)
  - ✅ Bonus activated (when all requirements met)
  - ✅ Bonus expired (if not completed in 7 days)
- **Notification Type**: `bonus`
- **Current Status**: ⚠️ Needs backend implementation
- **Metadata Needed**: `{ bonusId, bonusAmount, progress, requirementsMet, expiresAt }`

### 🎁 **Other Bonuses**

- **Location**: Backend (various bonus systems)
- **Triggers**:
  - ✅ Referral bonus received
  - ✅ Promotional bonus received
  - ✅ Achievement bonus unlocked
  - ✅ Pool distribution received
- **Notification Type**: `bonus`
- **Current Status**: ⚠️ Needs backend implementation
- **Metadata Needed**: `{ bonusId, bonusAmount, bonusType, source }`

---

## 👥 **4. REFERRALS & TEAM**

### 🔗 **Referral Activity**

- **Location**: `src/app/(dashboard)/dashboard/team/page.tsx`
- **Triggers**:
  - ✅ New referral joined (someone signed up via your link)
  - ✅ Referral made first deposit
  - ✅ Referral created first stake
  - ✅ Referral bonus earned
- **Notification Type**: `referral`
- **Current Status**: ⚠️ Needs backend implementation
- **Metadata Needed**: `{ referralId, referralName, action, bonusAmount? }`

### 🏆 **Team Rank Progress**

- **Location**: `src/components/rank-progress/RankProgressCard.tsx`
- **Triggers**:
  - ✅ Rank upgraded (bronze → silver → gold, etc.)
  - ✅ Rank milestone reached
  - ✅ Team performance milestone
- **Notification Type**: `earning` or `system`
- **Current Status**: ⚠️ Needs backend implementation
- **Metadata Needed**: `{ oldRank, newRank, benefits, teamSize }`

---

## 🔒 **5. SECURITY & ACCOUNT**

### 🔐 **Security Events**

- **Location**: Various security-related components
- **Triggers**:
  - ✅ Login from new device/location
  - ✅ Password changed
  - ✅ 2FA enabled/disabled
  - ✅ Email changed
  - ✅ Suspicious activity detected
  - ✅ Account locked/unlocked
- **Notification Type**: `security`
- **Current Status**: ⚠️ Needs backend implementation
- **Metadata Needed**: `{ eventType, ipAddress?, deviceInfo?, timestamp }`

### 👤 **Profile Updates**

- **Location**: `src/lib/mutations/profileMutations.ts`
- **Triggers**:
  - ✅ Profile completed/updated
  - ✅ Avatar changed
  - ✅ Social media verified
- **Notification Type**: `system`
- **Current Status**: ⚠️ Needs backend implementation
- **Metadata Needed**: `{ updateType, fieldChanged }`

---

## ⚠️ **6. ALERTS & WARNINGS**

### 💳 **Payment Alerts**

- **Location**: Backend (payment processing)
- **Triggers**:
  - ⚠️ Deposit payment expired
  - ⚠️ Withdrawal requires attention
  - ⚠️ Payment verification needed
  - ⚠️ Low balance warning
- **Notification Type**: `alert`
- **Current Status**: ⚠️ Needs backend implementation
- **Metadata Needed**: `{ alertType, amount?, actionRequired, deadline? }`

### 📊 **Account Alerts**

- **Location**: Backend (account monitoring)
- **Triggers**:
  - ⚠️ Account verification required
  - ⚠️ KYC documents needed
  - ⚠️ Compliance check required
  - ⚠️ Account limits reached
- **Notification Type**: `alert`
- **Current Status**: ⚠️ Needs backend implementation
- **Metadata Needed**: `{ alertType, actionRequired, deadline? }`

---

## ℹ️ **7. SYSTEM & GENERAL**

### 📢 **System Announcements**

- **Location**: Backend (admin-initiated)
- **Triggers**:
  - ℹ️ Platform maintenance scheduled
  - ℹ️ New feature released
  - ℹ️ Policy updates
  - ℹ️ Important announcements
- **Notification Type**: `system`
- **Current Status**: ⚠️ Needs backend implementation
- **Metadata Needed**: `{ announcementId, priority, ctaUrl? }`

### 🎯 **Achievements & Milestones**

- **Location**: Backend (achievement system)
- **Triggers**:
  - ✅ First deposit milestone
  - ✅ First stake milestone
  - ✅ Total earnings milestone ($100, $500, $1000, etc.)
  - ✅ Referral milestone (10, 50, 100 referrals)
- **Notification Type**: `system` or `earning`
- **Current Status**: ⚠️ Needs backend implementation
- **Metadata Needed**: `{ achievementId, achievementName, reward? }`

---

## 📱 **8. NOTIFICATION DISPLAY LOCATIONS**

### Current Display Points:

1. ✅ **Notification Center** (`src/components/notifications/NotificationCenter.tsx`)
   - Dropdown in header
   - Shows unread count badge
   - Quick access to recent notifications

2. ✅ **Notifications Page** (`src/app/(dashboard)/dashboard/notifications/page.tsx`)
   - Full page view
   - Filterable by type
   - Mark as read/delete functionality

3. ⚠️ **Activity Feed** (`src/components/wallet/ActivityFeed.tsx`)
   - Could show recent notifications
   - Currently shows transactions

4. ⚠️ **Dashboard** (`src/app/(dashboard)/dashboard/page.tsx`)
   - Could show notification summary
   - Recent activity widget

---

## 🎯 **RECOMMENDED GROUPING STRATEGY**

### **Group 1: Financial Activity** 💰

- Deposits
- Withdrawals
- Transfers
- ROI Payouts

### **Group 2: Investment & Earnings** 📈

- Stake creation
- ROI payouts
- Stake milestones
- Earnings milestones

### **Group 3: Rewards & Bonuses** 🎁

- Registration bonus
- Referral bonuses
- Promotional bonuses
- Achievement rewards

### **Group 4: Social & Team** 👥

- Referral activity
- Team rank progress
- Social media verification

### **Group 5: Security & Account** 🔒

- Security events
- Profile updates
- Account changes

### **Group 6: Alerts & Warnings** ⚠️

- Payment alerts
- Account alerts
- Action required

### **Group 7: System & Info** ℹ️

- System announcements
- Platform updates
- General information

---

## ✅ **IMPLEMENTATION PRIORITY**

### **High Priority** (Core functionality):

1. ✅ Deposits (already working)
2. ⚠️ Withdrawals
3. ⚠️ ROI Payouts
4. ⚠️ Stake creation

### **Medium Priority** (User engagement):

5. ⚠️ Registration bonus
6. ⚠️ Referral activity
7. ⚠️ Transfers (P2P & internal)

### **Low Priority** (Nice to have):

8. ⚠️ Security events
9. ⚠️ System announcements
10. ⚠️ Achievements

---

## 📝 **NOTES**

- All notifications should be created on the **backend** when events occur
- Frontend should **refresh notifications** after important actions (deposits, withdrawals, etc.)
- Notifications should include **metadata** for deep linking (e.g., link to transaction, stake, etc.)
- Consider **grouping notifications** by type in the UI for better organization
- Implement **notification preferences** so users can control what they receive

---

## 🔄 **CURRENT STATUS SUMMARY**

- ✅ **Working**: Deposit notifications (backend creates on confirmation)
- ⚠️ **Needs Backend**: All other notification types
- ✅ **Frontend Ready**: Notification system is fully implemented and ready to receive notifications
