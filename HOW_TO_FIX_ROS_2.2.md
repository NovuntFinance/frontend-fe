# How to Fix "ROS percentage must be between 0 and 2.2" (Still Seeing It)

You're seeing this because the **backend** your frontend is calling still only allows ROS 0–2.2%. The frontend is already set to 0–100%; the server must be updated and redeployed.

---

## 1. Check which backend you're using

In the browser console you should see something like:

- `🔧 NEXT_PUBLIC_API_URL: https://api.novunt.com/api/v1`

That URL is the backend that **must** be updated (e.g. on AWS).

---

## 2. Option A — Fix the backend (recommended if you deploy to AWS / production)

1. Open the **backend** repo (not this frontend).
2. Apply the changes described in **`BACKEND_PROMPT_ROS_0_100_VALIDATION.md`** in this repo:
   - Allow `rosPercentage` in the range **0–100** (inclusive).
   - Return the error message **"ROS percentage must be between 0 and 100"** (not "2.2") when out of range.
3. Deploy the updated backend (push to the branch your deploy uses, or trigger a new deploy in your hosting dashboard).
4. After deploy, try declaring again from the admin UI (e.g. ROS 50%). It should succeed.

---

## 3. Option B — Use a local backend (if you have the backend code)

1. In the **backend** repo, apply the 0–100% validation (same as in `BACKEND_PROMPT_ROS_0_100_VALIDATION.md`).
2. Run the backend locally (e.g. `npm run dev` on port 5000).
3. In this **frontend** repo, edit **`.env.local`** so it has **only one** line for the API URL:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
   ```
   Ensure no other API URL overrides this so the app uses localhost.
4. Restart the frontend dev server (`npm run dev`).
5. Try declaring again from the admin UI.

---

## 4. Summary

| What you see                               | Cause                                                   | Fix                                                                                                               |
| ------------------------------------------ | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| "ROS percentage must be between 0 and 2.2" | Backend at `NEXT_PUBLIC_API_URL` still validates 0–2.2% | Update that backend to 0–100% and redeploy, or point frontend to a backend that already has the fix (e.g. local). |

The frontend cannot fix this; only the backend (or switching to another backend) can.
