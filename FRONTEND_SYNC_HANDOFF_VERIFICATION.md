# Frontend sync handoff – verification

This document maps each requirement from the **Frontend sync prompt – backend alignment** to the current codebase. All items have been implemented or verified.

---

## Part 1: What the backend has done (summary for frontend)

| Backend change                                             | Frontend status                                                                                                                                                                                                                                                 |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Settings endpoints return `success`                        | **Done.** All settings calls check `response.success`; errors use `response.message` (see `adminSettingsService.ts`, `useAdminSettings.ts`).                                                                                                                    |
| New settings in bundle (max ROS, registration bonus, etc.) | **Done.** Settings page renders all `data.categories[].settings` from the bundle; no hardcoded list (see `SettingsManager.tsx`).                                                                                                                                |
| Max ROS % is setting `max_ros_percentage` (Financial)      | **Done.** Cap is read via `GET /admin/settings/max_ros_percentage` and shown in daily declaration modal; backend validates (see `DailyDeclarationReturnsManager.tsx`, `DeclareReturnsModal.tsx`).                                                               |
| Dashboard/qualifiers/declared cached, no contract change   | **Done.** No changes. Dashboard: `adminService.getDashboardMetrics()` → `GET /admin/ui/dashboard?timeframe=...`; qualifiers: `poolService.getQualifiers()` → `GET /admin/pool/qualifiers`; declared: queries → `GET /admin/daily-declaration-returns/declared`. |

---

## Part 2: Admin settings page

### 2.1 Base URLs and auth

| Requirement                                   | Implementation                                                                                                                                           |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------ |
| Base URL                                      | `getApiV1BaseUrl()` in `src/lib/admin-api-base.ts`; used by `createAdminApi()` in `adminService.ts`.                                                     |
| Settings bundle                               | `GET /api/v1/admin/ui/settings/bundle` in `adminSettingsService.getSettingsBundle()`.                                                                    |
| Read/update                                   | `GET                                                                                                                                                     | PUT /api/v1/admin/settings`and`GET | PUT /api/v1/admin/settings/:key`in`adminSettingsService.ts`. |
| Admin auth                                    | All requests use `createAdminApi()` which attaches Bearer token (see `adminService.ts` interceptors).                                                    |
| PUT requires 2FA; 403/401 → redirect or retry | **Done.** `useSettingsBundle()` prompts for 2FA on update; on 403/401 with 2FA-related message redirects to `/admin/setup-2fa` or retries with new code. |

### 2.2 Loading the settings form (single source of truth)

| Requirement                                         | Implementation                                                                                                                                          |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| On load, call GET bundle once                       | **Done.** `useSettingsBundle()` → `getSettingsBundle()` on mount (`useAdminSettings.ts`).                                                               |
| Use `data.categories` for tabs/sections             | **Done.** `SettingsManager` uses `categories` (from bundle); tabs use `category.key`, `category.title`, `category.description` (`SettingsManager.tsx`). |
| One control per setting by `setting.ui.controlType` | **Done.** `BundleSettingInput` switches on `controlType`: `toggle`, `number`, `text`, `select`, `multiselect`, `json` (`SettingsManager.tsx`).          |
| Toggle → boolean, display/send boolean              | **Done.** `Switch` with `Boolean(value)`; `onChange(v)` sends boolean.                                                                                  |
| Number → number input, min/max, unit, send number   | **Done.** `validations.min`/`max`, `ui.recommendedUnit`; `onChange(parseFloat(v))`; value sent as number.                                               |
| Text / select / multiselect / json                  | **Done.** Text: string; select: from `validations.options`; multiselect: array; json: JSON parse/stringify.                                             |
| No hardcoded defaults; use `setting.value`          | **Done.** Initial state is `setting.value`; `useEffect` syncs when `setting.value` changes after refetch.                                               |
| Respect `setting.isEditable`                        | **Done.** Controls and Save button respect `setting.isEditable`.                                                                                        |

### 2.3 Updating a single setting

| Requirement                                                         | Implementation                                                                                                        |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| PUT `/api/v1/admin/settings/:key` with `{ "value": <value> }`       | **Done.** `adminSettingsService.updateSetting(key, value, reason)` (`adminSettingsService.ts`).                       |
| Correct types (number, boolean, string, array, object)              | **Done.** Values come from component state (number inputs use `parseFloat`, toggles boolean).                         |
| Check `response.success === true`; show `response.message` on error | **Done.** Service throws if `!body.success`; hook shows `response.message` / `err.response?.data?.message` via toast. |
| 403/401 with 2FA message → redirect then retry                      | **Done.** In `useSettingsBundle().updateSetting` (`useAdminSettings.ts`).                                             |

### 2.4 Updating multiple settings

