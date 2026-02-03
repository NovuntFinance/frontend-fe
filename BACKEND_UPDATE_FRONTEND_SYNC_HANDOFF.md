# Backend Update for Frontend Sync — Detailed Prompt

**Use this document as the single handoff from backend to frontend.** Share it with the frontend team so they know exactly what happened on the backend and how to stay in sync (API contracts, new fields, and behavior changes).

---

## Part 1: What Happened on the Backend (Summary)

We completed two main pieces of work that affect the frontend:

### A. ROS & Pool Distribution Performance (Earlier Work)

- **Problem:** ROS distribution was taking 30–60 minutes and could time out; pool distribution could be slow.
- **Backend change:** All ROS and pool distributions now use **optimized, bulk-based services only** (no per-stake or per-user transactions in production). Declare and distribute no longer block the HTTP request when ROS is involved.
- **Behavior change for frontend:** When an admin **declares with `autoDistributeROS: true`** or **triggers distribute with `distributeROS: true`**, the API returns **202 Accepted** immediately. ROS runs in the background (~1–2 minutes). The frontend must treat 202 as success, show "ROS processing," and **poll** `GET /api/v1/admin/daily-declaration-returns/:date` until `rosDistributed` is true.

### B. Premium Pool "Not Showing as Shared" (Latest Fix)

- **Problem:** After declare or distribute, the admin dashboard showed that Premium Pool was not shared (or the breakdown for premium was missing), even though the Qualifier Counts dashboard correctly shows e.g. **34 Premium Pool qualifiers**.
- **Backend verification:** We confirmed that **both** Premium and Performance pools **are** distributed and **are** persisted to the database whenever pool distribution runs (declare with `autoDistributePools: true` or POST `/:date/distribute` with `distributePools: true`). There is no code path that only distributes the Performance pool.
- **Root cause:** The **GET** endpoints did not include the distribution breakdown in the response. So when the frontend called:
  - `GET /api/v1/admin/daily-declaration-returns/:date`
  - `GET /api/v1/admin/daily-declaration-returns/declared`
    the API did **not** return `poolsDistributionDetails` (the object that contains `performancePool` and `premiumPool` with `distributed` and `totalDistributed`). The frontend therefore had no data to show "premium pool shared" or the per-pool breakdown.
- **Backend fix:** We added `poolsDistributionDetails` to **both** GET responses (by date and list). The shape includes **both** `performancePool` and `premiumPool` so the UI can display each pool's distributed count and total amount.

**Qualifier counts:** The admin "Qualifier Counts" dashboard (e.g. 37 Performance, 34 Premium) uses the **same** backend logic that distribution uses: Performance = users with rank other than Stakeholder; Premium = `RankManagementService.getRedistributionQualifiedUsers()` (leadership / downline qualification). So the numbers you see there are the same pool definitions used at distribution time.

---

## Part 2: API Changes the Frontend Must Use

### 2.1 POST Declare — No Change to Request; 202 When ROS Is Auto-Distributed

- **Endpoint:** `POST /api/v1/admin/daily-declaration-returns/declare`
- **Request body:** Unchanged. You still send `date`, `premiumPoolAmount`, `performancePoolAmount`, `rosPercentage`, `autoDistributePools`, `autoDistributeROS`, etc.
- **Response:**
  - If **no** `autoDistributeROS` or `rosPercentage === 0`: **201 Created** with full declaration and `poolDistribution` (both pools when `autoDistributePools` was true).
  - If **yes** `autoDistributeROS` and `rosPercentage > 0`: **202 Accepted**. Body includes `declaration`, `poolDistribution` (both pools if pools were distributed), and `rosDistribution: { status: "processing", message: "..." }`. **Do not** wait for ROS in this request; poll GET by date until `rosDistributed` is true.

### 2.2 POST Distribute — No Change to Request; 202 When ROS Is Requested

- **Endpoint:** `POST /api/v1/admin/daily-declaration-returns/:date/distribute`
- **Request body:** Unchanged. You send `distributePools`, `distributeROS` (at least one true).
- **Response:**
  - If **only** `distributePools: true`: **200 OK** with `poolDistribution` (both `performancePool` and `premiumPool`).
  - If **`distributeROS: true`**: **202 Accepted**. `poolDistribution` is present if pools were also distributed; `rosDistribution` is `{ status: "processing", ... }`. Poll GET by date for ROS completion.

### 2.3 GET Declaration by Date — **NEW: `poolsDistributionDetails` in Response**

- **Endpoint:** `GET /api/v1/admin/daily-declaration-returns/:date`
- **Change:** The response `data` now includes **`poolsDistributionDetails`** when the declaration has had pool distribution run.

**Response shape (relevant fields):**

```json
{
  "success": true,
  "data": {
    "date": "2026-02-01",
    "premiumPoolAmount": 2000,
    "performancePoolAmount": 2000,
    "rosPercentage": 0.55,
    "description": "",
    "poolsDistributed": true,
    "poolsDistributedAt": "2026-02-01T12:00:00.000Z",
    "poolsDistributionDetails": {
      "performancePool": {
        "distributed": 37,
        "totalDistributed": 2000
      },
      "premiumPool": {
        "distributed": 34,
        "totalDistributed": 2000
      },
      "totalDistributed": 4000,
      "note": null
    },
    "rosDistributed": false,
    "rosDistributedAt": null,
    "declaredBy": { "_id": "...", "email": "...", "username": "..." },
    "declaredAt": "2026-02-01T10:00:00.000Z"
  }
}
```

