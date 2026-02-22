# Production vs local layout parity

Use this to keep **hosted (production) layout matching local** (heights and spacing).

## 1. Build environment

- **Node**: Use the same version locally and on Vercel. The repo has:
  - `.nvmrc` → `20` (run `nvm use` or set Node 20 locally).
  - `package.json` → `"engines": { "node": ">=20" }`.
- **Vercel**: `vercel.json` sets `NODE_VERSION: 20`, `installCommand: "npm ci"`, `buildCommand: "npm run build"`.
- **Lockfile**: Use **one** package manager and lockfile:
  - **npm** → use `package-lock.json` only; delete or ignore `pnpm-lock.yaml` if you use npm.
  - **pnpm** → in Vercel project settings set Install Command to `pnpm install --frozen-lockfile` and use `pnpm-lock.yaml` only.
- **Clean production rebuild** (removes cache/dependency drift):
  1. Vercel: Project → Settings → General → Build Cache → **Clear** (or redeploy with “Clear cache and redeploy”).
  2. Redeploy so install is `npm ci` (or pnpm equivalent) and build is `next build`.

## 2. Styling parity

- **Global CSS**: `src/app/globals.css` has a single source of base styles:
  - `html, body { margin: 0; padding: 0; }`, `box-sizing: border-box` on `*`, `html` height 100%, `body` min-height 100%.
- **Dashboard viewport**: `.dashboard-viewport-cap` (in `globals.css`) and the dashboard layout use `100dvh` with `100vh` fallback so height is consistent across browsers and production.
- **Tailwind**: Project uses Tailwind v4 (`@tailwindcss/postcss`). Content is auto-discovered; ensure all layout/UI files are under `src/` so no dashboard/layout classes are missing in production.

## 3. Layout debug (development only)

To compare **computed styles** between local and production and find spacing/height mismatches:

1. **Local**: Set `NEXT_PUBLIC_LAYOUT_DEBUG=1` in `.env.local`, run `npm run dev`, open dashboard.
2. **Production**: You cannot set env in Vercel UI for a one-off; either deploy a branch with `NEXT_PUBLIC_LAYOUT_DEBUG=1` (only for debugging) or use DevTools on the live dashboard and manually inspect the same elements.
3. **Debug behavior** (when `NODE_ENV=development` and `NEXT_PUBLIC_LAYOUT_DEBUG=1`):
   - Key containers (viewport cap, `#main-content`, dashboard header) get colored outlines.
   - Console logs computed values: `height`, `minHeight`, `maxHeight`, `padding`, `margin`, `gap`, `lineHeight`, `fontFamily`, `overflow`, `boxSizing`.
4. Compare the **Summary** object from local console with the same values in production DevTools (Computed tab for `.dashboard-viewport-cap`, `#main-content`, and the header). Fix the element(s) that differ with the **smallest possible CSS/layout change** (no new UI).

## 4. Common causes of drift

- **Fonts**: Root layout uses `next/font` (Inter). If production serves a different font or fallback, line-height can change; ensure the same font loads and set explicit `line-height` where needed.
- **Images/icons**: Use explicit `width`/`height` (or `aspect-ratio`) to avoid layout shift.
- **Viewport height**: Prefer `min-h-[100dvh]` / `100dvh` with `100vh` fallback instead of `100vh`/`h-screen` only for the dashboard shell so mobile bars don’t cause height differences.
