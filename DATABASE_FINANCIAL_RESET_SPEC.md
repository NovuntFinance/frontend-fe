# Novunt Database: Financial Reset for Testing Phase

**Purpose:** Clean all financial data so every account has 0 capital, while **keeping team/referral structure intact**.  
**Audience:** Backend / database team.  
**Date:** January 2026.

---

## ⚠️ Important: Who Does What

- **Finding which accounts have money** and **resetting financials** must be done in the **backend/database** (scripts, admin API, or direct DB operations). The frontend repo cannot access the database.
- This document is a **spec derived from the frontend**: it lists what the UI treats as “financial” vs “non-financial” so the backend knows exactly what to zero and what to preserve.

---

## 1. What Counts as “Financial” (Must Be Zeroed)

From the frontend’s perspective, the following should end at **0** (or empty) for every user after the reset.

### 1.1 Wallets (per user)

| Concept                      | Frontend expectation                                                      | Reset target |
| ---------------------------- | ------------------------------------------------------------------------- | ------------ |
| **Funded wallet**            | `fundedWallet` / `funded.balance`, `availableBalance`, `lockedBalance`    | 0            |
| **Earning wallet**           | `earningWallet` / `earnings.balance`, `availableBalance`, `lockedBalance` | 0            |
| **Total balance**            | `totalBalance` / `total`                                                  | 0            |
| **Available for withdrawal** | `availableForWithdrawal`                                                  | 0            |
| **Pending withdrawals**      | `pendingWithdrawals`                                                      | 0            |
| **Locked in stakes**         | `lockedInStakes`                                                          | 0            |

### 1.2 Wallet statistics (per user)

All of these should be **0** after reset:

- `totalDeposited`
- `totalWithdrawn`
- `totalTransferReceived`
- `totalTransferSent`
- `totalStaked`
- `totalStakeReturns`
- `totalEarned` (ROS, pools, bonuses, referrals, stake returns combined)

_(Frontend types: `UserWallet.statistics`, `WalletStatistics`, `WalletBalance`.)_

### 1.3 Stakes

- **All stake records** that represent money (active, completed, cancelled, etc.) should be **removed or zeroed** so that:
  - No user has any **active stake** with `amount > 0`.
  - No **stake returns / totalEarned** per stake.
- Frontend shows: `Stake.amount`, `totalEarned`, `currentValue`, `targetValue`, weekly payouts, etc. All of that should reflect “no stakes” / zero.

### 1.4 Deposits

- All **deposit/transaction** records that represent user **capital in** (e.g. funded wallet credits) should be cleared or zeroed so that:
  - `totalDeposited` = 0 and no “money in” history that still affects balance.

### 1.5 Withdrawals

- **Withdrawal requests/records**: either delete or mark as cancelled so that:
  - No **pending** balances are tied to withdrawals.
  - `totalWithdrawn` and `pendingWithdrawals` can be 0.

### 1.6 Transfers (internal between wallets)

- Internal **transfer** history can be cleared or zeroed so that:
  - `totalTransferReceived` = 0 and `totalTransferSent` = 0.

### 1.7 Referral / bonus _balances_ (money)

- **Referral bonus balance** (money the user can withdraw or use): **0**.
  - Frontend: `referralBonusBalance`, referral `totalEarned` as a _balance_.
- **Registration bonus** that is paid as balance or stake: zeroed (see stakes above).

### 1.8 Other financial-like data

- **NXP / achievements**: if NXP or badges are used only for gamification (not redeemable for money), you can leave them; if any “balance” is financially relevant, zero it.
- **ROS / pool distributions** already paid to users: reflected in wallet/stake/earnings; zeroing wallets and stakes and stats covers this.
- **Admin-declared** ROS/pool declarations (e.g. daily declaration) can stay or be cleared per product decision; they don’t need to stay for “team structure.”

---

## 2. What Must Be Preserved (Team Structure & Identity)

Do **not** remove or zero:

- **Users / accounts**: keep all user records (id, email, username, profile, etc.).
- **Referral relationship**: who referred whom (`referrerId` / parent in tree).
- **Team / referral tree structure**: so “team” and “level” (Direct, Level 2, …) still make sense.
- **Roles / permissions** (e.g. admin vs user).
- **Auth-related data** (hashes, 2FA setup, etc.) so logins still work.

So: **identity + referral graph = keep; everything that represents “money in the system” = zero.**

---

## 3. How to Find “Which Accounts Have Money”

This has to be done in your backend/DB. Below is a logical checklist; table/column names depend on your schema.

1. **Wallets**
   - List users where `fundedWallet` ≠ 0 or `earningWallet` ≠ 0 (or equivalent balance columns).
2. **Stakes**
   - List users with any stake where `amount` > 0 (or `status = 'active'` and amount > 0).
3. **Statistics**
   - List users where any of `totalDeposited`, `totalWithdrawn`, `totalStaked`, `totalEarned`, `totalStakeReturns`, etc. ≠ 0.
4. **Pending withdrawals**
   - List users with pending withdrawal requests (amount > 0).
5. **Referral bonus balance**
   - List users where referral/earnings balance (or equivalent) ≠ 0.

Combine these (e.g. union of user ids) to get “accounts that have money.” Then run the reset so that after the reset, **all** accounts have 0 in the fields in Section 1.

---

## 4. Suggested Order of Operations for Reset

1. **Identify** all users (or at least those with non-zero financial data) using the “find accounts with money” logic above.
2. **Disable or block** new deposits/withdrawals/stakes during the reset if possible.
3. **Zero financial data** (order can vary by schema; one possible order):
   - Cancel or clear **pending withdrawals**.
   - **Stakes**: delete or zero active/completed stakes (and related payouts).
   - **Wallet balances**: set funded and earning balances (and any locked/available breakdown) to 0.
   - **Wallet statistics**: set `totalDeposited`, `totalWithdrawn`, `totalTransferReceived`, `totalTransferSent`, `totalStaked`, `totalStakeReturns`, `totalEarned` to 0.
   - **Referral bonus balance** (and any similar “earnings” balance): set to 0.
   - **Transactions**: either delete financial transaction rows or mark them so they no longer affect balances (and stats stay 0).
4. **Leave unchanged**: users, referral/referrer links, team structure, auth, roles.
5. **Verify**: re-run “find accounts with money” and confirm no one has non-zero financials; spot-check team/referral tree in the app.

---

## 5. Frontend Types / Endpoints (Reference)

- **Wallet:** `UserWallet`, `WalletBalance`, `WalletStatistics` — balances and stats above.
- **Stakes:** `Stake`, `StakeWithGoal`, staking dashboard — amount, totalEarned, status, etc.
- **Withdrawals:** `Withdrawal`, withdrawal status and amount.
- **Referral:** `ReferralInfo.referralBonusBalance`, `ReferralStats.totalEarned` (as balance).
- **Admin user view:** `UserDetailAdmin` / user detail page shows e.g. `totalInvested`, `totalEarned`, `activeStakes` — all should be 0 after reset.

If your backend uses different field names, map them to these concepts so the UI still shows zeros and no stakes/earnings/deposits/withdrawals after the reset.

---

## 6. One-Sentence Summary

**Zero all wallet balances, wallet statistics, stakes, deposit/withdrawal/transfer financial impact, and referral bonus balances for every account; keep all users and the referral/team structure so the app still shows correct teams and levels with no money in the system.**

If you want, the next step is to add a short “Post-reset checklist” (e.g. login, open wallet, open team page, check admin user detail) so QA can confirm everything is 0 and team structure is intact.
