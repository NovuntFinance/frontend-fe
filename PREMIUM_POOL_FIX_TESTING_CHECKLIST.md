# Premium Pool Fix – Frontend Testing Checklist

Use this checklist **after backend deployment** to confirm qualification badges and progress indicators work correctly. No frontend code changes were required.

---

## 📍 Components & APIs to Test

| Location                           | What it uses                                        | What to verify                                                     |
| ---------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------ |
| **Dashboard** – `RankProgressCard` | `src/components/rank-progress/RankProgressCard.tsx` | Pool badges, Premium Pool progress bar                             |
| **Pools page**                     | `src/app/(dashboard)/dashboard/pools/page.tsx`      | Qualification cards, Premium progress %, messages                  |
| **APIs**                           | `src/services/rankProgressApi.ts`                   | `/user-rank/rank-progress`, `/user-rank/rank-progress-lightweight` |

---

## ✅ Testing Checklist

### 1. Qualification badges (green / blue / gray)

**RankProgressCard** (`RankProgressCard.tsx` – `PoolBadge`):

- [ ] **Premium Pool qualified** → Green styling, CheckCircle2, “Qualified” badge, `pool_qualification.premium_pool.is_qualified === true`
- [ ] **Premium Pool not qualified** → Gray styling, Circle icon, “Not Qualified” badge, backend `message` shown
- [ ] **Performance Pool** → Blue when qualified, gray when not; behavior unchanged by fix
- [ ] **Stakeholder** → Both pools show “Not Eligible” (lock icon), regardless of API

**Pools page** (qualification cards):

- [ ] **Premium qualified** → Emerald border, CheckCircle, correct copy
- [ ] **Premium not qualified** → Slate border, XCircle, `poolQualification?.premium_pool?.message` or fallback copy

### 2. Premium Pool progress

**RankProgressCard**:

- [ ] Progress bar uses `premium_progress_percent` from detailed endpoint (or fallback from `lower_rank_downlines`)
- [ ] 0%, 50%, 100% display correctly; **progress may be lower** than before fix (expected)
- [ ] “Loading Premium Pool progress…” only when appropriate (e.g. detailed data not yet loaded)

**Pools page**:

- [ ] `premiumProgressPercent` from `rankData?.premium_progress_percent` matches progress bar
- [ ] Helper text (e.g. “Need 2 Stakeholder downlines with $50+ stake each”) is correct for rank

### 3. Status changes (green → blue)

- [ ] User who **loses** Premium qualification: Premium badge goes from qualified (green) → not qualified (gray). If they still have Performance, that stays blue.
- [ ] User who **gains** Premium qualification: Premium badge goes from not qualified → qualified (green).
- [ ] No frontend errors when `is_qualified` or `premium_progress_percent` changes between requests.

### 4. Help text & messages

- [ ] **Associate Stakeholder**: “Requires 2 Stakeholder downlines with $50+ stake each” (or equivalent) in both RankProgressCard and Pools page.
- [ ] **Other ranks**: Backend `pool_qualification.premium_pool.message` is shown (e.g. “Not qualified - requires qualified downlines” or rank-specific detail).
- [ ] Stakeholder-specific copy: “Stakeholders are not eligible…” where used.

### 5. API behavior

- [ ] **Lightweight** (`/user-rank/rank-progress-lightweight`): No request/response shape changes; `premium_progress_percent` can be lower.
- [ ] **Detailed** (`/user-rank/rank-progress`): No shape changes; `pool_qualification.premium_pool.is_qualified` may now be `false` for users who previously qualified.
- [ ] Dashboard and Pools page both load without API errors and reflect new backend logic.

### 6. Edge cases

- [ ] **0% progress** – Bar and label show 0%; no “Loading…” stuck.
- [ ] **Borderline stakes** – e.g. $49 vs $50: UI matches backend (qualified vs not).
- [ ] **Detailed data slow/missing** – RankProgressCard fallbacks (e.g. from `lower_rank_downlines`) still produce sensible progress.

---

## 🧪 Suggested test accounts

If available, use:

1. User who **qualifies** for Premium Pool (downlines meet min stake).
2. User who **no longer qualifies** (downlines &lt; min stake) – e.g. previously green, now gray.
3. **Stakeholder** – both pools “Not Eligible.”
4. **Associate Stakeholder** with 0, 1, and 2 qualifying downlines – progress 0%, 50%, 100%.

---

## 📚 References

- `FRONTEND_QUICK_SUMMARY.md` – Short overview and updated requirements table.
- `FRONTEND_PREMIUM_POOL_FIX_NOTIFICATION.md` – Full notification, API notes, and support FAQ.

---

**Status**: Backend complete ✅ | Frontend: **test only** – no code changes required.
