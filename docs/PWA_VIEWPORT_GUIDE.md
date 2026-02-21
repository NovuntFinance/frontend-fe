# PWA / Mobile viewport guide — keep everything in range

This app is built to behave like a mobile app: **nothing should ever go outside the screen** (no horizontal overflow, no body scroll). The following is already in place and how to keep it that way.

---

## What’s in place

- **Root** (`layout.tsx`): All content is inside `.app-viewport` (fixed, full viewport, safe-area, single flex column). Only designated scroll areas scroll.
- **Auth & onboarding**: Use the PWA shell (`.shell`, `.shellScroll`, `.shellFooter`) from `pwa-app-shell.module.css`; forms and carousel stay within the viewport.
- **Dashboard**: One scroll region — `<main id="main-content">` has `app-scroll app-no-overflow min-h-0 flex-1`. Header, nav, and banners are `flex-shrink-0`.
- **Admin**: Same idea — main content uses `app-scroll` and `app-no-overflow`.
- **Landing (`/`)**: Wraps onboarding in a flex fill (`flex min-h-0 flex-1 flex-col overflow-hidden`).
- **Future public pages**: Use the **`(public)`** route group and/or **`ViewportPageLayout`** (see below).
- **Tables / wide content**: Use `overflow-x-auto` on a **child** container (e.g. a div wrapping the table), not on the page. That keeps horizontal scroll contained inside the layout.
- **Modals / dialogs**: Use viewport-constrained sizes (e.g. `max-h-[85vh] max-w-[95vw]` or the dialog component’s `max-h-[calc(100vh-2rem)]`).

---

## Layout for future (incoming) pages

Use one of these so new pages stay in range by default.

### Option A: Put the page under `(public)` (easiest)

Any new standalone page (terms, privacy, about, contact, FAQ, etc.) can live under the **`(public)`** route group:

- **Folder**: `src/app/(public)/your-page/page.tsx`
- **URL**: `/your-page` (the `(public)` group does not appear in the URL)
- **What you get**: Viewport-filling layout, one scroll region, and a fixed “Back to home” header. You only write the page content; no wrapper needed.

**Example**: `src/app/(public)/terms/page.tsx` → `/terms`. See `(public)/terms` and `(public)/privacy` for minimal examples.

### Option B: Use `ViewportPageLayout` for a custom layout

If the page is not under `(public)` (e.g. a one-off route) or you need a custom header/footer:

- Import **`ViewportPageLayout`** from `@/components/layout/ViewportPageLayout`.
- Wrap your content; pass optional `header` and `footer` (both fixed), and optional `mainClassName` for the scroll area.

```tsx
import { ViewportPageLayout } from '@/components/layout/ViewportPageLayout';

export default function MyPage() {
  return (
    <ViewportPageLayout
      header={<div className="...">Back / Title</div>}
      footer={<div className="...">Links</div>}
      mainClassName="p-4"
    >
      <div className="mx-auto max-w-3xl">{/* your content */}</div>
    </ViewportPageLayout>
  );
}
```

### Option C: New route group with its own layout

If you need a whole section (e.g. `(marketing)`) with a different chrome: create `src/app/(marketing)/layout.tsx` and use `ViewportPageLayout` there (with or without header/footer), then add pages under `(marketing)/...`.

---

## Rules so nothing goes out of range next time

1. **New route under dashboard or admin**  
   Don’t add your own full-height wrapper. The layout already gives you a scrollable `<main>`. Put your content in the page and use `min-w-0` / `max-w-full` (or class `app-no-overflow`) on flex children that might grow (e.g. text or cards).

2. **New standalone page** (e.g. `/terms`, `/about`)  
   Prefer putting it under **`(public)`** so it automatically gets the viewport layout. Otherwise use **`ViewportPageLayout`** (see “Layout for future pages” above) or the same pattern (one scroll region, no body scroll).

3. **New layout**  
   Follow dashboard/admin: outer container is flex column with `min-h-0 flex-1 overflow-hidden`; one main area has `app-scroll app-no-overflow min-h-0 flex-1`; header/footer/nav are `flex-shrink-0`.

4. **New modals / dialogs**  
   Always constrain size: e.g. `max-h-[90vh] max-w-[95vw]` and `overflow-y-auto` on the content. Use the existing `DialogContent` or the same pattern for custom modals.

5. **Wide or horizontal content**  
   Wrap in a div with `overflow-x-auto` (and optionally `min-w-0`) so horizontal scroll is inside the page, not the viewport.

6. **Flex children with text or unknown width**  
   Add `min-w-0` (or `app-no-overflow`) so they can shrink and don’t push the layout past the viewport.

7. **New auth/onboarding screens**  
   Use the existing auth layout and PWA shell; keep form/content in `.shellScroll` and CTAs in `.shellFooter`.

---

## Quick checklist for a new page

- [ ] Page lives under a layout that already has a single scroll region (dashboard/admin/auth), **or** the page provides its own viewport-filling wrapper and single scroll area.
- [ ] No full-width element without `min-w-0` / `max-w-full` in a flex container.
- [ ] Any table or horizontal list is inside an `overflow-x-auto` container.
- [ ] Any new modal/dialog has `max-h` / `max-w` and scroll inside.

Following these keeps the whole platform in range like a mobile app.
