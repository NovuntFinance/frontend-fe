# Backend: Include Test ROS Payout in Stake Card (totalEarned & Progress)

This document is a **detailed prompt for the backend team** so that when a user receives a **Test ROS payout** (`test_ros_payout`), the **stake card** on the dashboard updates: **Total Earned**, **Progress to 200% ROS**, and **Remaining** should reflect both production ROS and Test ROS payouts for that stake.

---

## 1. Goal

- **Current behavior:** Test ROS payouts credit the user’s earning wallet and appear in transaction history, but the **stake card** (on `/dashboard/stakes`) does not change: **Total Earned** stays $0, **Progress to 200% ROS** stays 0%, **Remaining** stays at target.
- **Desired behavior:** The stake card should treat **Test ROS payouts** the same as production **ROS payouts** for that stake: include them in **Total Earned**, recalculate **Progress to 200% ROS** and **Remaining**, so the card updates after an admin runs “Trigger Test ROS”.

No frontend changes are required if the backend returns updated `totalEarned`, `progressToTarget`, and `remainingToTarget` per stake (and updated summary totals). The frontend already displays whatever the staking API returns.

---

## 2. Where the frontend gets stake card data

The stake card is driven by the **staking API**:

- **GET /api/v1/staking/dashboard** (or your equivalent) returns:
  - `data.activeStakes[]` – each item is a stake object.
  - `data.summary` – e.g. `totalEarnedFromROS`, `progressToTarget`, etc.

- **GET /api/v1/staking/:stakeId** (stake detail) returns a single stake with the same shape.

Each **stake object** used for the card includes (frontend contract):

| Field               | Type   | Description |
|---------------------|--------|-------------|
| `_id`               | string | Stake ID    |
| `amount`            | number | Initial stake amount |
| `targetReturn`      | number | Target at 200% (e.g. 2 × amount for regular stakes) |
| **`totalEarned`**   | number | **Sum of all ROS earnings for this stake (should include test_ros_payout)** |
| **`progressToTarget`** | string | **e.g. "5.00%" = (totalEarned / targetReturn) × 100, capped at 100% or 200%** |
| **`remainingToTarget`** | number | **targetReturn − totalEarned (or 0 if at/over target)** |
| `status`            | string | e.g. active, completed, cancelled |
| (other existing fields) | …   | Leave as-is |

The frontend displays:

- **Total Earned** → `stake.totalEarned`
- **Progress to 200% ROS** → `stake.progressToTarget`
- **Remaining** → `stake.remainingToTarget`

So: **including Test ROS in the backend’s computation of `totalEarned` (and hence `progressToTarget` and `remainingToTarget`) is enough for the stake card to “be affected” by test_ros_payout.**

---

## 3. What to include: `test_ros_payout` like `ros_payout`

- **Production ROS** is already reflected in the stake (via existing logic that sets `totalEarned` / progress / remaining). That logic is likely based on:
  - Payout records, or
  - Transactions with type **`ros_payout`** (and possibly a `stakeId` or equivalent in metadata/reference).
- **Test ROS** creates transactions with type **`test_ros_payout`**. Each such transaction should be **tied to a specific stake** (e.g. via `metadata.stakeId` or `stakeId` or your existing link from payout to stake).

**Required change:** When computing per-stake earnings and progress:

- Treat **`test_ros_payout`** the same as **`ros_payout`** for that stake:
  - Include **test_ros_payout** amounts in the **sum** that becomes `totalEarned` for the corresponding stake.
  - Then recompute **progressToTarget** and **remainingToTarget** from that same `totalEarned` and the stake’s `targetReturn` (and any cap, e.g. 100% for bonus stakes).

So conceptually:

- **totalEarned(stakeId)** = sum of:
  - all **ros_payout** amounts for that stake, plus  
  - all **test_ros_payout** amounts for that stake  
  (using whatever link you use today for ros_payout → stake, e.g. transaction metadata or payout records).
- **progressToTarget** = (totalEarned / targetReturn) × 100, capped by stake type (e.g. 100% for bonus, 200% for regular).
- **remainingToTarget** = max(0, targetReturn − totalEarned).

Apply this for both:

- **GET /api/v1/staking/dashboard** (each stake in `activeStakes` and in `stakeHistory` if you expose the same fields), and  
- **GET /api/v1/staking/:stakeId**.

