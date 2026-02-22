# Debug dashboard 100vh on live

If the middle row still expands on production (full-page scroll instead of only the main area scrolling), use this checklist in the browser.

## 1. Open the live dashboard

- Go to your production dashboard URL (e.g. `https://novunt.com/dashboard`).
- Use a **large viewport** (e.g. resize to ≥1024px or use desktop).

## 2. Find the dashboard wrapper in DevTools

1. **Right‑click** the main dashboard area (the dark blue background) → **Inspect** (or F12 → Elements / Inspector).
2. In the **DOM tree**, find the wrapper that should be the “dashboard shell”:
   - It’s the **first div** inside `<main id="main-content">`’s parent (so the direct parent of the header + main).
   - In code it’s the div with `className="dashboard-viewport-cap min-h-screen lg:..."` and `style={{ background: '#0D162C' }}`.
3. **Click that div** in the tree so it’s selected.

## 3. Check what’s applied on that wrapper

In the **Styles** (or **Computed**) panel for that element, confirm:

| What to check  | Expected                                | If missing                                                                                     |
| -------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **max-height** | `100vh` (at viewport ≥1024px)           | Tailwind `lg:max-h-screen` or our `.dashboard-viewport-cap` might be missing in the built CSS. |
| **overflow**   | `hidden` (at ≥1024px)                   | Same as above for `lg:overflow-hidden` or `.dashboard-viewport-cap`.                           |
| **height**     | `100vh` (at ≥1024px) from `lg:h-screen` | Layout may not be getting a fixed height.                                                      |

- Use the **device toolbar** or resize the window so width ≥1024px; re-check the same rules.
- In **Styles**, look for:
  - A rule like `.dashboard-viewport-cap` inside `@media (min-width: 1024px)` (our defensive class).
  - Or Tailwind classes such as `lg:max-h-screen` / `lg:overflow-hidden` (may appear as long hashes, e.g. `.lg\:max-h-screen { max-height: 100vh; }`).

## 4. Check for an extra wrapper

- With the same div selected, look at its **parent** elements up to `<body>`.
- See if any parent has:
  - **min-height** that’s larger than the viewport, or
  - **overflow: visible** (or no overflow) and tall content, so the **body** scrolls instead of the inner `<main>`.
- If you find a wrapper that’s taller than 100vh or that allows overflow to escape, that’s likely why the page expands; we’d need to adjust that wrapper (or the layout that renders it) so only the dashboard’s `<main>` scrolls.

## 5. Check where scrolling happens

- **Scroll** the page on a large viewport.
- In the **Elements** view, watch which element gets the **scrollbar** (often shown as a highlighted “scroll” region).
- **Expected:** the element with `id="main-content"` (the `<main>`) has `overflow-y: auto` and is the one that scrolls.
- **Problem:** if the **window/body** is scrolling, the dashboard wrapper is not constraining height (see step 3 and 4).

## 6. Quick summary to report back

If it’s still broken, note:

- On the dashboard wrapper div: do you see **max-height: 100vh** and **overflow: hidden** at desktop width? (yes/no)
- Do you see the class **`.dashboard-viewport-cap`** in the Styles panel for that div? (yes/no)
- Which element actually scrolls: **main#main-content** or the **window/body**?

That will narrow down whether the issue is missing CSS on the wrapper, an extra wrapper, or something else.