- **When pools have not been distributed yet:** `poolsDistributionDetails` may be `null` (or absent). Use `poolsDistributed === false` to know pools are pending.
- **Frontend action:** Use `data.poolsDistributionDetails.premiumPool` and `data.poolsDistributionDetails.performancePool` to show "Premium pool shared: X users, $Y" and "Performance pool shared: X users, $Y" on the declaration detail and list views.

### 2.4 GET List of Declarations — **NEW: `poolsDistributionDetails` on Each Item**

- **Endpoint:** `GET /api/v1/admin/daily-declaration-returns/declared`
- **Change:** Each declaration in the list now includes **`poolsDistributionDetails`** with the same shape as above (both `performancePool` and `premiumPool`).

**Example list item (relevant fields):**

```json
{
  "id": "...",
  "date": "2026-02-01",
  "premiumPoolAmount": 2000,
  "performancePoolAmount": 2000,
  "rosPercentage": 0.55,
  "poolsDistributed": true,
  "poolsDistributedAt": "2026-02-01T12:00:00.000Z",
  "poolsDistributionDetails": {
    "performancePool": { "distributed": 37, "totalDistributed": 2000 },
    "premiumPool": { "distributed": 34, "totalDistributed": 2000 },
    "totalDistributed": 4000,
    "note": null
  },
  "rosDistributed": false,
  "rosDistributedAt": null,
  "declaredBy": { ... },
  "declaredAt": "...",
  "createdAt": "...",
  "updatedAt": "..."
}
```

- **Frontend action:** In the declarations table/list, show both pools as "shared" using `poolsDistributionDetails.premiumPool` and `poolsDistributionDetails.performancePool`. Do not rely only on `poolsDistributed` (boolean) if you need to show per-pool counts or amounts; use the new object for that.

---

## Part 3: Frontend Checklist (Stay in Sync)

- [ ] **Declare with `autoDistributeROS: true`:** Treat **202** as success; show "ROS distribution in progress" and poll GET by date until `rosDistributed` is true. Do not assume ROS is done when the declare call returns.
- [ ] **Distribute with `distributeROS: true`:** Treat **202** as success; show "Processing…" for ROS; poll GET by date for completion.
- [ ] **Declaration detail view (single date):** After the backend deploy, use `data.poolsDistributionDetails` from `GET .../:date` to display:
  - Performance pool: `poolsDistributionDetails.performancePool.distributed` users, `poolsDistributionDetails.performancePool.totalDistributed` amount.
  - Premium pool: `poolsDistributionDetails.premiumPool.distributed` users, `poolsDistributionDetails.premiumPool.totalDistributed` amount.
- [ ] **Declarations list view:** Use `poolsDistributionDetails` on each declaration to show both pools as shared (counts/amounts). If `poolsDistributionDetails` is null, show "Pools not yet distributed" or equivalent.
- [ ] **No breaking changes:** Request bodies for declare and distribute are unchanged. Only response shapes have been extended (202 for async ROS; `poolsDistributionDetails` on GET by date and GET list).

---

## Part 4: What Has Not Changed

- **Request shapes** for declare and distribute (same body parameters, same validation).
- **Authentication / authorization** (no change).
- **Date format** (YYYY-MM-DD).
- **Meaning of `autoDistributePools` and `distributePools`:** One flag still means "distribute **both** Premium and Performance pools." The backend has always distributed both when that flag is true; the fix was only to **return** the breakdown on GET.

---

## Part 5: If Premium Pool Still Shows Zero After Backend Deploy

If the frontend correctly uses `poolsDistributionDetails` but still sees `premiumPool.distributed === 0` and `premiumPool.totalDistributed === 0` for a date where you expect premium to be shared:

1. **Check declaration for that date:** Ensure `premiumPoolAmount > 0` for that date (if it's 0, backend skips premium distribution by design).
2. **Qualifiers at distribution time:** Premium is distributed only to users returned by the same logic as the "Premium Pool" qualifier count (leadership/downline rules). If that list was empty at the moment distribution ran (e.g. rank/downline data changed), result can be 0 users. The backend does not re-use cached booleans; it recomputes qualifiers at distribution time.
3. **Errors:** Ask backend to check logs for that date for errors from `PoolDistributionOptimizedService.distributePremiumPool` (e.g. rank system not found, bulk write failures).

---

## Part 6: One-Paragraph Version (Standup / Short Handoff)

Backend now uses optimized services for all ROS and pool distributions and returns **202** when ROS is started in the background (declare or distribute). Frontend must treat 202 as success and poll GET by date until `rosDistributed` is true. In addition, we fixed the "premium pool not showing as shared" issue: both pools were always distributed and saved, but GET by date and GET list did not return the breakdown. We added **`poolsDistributionDetails`** (with both `performancePool` and `premiumPool`: `distributed`, `totalDistributed`) to both GET endpoints. Frontend should use this object to show Premium and Performance pool distribution results on declaration detail and list views; request bodies are unchanged.

---

## Part 7: Backend References (For Backend Team)

- **Controller:** `src/models/controllers/dailyDeclarationReturns.controller.ts` (declare, distribute, getDeclarationByDate, getDeclaredReturns).
- **ROS handoff doc:** `FRONTEND_HANDOFF_BACKEND_ROS_AND_DISTRIBUTION_UPDATES.md`.
- **Premium pool verification:** `PREMIUM_POOL_DISTRIBUTION_VERIFICATION.md`.
- **ROS directive:** `ROS_DISTRIBUTION_PERFORMANCE_FIX_DIRECTIVE.md`.

---

**End of prompt.** Share this document with the frontend so they can align requests, responses, and UI with the current backend behavior.