Also update **dashboard summary** totals (e.g. `totalEarnedFromROS`, or any “total earned from ROS” aggregate) so they include **test_ros_payout** as well. That way the main dashboard and any summary cards stay consistent with the stake cards.

---

## 4. Linking `test_ros_payout` to a stake

- When Test ROS runs, the backend creates transactions with **type `test_ros_payout`** and (per existing design) should store the **stake reference** (e.g. `metadata.stakeId` or equivalent) so that “this payout belongs to this stake.”
- Reuse the same linking you use for **ros_payout** (e.g. by `stakeId` in transaction metadata or in a payouts table). When building the stake’s `totalEarned`:
  - Sum amounts from **ros_payout** where stake = this stake.
  - Sum amounts from **test_ros_payout** where stake = this stake (same stake id).
- If today you only aggregate from a “payouts” or “ROS runs” table and not from transaction type, add **test_ros_payout** transactions (or the equivalent test ROS payout records) into that aggregation for the same stake.

---

## 5. Edge cases to handle

- **Multiple Test ROS runs for the same stake:** Sum all **test_ros_payout** amounts for that stake (same as you would sum multiple ros_payouts). No special “only latest” logic.
- **Completed / cancelled stakes:** If a stake is completed or cancelled, keep applying the same rule: `totalEarned` = ros_payout + test_ros_payout for that stake; progress and remaining derived from that. Frontend may hide or style completed stakes; backend just returns consistent numbers.
- **Bonus stakes (e.g. 100% cap):** Keep your existing cap (e.g. 100% of bonus amount). Include test_ros_payout in `totalEarned`, then cap **progressToTarget** and **remainingToTarget** so they never exceed the bonus cap.
- **Stake not found for a test_ros_payout:** If a test_ros_payout references a missing or invalid stakeId, skip it in the sum (or log and ignore). Do not break the dashboard.

---

## 6. APIs to update (checklist)

- [ ] **GET /api/v1/staking/dashboard**  
  - For each stake in `activeStakes` (and `stakeHistory` if applicable):  
    - `totalEarned` = sum(ros_payout for stake) + sum(test_ros_payout for stake).  
    - `progressToTarget` and `remainingToTarget` derived from this `totalEarned`.  
  - Summary: e.g. `totalEarnedFromROS` (or equivalent) includes test_ros_payout across all stakes.

- [ ] **GET /api/v1/staking/:stakeId**  
  - Same rule: `totalEarned` includes test_ros_payout for this stake; then `progressToTarget` and `remainingToTarget` from that.

- [ ] **Transaction storage:** Ensure each **test_ros_payout** transaction stores the **stake id** (e.g. `metadata.stakeId`) so the above sums are possible. If Test ROS currently does not write this, add it when creating the test_ros_payout transaction.

---

## 7. How to verify

1. **Before change:** User has one active stake ($20,000). Admin runs Trigger Test ROS at 5%. User receives $1,000 Test ROS Payout in wallet and in transaction list, but stake card shows Total Earned $0, Progress 0%, Remaining $40,000.
2. **After change:** Same scenario. After backend deploy:
   - GET /api/v1/staking/dashboard (or /staking/:stakeId) returns for that stake e.g. `totalEarned: 1000`, `progressToTarget: "2.50%"`, `remainingToTarget: 39000` (or your exact formula).
   - Frontend stake card shows **Total Earned $1,000.00**, **Progress to 200% ROS 2.50%**, **Remaining $39,000.00** (or equivalent).
3. Run Trigger Test ROS again for the same stake; **Total Earned** and progress should increase again (e.g. another $1,000 if 5% again).

---

## 8. Summary for backend

- **Ask:** Include **test_ros_payout** in the stake’s **totalEarned** (and thus in **progressToTarget** and **remainingToTarget**) and in any dashboard **summary** totals that represent “total ROS earnings.”
- **Where:** Any API that returns stake objects with `totalEarned` / `progressToTarget` / `remainingToTarget` (at least **GET /staking/dashboard** and **GET /staking/:stakeId**).
- **How:** When summing “earnings for this stake,” add amounts from transactions (or payout records) of type **test_ros_payout** that reference this stake, in the same way you add **ros_payout** for this stake. Ensure each test_ros_payout is stored with a stake reference (e.g. `metadata.stakeId`).
- **Frontend:** No change needed; the stake card already reads these fields from your response.

Once this is implemented and deployed, the stake card will be affected by test_ros_payout as requested.
