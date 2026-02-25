# Make your localhost the live (global) dashboard

## Why live still doesn’t match localhost

- **Vercel production** deploys from the **`main`** branch.
- Your latest work (neumorphic buttons, compact layout) is on **`dashboard-redesign-fixes`**.
- The commit _"fix: 8 action buttons use literal neumorphic styles"_ was pushed to `dashboard-redesign-fixes` **after** PR #21 was merged, so **`main` never got that commit**.
- Pushing to `dashboard-redesign-fixes` only triggers a **preview** deploy for that branch, not the main production URL.

So: **to make localhost “global”, `main` must contain the same code as `dashboard-redesign-fixes`.**

---

## Option A: Merge via GitHub (recommended)

1. Open: **https://github.com/NovuntFinance/frontend-fe/compare/main...dashboard-redesign-fixes**
2. Click **“Create pull request”**.
3. Set:
   - **Base:** `main`
   - **Compare:** `dashboard-redesign-fixes`
4. Title example: **“Dashboard: neumorphic 8 buttons + compact layout (sync with local)”**
5. Create the PR, then **“Merge pull request”** (Merge or Squash, whatever your repo uses).
6. After the merge, Vercel will deploy from `main` and production will match your localhost.

---

## Option B: Merge locally and push main

Run this from your repo root (e.g. in PowerShell):

```powershell
cd "c:\Users\teebl\Documents\Novunt\frontend-fe"
git checkout main
git pull origin main
git merge dashboard-redesign-fixes -m "Merge dashboard-redesign-fixes: neumorphic 8 buttons, compact layout"
git push origin main
```

After `main` is pushed, Vercel will deploy and production will match your localhost.

---

## After merging

- **Production URL** (from `main`) will show the neumorphic 8 buttons and the compact layout.
- Optionally delete the branch `dashboard-redesign-fixes` on GitHub after merging if you no longer need it.
- Locally you can keep using `dashboard-redesign-fixes` or switch to `main`:  
  `git checkout main` then `git pull origin main`.
