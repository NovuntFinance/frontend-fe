# Dashboard redesign – PR and getting this interface on main

## Done

- **Branch created and pushed:** `dashboard-redesign-fixes`
- **Latest `main` merged in** (so the PR is clean and up to date).
- **Your dashboard changes are on this branch:** 3-column layout (lg), feature buttons in column 1, Active Stakes in column 2 on large screens, merge conflict fixes, `ActiveStakesCard` duplicate import fixed.

## Create the pull request (get this interface on main)

1. **Open the PR link (use this exact URL):**  
   **https://github.com/NovuntFinance/frontend-fe/pull/new/dashboard-redesign-fixes**

2. **On the PR page:**
   - **Base:** `main` (so your changes merge into main).
   - **Compare:** `dashboard-redesign-fixes`.
   - **Title (suggestion):**  
     `Dashboard: 3-column layout (lg), feature buttons col 1, Active Stakes col 2, conflict fixes`
   - **Description (suggestion):**
     - “Merges latest main; brings dashboard redesign fixes: 3-column 100vh layout on large screens, feature buttons in column 1 under stats carousel, Active Stakes under Daily ROS in column 2 (lg), Live Signals + Platform Activities stacked in column 3. Resolves merge conflicts and duplicate import in ActiveStakesCard. Goal: make this dashboard interface the default on main.”

3. **Create the pull request**, then use **“Merge pull request”** (or “Squash and merge” if your repo prefers) so this interface is on `main` and live.

## After the PR is merged

- `main` will have your updated dashboard (this interface globally).
- You can delete the branch `dashboard-redesign-fixes` on GitHub if you want (optional).
- Locally:  
  `git checkout main` then `git pull origin main` to get the merged code.
