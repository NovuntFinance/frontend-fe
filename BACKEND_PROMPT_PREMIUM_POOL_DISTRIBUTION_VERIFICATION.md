# Backend Prompt: Verify Premium Pool Is Distributed (Not Omitted)

**Purpose**: Give this document to the backend team so they can confirm why the **premium pool** is not showing as shared in the database when admins declare or distribute daily declaration returns. The frontend sends both pool amounts and a single “distribute pools” flag; we need the backend to distribute and persist **both** Premium and Performance pools.

---

## 1. Problem Statement

- **Observed**: When checking the database after an admin declares (with auto-distribute) or runs “Distribute” for a date, the **premium pool** does not appear to be shared—i.e. premium pool distribution is either not run, not persisted, or not returned in the API.
- **Expected**: When the admin triggers pool distribution (either via `autoDistributePools: true` on declare or `distributePools: true` on the distribute endpoint), **both** the **Performance pool** and the **Premium pool** should be:
  1. Distributed to eligible users (wallet/ledger credits).
  2. Persisted in the database (e.g. transactions, declaration state).
  3. Returned in the API response under `poolDistribution` / `poolsDistributionDetails` for both `performancePool` and `premiumPool`.

---

## 2. What the Frontend Sends (No Omission on Our Side)

The frontend has been verified to **send and display both pools**. There is no separate “distribute premium only” or “distribute performance only”; we send one flag and expect both pools to be distributed.

### 2.1 Declare

**Endpoint**: `POST /api/v1/admin/daily-declaration-returns/declare`

**Request body** (relevant fields):

```json
{
  "date": "2026-02-01",
  "premiumPoolAmount": 2000,
  "performancePoolAmount": 2000,
  "rosPercentage": 0.55,
  "description": "",
  "autoDistributePools": true,
  "autoDistributeROS": false,
  "twoFACode": "123456"
}
```

- We always send **both** `premiumPoolAmount` and `performancePoolAmount`.
- When `autoDistributePools` is `true`, we expect the backend to distribute **both** Premium and Performance pools for that date (not only Performance).

### 2.2 Distribute

**Endpoint**: `POST /api/v1/admin/daily-declaration-returns/:date/distribute`

**Request body**:

```json
{
  "distributePools": true,
  "distributeROS": false,
  "twoFACode": "123456"
}
```

- When `distributePools` is `true`, we expect the backend to distribute **both** Premium and Performance pools for that date.
- We do **not** send separate flags like `distributePremiumPool` / `distributePerformancePool`; the single flag `distributePools: true` means “distribute both pools.”

### 2.3 List and by-date

- We call `GET /api/v1/admin/daily-declaration-returns/declared` and `GET /api/v1/admin/daily-declaration-returns/:date`.
- We display both `poolsDistributionDetails.performancePool` and `poolsDistributionDetails.premiumPool` when present. We do not filter out premium pool.

So if the database shows premium pool as “not shared,” the issue is on the backend side (distribution logic, persistence, or response shape).

---

## 3. Expected API Contract

### 3.1 After declare (with or without auto-distribute)

The declaration document and any response that includes pool distribution should have **both** pools, for example:

```json
{
  "success": true,
  "data": {
    "declaration": {
      "date": "2026-02-01",
      "premiumPoolAmount": 2000,
      "performancePoolAmount": 2000,
      "rosPercentage": 0.55,
      "poolsDistributed": true,
      "rosDistributed": false
    },
    "poolDistribution": {
      "distributed": true,
      "distributedAt": "2026-02-01T00:00:00.000Z",
      "performancePool": {
        "distributed": 37,
        "totalDistributed": 2000
      },
      "premiumPool": {
        "distributed": 25,
        "totalDistributed": 2000
      },
      "totalDistributed": 4000
    }
  }
}
```

- `performancePool` and `premiumPool` must **both** be present when pools have been distributed.
- `premiumPool.distributed` = number of users who received premium pool.
- `premiumPool.totalDistributed` = total amount (e.g. USDT) distributed for premium pool.

### 3.2 GET declaration by date

**Endpoint**: `GET /api/v1/admin/daily-declaration-returns/:date`

Response should include `poolsDistributionDetails` (or equivalent) with **both** pools when distribution has run:

```json
{
  "success": true,
  "data": {
    "date": "2026-02-01",
    "premiumPoolAmount": 2000,
    "performancePoolAmount": 2000,
    "poolsDistributed": true,
    "poolsDistributedAt": "2026-02-01T00:00:00.000Z",
    "poolsDistributionDetails": {
      "performancePool": {
        "distributed": 37,
        "totalDistributed": 2000
      },
      "premiumPool": {
        "distributed": 25,
        "totalDistributed": 2000
      },
      "totalDistributed": 4000
    },
    "rosDistributed": false,
    "rosDistributedAt": null
  }
}
```

