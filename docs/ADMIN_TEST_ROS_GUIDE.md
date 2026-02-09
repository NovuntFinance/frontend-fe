# Admin Dashboard: Trigger Test ROS – Step-by-Step Guide

This guide explains how to use the **Trigger Test ROS** feature in the Novunt admin dashboard. Use it to run a test ROS distribution that pays real USDT to users’ earning wallets without affecting production daily ROS or stake progress.

---

## What is Test ROS?

- **Test ROS** is a separate flow from the normal (production) Daily ROS.
- It pays **real USDT** into users’ **Earning Wallets** and creates **real transactions** with type **“Test ROS Payout”**.
- It is **safe to run multiple times per day** and does **not** affect:
  - Daily declaration / Daily ROS
  - Stake progress toward 200%
  - Existing Declare or Distribute actions

**When to use it:** For example, after seeding data (e.g. 50k deposit + 20k stake), use Test ROS to verify that ROS behaviour and payouts work without waiting for the next calendar-day ROS run.

---

## Step 1: Open the Admin Dashboard and log in

1. Go to your admin URL (e.g. `https://novunt.com/admin` or your environment’s admin URL).
2. Log in with your **admin** account (email/username and password).
3. If your account has **2FA** enabled, complete the 2FA step when prompted.

---

## Step 2: Go to Daily Declaration Returns

1. In the **left sidebar**, click **“Daily Declaration Returns”**.
2. The page loads with:
   - Qualifier Counts
   - Declaration Calendar (next 30 days)
   - Distribution Status
   - A **“Trigger Test ROS”** button (with a send icon) and short note below the calendar
   - Declared Returns list

You must be on this page to use Trigger Test ROS.

---

## Step 3: Open the Trigger Test ROS modal

1. Find the **“Trigger Test ROS”** button (outline style, below the calendar and status section).
2. Click **“Trigger Test ROS”**.
3. A modal opens with the title **“Trigger Test ROS”** and a short description of what the action does.

---

## Step 4: Enter the ROS percentage (required)

1. In the modal, find the field **“ROS percentage (0–100)”** (marked as required).
2. Enter a number between **0** and **100**. This is the percentage of each user’s active stake that will be paid out as test ROS.
   - Example: **5** = 5% of each user’s stake amount.
   - **0** is valid but will distribute 0 USDT.
3. You can use decimals (e.g. **5.5**). The field accepts values like **5** or **10**.

**Suggested value:** **5** is a common choice for a quick test.

---

## Step 5: Optionally enter a run label

1. Find the field **“Run label (optional)”**.
2. If you want to identify this run later (e.g. in logs or exports), enter a short label, e.g.:
   - `feb-9-test-1`
   - `uat-run-1`
   - `pre-go-live-check`
3. If you leave it **empty**, the backend will generate a run ID (e.g. timestamp-based). You can still run Test ROS without filling this.

---

## Step 6: Confirm and submit

1. Read the short note in the modal: _“Pays real USDT to all users’ earning wallets. Safe to run multiple times. Does not affect daily ROS or stake progress.”_
2. Click the **“Trigger Test ROS”** button at the bottom of the modal.

---

## Step 7: Enter your 2FA code (if required)

1. If your admin account has **2FA** enabled, a **2FA prompt** will appear (e.g. modal or system prompt asking for your authenticator code).
2. Open your **authenticator app** (e.g. Google Authenticator, Authy) and get the **current 6-digit code**.
3. Enter the code in the prompt and confirm.
4. If you cancel the 2FA prompt or leave it empty, you’ll see a message that the 2FA code is required and the Test ROS request will not be sent.

---

## Step 8: Wait for the result

1. While the request is in progress, the button in the modal shows **“Running...”** with a loading indicator.
2. Do not close the modal or refresh the page until the request finishes.

**On success:**

- A **success toast** appears (e.g. “Test ROS completed”) with a short summary, for example:
  - **“Distributed X USDT to Y users in Zs”** (X = total USDT, Y = user count, Z = time in seconds).
- The modal **closes** automatically.
- You can run Test ROS again anytime by repeating from **Step 3**.

**On error:**

- A **red toast** appears with the error message from the backend (e.g. invalid percentage, 2FA invalid, permission denied, server error).
- The modal **stays open** so you can correct the inputs (e.g. percentage) or try again after fixing the issue (e.g. 2FA).

---

## Step 9: Verify test payouts (optional)

### In the Admin dashboard

1. Go to **“Transactions”** in the left sidebar.
2. Use the **“Type”** filter dropdown.
3. Select **“Test ROS Payout”** (or the option that maps to `test_ros_payout`).
4. You should see transactions with type **Test ROS Payout** for the run you just triggered.

### For end users

- Users see these payouts in their **transaction history** / wallet activity as **“Test ROS Payout”**.
- No extra steps are required on the user side; the label is shown automatically.

---

## Quick reference

| Step | Action                                                              |
| ---- | ------------------------------------------------------------------- |
| 1    | Log in to admin dashboard                                           |
| 2    | Click **“Daily Declaration Returns”** in the sidebar                |
| 3    | Click **“Trigger Test ROS”**                                        |
| 4    | Enter **ROS percentage** (0–100), e.g. **5**                        |
| 5    | Optionally enter a **run label**                                    |
| 6    | Click **“Trigger Test ROS”** in the modal                           |
| 7    | Enter **2FA code** when prompted (if 2FA is enabled)                |
| 8    | Wait for success toast (or fix error and retry)                     |
| 9    | Optionally check **Transactions** → filter by **“Test ROS Payout”** |

---

## Important notes

- **Same permissions as Declare/Distribute:** You need the same admin permissions and 2FA as for “Declare” or “Distribute” on Daily Declaration Returns.
- **Real money:** Test ROS pays **real USDT** into earning wallets. Use it in environments and with percentages you intend.
- **Idempotent and safe for calendar:** You can run it multiple times; it does not change daily declaration, stake progress, or production ROS.
- **Separate from Declare/Distribute:** “Trigger Test ROS” does not replace or run the normal “Declare” or “Distribute” actions; it is an extra, separate action.

---

## Troubleshooting

| Issue                                         | What to do                                                                                                                                  |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| “2FA code is required”                        | Enter your current 6-digit code from your authenticator app when prompted.                                                                  |
| “Please enter a percentage between 0 and 100” | Use a number from 0 to 100 in the percentage field (decimals like 5.5 are allowed).                                                         |
| Backend error (e.g. 403, 500)                 | Check the toast message; ensure you have permission and the backend is healthy. Retry after a short wait if it’s a temporary error.         |
| Modal doesn’t open                            | Ensure you’re on **Daily Declaration Returns** and click the **“Trigger Test ROS”** button (outline button below the calendar).             |
| Don’t see “Trigger Test ROS”                  | Confirm you’re on the **Daily Declaration Returns** page and that your admin role has access to that page and to financial/declare actions. |

If you need backend or environment-specific details (e.g. exact URL, permissions), refer to your internal admin or API documentation.