| Requirement                                                                     | Implementation                                                                                                 |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| PUT `/api/v1/admin/settings` with `{ "settings": [ { "key", "value" }, ... ] }` | **Done.** `adminSettingsService.updateMultipleSettings(settings)` where `settings` is `Array<{ key, value }>`. |
| Show `data.failed` per key                                                      | **Done.** `useSettingsBundle().updateMultipleSettings` toasts each `data.failed[].error`.                      |
| Update local state for `data.successful`                                        | **Done.** On success we call `fetchBundle()` so UI reflects saved state.                                       |

### 2.5 Settings overview (optional)

| Requirement                              | Implementation                                                                                     |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------- |
| GET `/api/v1/admin/ui/settings/overview` | **Done.** `adminSettingsService.getSettingsOverview()`; available for sidebar/dashboard if needed. |

---

## Part 3: Response handling convention

| Convention                             | Implementation                                                                                                      |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | --- | ------------- |
| Success: `success: true`, `data`       | Checked in `getSettingsBundle`, `getSettingsOverview`, `updateSetting`, and in hook after `updateMultipleSettings`. |
| Error: `success: false`, `message`     | Used in service throws and in hook toasts (`json.message                                                            |     | json.error`). |
| Bulk: `data.failed` for per-key errors | Iterated in `useSettingsBundle().updateMultipleSettings` and shown via toast.                                       |

---

## Part 4: Settings keys (render from bundle)

All listed keys (financial, registration bonus, security, notification, etc.) are rendered from **`data.categories[].settings`** with no hardcoded list. New backend keys appear automatically.

---

## Part 5: Admin overview and daily declaration returns (no contract change)

| Endpoint                                               | Usage                                                                                           |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| GET `/api/v1/admin/ui/dashboard`                       | `adminService.getDashboardMetrics(timeframe)` with `params: { timeframe }` (`adminService.ts`). |
| GET `/api/v1/admin/pool/qualifiers`                    | `poolService.getQualifiers()` (`poolService.ts`).                                               |
| GET `/api/v1/admin/daily-declaration-returns/declared` | Used by queries in `lib/queries.ts` and service in `dailyDeclarationReturnsService.ts`.         |

No URL or response-shape changes; frontend already aligned.

---

## Part 6: Checklist

- [x] **Settings page load:** GET bundle, render `data.categories` and `category.settings`.
- [x] **Control types:** toggle, number (min/max, unit), text, select (`validations.options`), multiselect, json.
- [x] **Initial values:** `setting.value` only; no hardcoded defaults overriding backend.
- [x] **Save single:** PUT `/api/v1/admin/settings/:key` with `{ "value": <typed> }`.
- [x] **Save bulk:** PUT `/api/v1/admin/settings` with `{ "settings": [ { "key", "value" }, ... ] }`; show `data.failed` per key.
- [x] **Types:** number/boolean/string/array/object in request body as appropriate.
- [x] **2FA:** On PUT 403/401 with 2FA message, redirect or prompt and retry.
- [x] **Success/error:** Use `response.success`, `response.message`, and `data.failed` for bulk; show backend messages.
- [x] **Max ROS:** Cap shown in daily declaration UI from `max_ros_percentage` (GET setting); validation remains on backend.

---

## Part 7: Quick reference – settings endpoints

| Action             | Method | URL                                  | Where                                                    |
| ------------------ | ------ | ------------------------------------ | -------------------------------------------------------- |
| Load full form     | GET    | `/api/v1/admin/ui/settings/bundle`   | `adminSettingsService.getSettingsBundle()`               |
| Load overview      | GET    | `/api/v1/admin/ui/settings/overview` | `adminSettingsService.getSettingsOverview()`             |
| Get one setting    | GET    | `/api/v1/admin/settings/:key`        | `adminSettingsService.getSetting(key)`                   |
| Update one setting | PUT    | `/api/v1/admin/settings/:key`        | `adminSettingsService.updateSetting(key, value, reason)` |
| Update many        | PUT    | `/api/v1/admin/settings`             | `adminSettingsService.updateMultipleSettings(settings)`  |

All use the same admin auth; PUTs use 2FA via `createAdminApi(get2FACode)`.

---

## Files touched

- **`src/services/adminSettingsService.ts`** – Bundle/overview types and methods; GET bundle/overview; GET one setting (with `success` check); PUT one/many with `success`/`message`/`data.failed` handling.
- **`src/hooks/useAdminSettings.ts`** – `useSettingsBundle()` (load bundle, update one/many, 2FA redirect/retry, `getSettingValue`); legacy `useAdminSettings` bulk updated to array payload and `data.failed` toasts.
- **`src/components/admin/SettingsManager.tsx`** – Load from bundle; render by `controlType`; use `setting.value`; single-setting save; category tabs.
- **`src/components/admin/dailyDeclarationReturns/DeclareReturnsModal.tsx`** – `maxRosPercentage` prop; dynamic schema and label; input max.
- **`src/components/admin/dailyDeclarationReturns/DailyDeclarationReturnsManager.tsx`** – Fetch `max_ros_percentage` via `getSetting('max_ros_percentage')` and pass to modal.

Admin dashboard, pool qualifiers, and daily-declaration-returns declared list were already using the correct endpoints; no changes were required there.