If `premiumPool` is missing or always zero while performance pool has values, the frontend and DB will both show “premium pool not shared.”

---

## 4. Backend Verification Checklist

Please go through the following and confirm or fix as needed.

### 4.1 Declare flow (`POST .../declare`)

- [ ] When `autoDistributePools` is `true`, does the code path that runs “pool distribution” invoke distribution for **both** Premium and Performance pools (using `premiumPoolAmount` and `performancePoolAmount` from the declaration)?
- [ ] Or does it only run for Performance pool? (If only Performance, that explains why premium is not shared.)

### 4.2 Distribute flow (`POST .../:date/distribute`)

- [ ] When `distributePools` is `true`, does the handler call the pool distribution logic for **both** Premium and Performance pools for that date?
- [ ] Or does it only call distribution for Performance pool?

### 4.3 Pool distribution service

- [ ] Which service is used for daily-declaration-returns pool distribution (e.g. `PoolDistributionOptimizedService` or similar)?
- [ ] Does that service:
  - Take both `premiumPoolAmount` and `performancePoolAmount` (or equivalent) for the declaration date?
  - Distribute **Performance** pool to performance qualifiers and **Premium** pool to premium qualifiers?
- [ ] Or does it only distribute one of the two pools?

### 4.4 Database persistence

- [ ] When pool distribution runs, are **both** pool payouts persisted (e.g. wallet transactions, ledger entries, or equivalent)?
- [ ] Is there a separate code path or condition that writes performance pool but not premium pool? If yes, that would explain the DB showing premium as “not shared.”

### 4.5 Declaration document and API response

- [ ] After distribution, is the declaration document (or the object used to build the API response) updated with **both**:
  - `performancePool`: `{ distributed, totalDistributed }`
  - `premiumPool`: `{ distributed, totalDistributed }`
- [ ] Are both included in the response for:
  - Declare (when `autoDistributePools` was true)?
  - Distribute (`POST .../:date/distribute`)?
  - GET by date (`GET .../:date`)?
  - GET list (`GET .../declared`)?

### 4.6 Qualifiers

- [ ] Is the **premium pool qualifier list** (users eligible for premium pool for that date) computed and passed into the distribution logic?
- [ ] So that premium pool amount is distributed only to premium-qualified users (and performance pool to performance-qualified users)?

---

## 5. Where to Look in Backend Code (Suggested)

- **Controller**: e.g. `dailyDeclarationReturns.controller.ts` (or equivalent)—declare and distribute handlers.
- **Routes**: e.g. `POST /declare`, `POST /:date/distribute`.
- **Service**: The one that performs “pool distribution” for daily-declaration-returns (e.g. `PoolDistributionOptimizedService` or a wrapper). Check:
  - Input: does it receive both premium and performance amounts (and qualifiers)?
  - Logic: does it loop or call distribution for **both** pools?
  - Output: does it return and/or persist both `performancePool` and `premiumPool`?
- **Persistence**: Where wallet/ledger transactions or declaration status are written. Ensure premium pool payouts are written in the same way as performance pool (same collection/table and similar fields).

---

## 6. Expected Fix (If Premium Is Currently Skipped)

1. **Declare with `autoDistributePools: true`**  
   Ensure the pool distribution step runs for **both** Premium and Performance (same service call or two calls with the same declaration and qualifiers for each pool).

2. **POST `/:date/distribute` with `distributePools: true`**  
   Ensure the handler invokes distribution for **both** pools, not only Performance.

3. **Persistence and response**  
   After distributing both pools:
   - Persist both sets of payouts (transactions/ledger).
   - Update the declaration (or equivalent) with both `performancePool` and `premiumPool` (e.g. `distributed`, `totalDistributed`).
   - Return both in all relevant API responses (declare response, distribute response, GET by date, GET list).

4. **Qualifiers**  
   Use the correct qualifier lists: performance qualifiers for performance pool amount, premium qualifiers for premium pool amount.

---

## 7. Summary for Standup / Short Handoff

- **Issue**: Database shows premium pool is not shared when admins declare or distribute.
- **Frontend**: Sends both `premiumPoolAmount` and `performancePoolAmount`; sends single flag `distributePools: true` / `autoDistributePools: true` and expects **both** pools to be distributed and persisted.
- **Backend**: Please verify that when pool distribution runs (declare with auto-distribute or distribute endpoint), **both** Premium and Performance pools are distributed, persisted, and returned in `poolDistribution` / `poolsDistributionDetails`. If only Performance is handled, add Premium to the same flow and responses.

---

**End of prompt.** Please use this document to confirm and fix premium pool distribution on the backend so the database and API show both pools as shared when distribution is triggered.
