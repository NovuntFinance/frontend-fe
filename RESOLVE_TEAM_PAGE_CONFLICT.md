# Resolving merge conflict in `src/app/(dashboard)/dashboard/team/page.tsx`

## Option A: Resolve on GitHub (web editor)

1. Open your pull request on GitHub.
2. Click **"Resolve conflicts"** (blue button).
3. Open the file `src/app/(dashboard)/dashboard/team/page.tsx`.
4. You’ll see conflict markers:
   - `<<<<<<<` start of your branch’s version
   - `=======` separator
   - `>>>>>>>` end of main’s version
5. Choose one of:
   - **Keep main’s version (recommended)**  
     Delete everything from `<<<<<<<` through `>>>>>>>` and keep only the code that was below `=======` (main’s version).  
     Main has the newer team page (Level/Rank/Referrer columns, `useReferralMetrics`, `useAllTeamMembers`, numbered pagination).
   - **Keep your branch’s version**  
     Delete the conflict block but keep only the code that was above `=======`.
   - **Combine manually**  
     Edit the section so the file has one consistent version (no `<<<<<<<`, `=======`, `>>>>>>>`), then save.
6. Click **"Mark as resolved"** for that file.
7. Click **"Commit merge"** to finish.

## Option B: Resolve from the command line

Run these in your repo root (e.g. in PowerShell), **on the branch that has the conflict** (the PR’s head branch):

```powershell
# 1. Fetch latest
git fetch origin

# 2. Merge main into your branch (this may create the conflict)
git merge origin/main

# 3a. If Git reports a conflict in team/page.tsx and you want MAIN's version:
git checkout --theirs "src/app/(dashboard)/dashboard/team/page.tsx"
git add "src/app/(dashboard)/dashboard/team/page.tsx"

# 3b. If you want YOUR BRANCH's version instead:
# git checkout --ours "src/app/(dashboard)/dashboard/team/page.tsx"
# git add "src/app/(dashboard)/dashboard/team/page.tsx"

# 4. Complete the merge
git commit -m "Merge main and resolve team page conflict"

# 5. Push your branch
git push origin <your-branch-name>
```

Replace `<your-branch-name>` with the branch used in the PR (e.g. `fixes` or `feature/interface-redesign`).

**Recommendation:** Use **main’s version** (`--theirs` when merging main into your branch) so you keep the current team page behavior (all-team-members API, Level/Rank/Referrer columns, numbered pagination).
