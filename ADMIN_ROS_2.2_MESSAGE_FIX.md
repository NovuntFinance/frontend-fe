# Why You Still See "Must Declare 0 to 2.2%" in Admin Declaration

---

## Backend status (January 2026)

**The backend team has confirmed:** validation already allows **0–100%** and returns the error message **"ROS percentage must be between 0 and 100"** for declare and update endpoints. No further backend changes are required for this task.

If you **still** see "2.2%" in the UI, the error toast will now include a short hint that the server you're connected to hasn't been updated. Follow the **troubleshooting** section below.

---

## What's going on

The **frontend** is already set to allow **0–100%** for ROS in the admin declaration flow:

- Input `max` is **100**
- Validation message is: **"ROS percentage must be between 0 and 100"**
- Labels say **"Max: 100%. Testing: up to 100% allowed."**

The frontend shows the **exact error message returned by the API**. So if you ever see "0 and 2.2", that text was coming from the backend (API error response). The backend has since been updated to return "0 and 100".

---

## If you still see "2.2%" — frontend troubleshooting

1. **Hard refresh / clear cache**
   - **Chrome/Edge:** Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac).
   - Or: DevTools → Application → Storage → "Clear site data" (or clear cache for this origin).

2. **Confirm which API the frontend is calling**
   - Check `NEXT_PUBLIC_API_URL` (e.g. in `.env.local` or deployment env). Ensure it points to the **current** backend (the one that was updated to 0–100%), not an old staging or mirror.
   - If you have **two** `NEXT_PUBLIC_API_URL` lines in `.env.local`, only one is used (typically the **last** one). Comment out or remove the one that points to the old backend so the app uses the updated backend.

3. **Confirm the frontend build is current**
   - If the app is deployed, ensure the **latest** frontend build is deployed (no old bundle still served by CDN or server).

4. **Reproduce and check Network tab**
   - Open DevTools → Network.
   - Trigger declare or update with e.g. ROS **25**.
   - Find the `declare` or `PATCH .../daily-declaration-returns/...` request.
   - If status is **400**, click the request and check **Response** (or **Preview**). The body should contain the message the backend returns; the toast shows that same message. If the response body still says "2.2", the request is hitting an old backend or wrong environment.

5. **Incognito / different browser**
   - Try in an incognito window or another browser (no cached JS) to rule out cached frontend.

---

## Summary

- **Frontend:** 0–100%; displays the API error message.
- **Backend:** Confirmed 0–100% and message "ROS percentage must be between 0 and 100".

If you still see "2.2%" after the steps above, share the **exact** error message and, if possible, the API response body (from Network tab) so we can trace which environment or code path is still returning it.
