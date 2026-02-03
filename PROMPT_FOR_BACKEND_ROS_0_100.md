# Copy-paste prompt for the backend (ROS 0–100%)

**Use this when:** You are in the **backend** repo (or sending instructions to the backend developer). Copy the text below the line and paste it into Cursor chat or send it to your backend dev.

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
