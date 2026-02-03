# Step-by-Step: Fix "ROS must be between 0 and 2.2"

Follow these steps in order. **Yes, you need to update the backend** — the frontend cannot fix this.

---

## Step 1: Confirm you need this fix

- You are on the admin **Daily Declaration Returns** page.
- You enter an ROS percentage **above 2.2** (e.g. 25 or 50).
- You get an error like: **"ROS percentage must be between 0 and 2.2"**.

If that’s you → continue to Step 2.

---

## Step 2: Decide where your backend runs

- **A)** Backend is on **Render** (e.g. `https://novunt-backend-uw3z.onrender.com`) → you will update that backend and **redeploy** it.
- **B)** Backend runs **locally** (e.g. `http://localhost:5000`) → you will update the backend code and **restart** it.

Pick A or B and follow the matching steps below.

---

## Step 3: Update the backend

### 3a. Open the backend repo

Open the **backend** project (not the frontend). That’s where the API that validates `rosPercentage` lives.

### 3b. Give the backend this prompt

Copy the **"Prompt to give to the backend"** section below (or from `PROMPT_FOR_BACKEND_ROS_0_100.md`) and:

- Paste it to the person who maintains the backend, **or**
- Paste it into Cursor/Chat when you have the **backend** repo open, so the AI can make the changes there.

### 3c. After the backend is updated

- **If you chose A (Render):** Deploy the updated backend to Render (push to the branch Render uses, or trigger a new deploy in the Render dashboard).
- **If you chose B (local):** Restart your local backend server (e.g. `npm run dev` or whatever you use).

---

## Step 4: Point the frontend at the updated backend (only if needed)

- **If you use Render:** Do nothing. Your frontend already uses `NEXT_PUBLIC_API_URL` pointing to Render; once Render has the new backend, it will work.
- **If you use a local backend:** In the **frontend** repo, in `.env.local`, set **only**:
  ```env
  NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
  ```
  (Remove or comment out the Render URL if it’s there.) Then restart the frontend (`npm run dev`).

---

## Step 5: Test

1. Open the admin **Daily Declaration Returns** page.
2. Declare or update a date with an ROS percentage between 0 and 100 (e.g. **50**).
3. Submit. You should get **success** (no "0 and 2.2" error).

If you still see "0 and 2.2", the request is still hitting the old backend (wrong URL or deploy not finished). Check the browser console for `NEXT_PUBLIC_API_URL` and the Network tab to see which URL was called.

---

## Summary

| Step | What to do                                                                                                              |
| ---- | ----------------------------------------------------------------------------------------------------------------------- |
| 1    | Confirm you see the "0 and 2.2" error.                                                                                  |
| 2    | Decide: backend on Render (A) or local (B).                                                                             |
| 3    | Update backend using the prompt below; then deploy (A) or restart (B).                                                  |
| 4    | If local backend: set `NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1` in frontend `.env.local` and restart frontend. |
| 5    | Test declare/update with e.g. ROS 50%.                                                                                  |

---

# Prompt to give to the backend

**Copy everything below this line and paste it to your backend dev or to Cursor in the backend repo.**

---

**Task: Allow ROS percentage 0–100% for admin daily declaration returns**

Our frontend sends `rosPercentage` as a number between 0 and 100. The backend currently rejects values above 2.2 and returns: _"ROS percentage must be between 0 and 2.2"_. We need the backend to accept **0–100** and return **"ROS percentage must be between 0 and 100"** when out of range.

**What to change:**

1. **Endpoints to update**
   - **POST** `/api/v1/admin/daily-declaration-returns/declare` — request body includes `rosPercentage` (number).
   - **PATCH** `/api/v1/admin/daily-declaration-returns/:date` — request body can include `rosPercentage` (number).
   - Any other admin endpoint that validates `rosPercentage` for daily declaration returns (e.g. bulk declare) — same rule.

2. **Validation rule**
   - **Field:** `rosPercentage`
   - **Type:** number
   - **Valid range:** **0 ≤ rosPercentage ≤ 100** (inclusive).
   - **Invalid:** `rosPercentage < 0` OR `rosPercentage > 100`.

3. **Error response when invalid**
   - HTTP status: **400 Bad Request**
   - Response body message (exactly or equivalent): **"ROS percentage must be between 0 and 100"**
   - Do **not** use any message that mentions **"2.2"** or **"0 and 2.2"**.

4. **Where to look in the backend**
   - Search for: `2.2`, `"2.2"`, `"0 and 2.2"`, or validation schemas (e.g. Joi, Yup, class-validator, Zod) that set a **max of 2.2** for ROS or daily declaration.
   - Replace the max with **100** and the error message with **"ROS percentage must be between 0 and 100"**.

**Example:** A request with `"rosPercentage": 25` or `"rosPercentage": 100` should be **accepted** (2xx). A request with `"rosPercentage": 150` or `-1` should return **400** with message **"ROS percentage must be between 0 and 100"**.

Please implement this and then deploy (or restart) the backend so the frontend can use 0–100% ROS for testing.

---

**End of prompt.**
