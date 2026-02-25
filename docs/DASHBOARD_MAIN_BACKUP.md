# Dashboard on main – backup and revert

## Backup created (Feb 2026)

- **Branch:** `backup/dashboard-main-2026-02-22`
- **Contents:** Exact copy of `main` as of the backup (dashboard with 100vh attempts, 3-column layout, document lock, etc.).
- **Remote:** Pushed to `origin/backup/dashboard-main-2026-02-22` so it’s safe if you change or reset `main`.

## How to revert main to this backup (if needed)

If you change `main` (e.g. replace the dashboard) and want to go back to this state:

```bash
git fetch origin
git checkout main
git reset --hard origin/backup/dashboard-main-2026-02-22
git push origin main --force-with-lease
```

**Warning:** `git push --force-with-lease` rewrites `main` on the remote. Only do this if you intend to revert to the backup. Ensure no one else is pushing to `main` at the same time.

## Current state

- **main** and your **local** are in sync (same commit).
- The backup is a snapshot of that state; you can try a different dashboard on `main` and always restore using the steps above.
