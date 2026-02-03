# Backend: Verify Premium Pool Is Distributed (Not Omitted)

**Date**: February 2026  
**Issue**: Database shows premium pool is not shared / not distributed when admin declares or distributes.

---

## Frontend Confirmation (No Omission on Our Side)

The frontend **does send and display both pools**:

1. **Declare** – Request body includes both:
   - `premiumPoolAmount` (number)
   - `performancePoolAmount` (number)
   - When `autoDistributePools: true`, backend is expected to distribute **both** Premium and Performance pools.

2. **Distribute** – Request body:
   - `distributePools: true` | `false`
   - `distributeROS: true` | `false`
   - When `distributePools: true`, the frontend expects the backend to distribute **both** Premium and Performance pools (per `BACKEND_DAILY_DECLARATION_RETURNS_API_SPECIFICATION.md`).

3. **List / by-date** – The frontend displays both `poolsDistributionDetails.performancePool` and `poolsDistributionDetails.premiumPool` when the API returns them. We do not filter out premium pool.

So **premium pool is not omitted by the frontend**. If the database shows premium pool as “not shared,” the cause is likely on the backend.

---

## Backend Verification Checklist

Please confirm on the backend:

- [ ] **Declare with `autoDistributePools: true`**  
      When `autoDistributePools` is true, does the pool distribution step run for **both** Premium and Performance pools (not only Performance)?

- [ ] **POST `/:date/distribute` with `distributePools: true`**  
      When `distributePools` is true, does the handler call the distribution logic for **both** Premium and Performance pools?

- [ ] **Pool distribution service**  
      Does `PoolDistributionOptimizedService` (or the service used for daily-declaration-returns) distribute:
  - Performance pool (from `performancePoolAmount`), and
  - Premium pool (from `premiumPoolAmount`)?  
    Or is only one of them invoked?

- [ ] **Database persistence**  
      When pool distribution runs, are **both** pool results persisted (e.g. wallet transactions, ledger, or declaration status)?  
      Check that premium pool payouts are written to the same place as performance pool (e.g. same collection/table and similar fields).

- [ ] **Declaration document / response**  
      After distribution, does the declaration (or the GET by date response) include:
  - `poolsDistributionDetails.performancePool` (e.g. `distributed`, `totalDistributed`)
  - `poolsDistributionDetails.premiumPool` (e.g. `distributed`, `totalDistributed`)  
    If premium is missing in the response, the frontend will show only performance pool in the list.

- [ ] **Qualifiers**  
      Is the premium pool qualifier list (who is eligible for premium pool) computed and used when distributing, so that premium pool amounts are only sent to eligible users?

---

## API Contract (Reminder)

From the frontend/backend spec, when **distributePools** is true, the response should include both pools, for example:

```json
"poolDistribution": {
  "distributed": true,
  "performancePool": { "distributed": 150, "totalDistributed": 5000 },
  "premiumPool": { "distributed": 75, "totalDistributed": 10000 },
  "totalDistributed": 15000
}
```

If the backend only returns or only persists `performancePool`, that would explain why the database shows premium pool as “not shared.”

---

## Suggested Backend Fix (If Premium Is Skipped)

1. In the **declare** flow (when `autoDistributePools` is true), ensure the same distribution step runs for **both** Premium and Performance (e.g. call the pool distribution service with both amounts/qualifiers).
2. In the **POST `/:date/distribute`** handler (when `distributePools` is true), ensure the distribution service is invoked for **both** pools, not only Performance.
3. Persist and return **both** `performancePool` and `premiumPool` in the declaration/distribution response and in the database so the frontend and DB stay in sync.

Once the backend distributes and persists both pools when `distributePools` (or `autoDistributePools`) is true, the database should show premium pool as shared and the admin list will show both pools correctly.
