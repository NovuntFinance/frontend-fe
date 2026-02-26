# Novunt Dashboard — Design System & Structure (Detailed Prompt)

Use this document to describe how the dashboard is structured: colors, spacing, margins, padding, cards, and key UI elements. It serves as a single source of truth for design consistency and for prompting AI or designers.

---

## 1. Overall layout structure

- **Shell:** A full-height flex column (`min-h-full flex-col`; on `lg`: `lg:h-full`). Background is solid **#0D162C** (dark blue). The wrapper uses **safe-area insets** for PWA/home-screen: `paddingTop`, `paddingLeft`, `paddingRight` from `env(safe-area-inset-*)`.
- **Header:** Fixed at top, below `env(safe-area-inset-top)`. It **slides up off-screen** on scroll-down and **slides back** on scroll-up (transform, 150ms ease-out). A **spacer** below the header keeps content from jumping: `minHeight: calc(4rem + env(safe-area-inset-top))`.
- **Main content:** `<main id="main-content">` is the scroll container on large screens (`lg:overflow-y-auto`, `lg:flex-1`, `lg:min-h-0`). **Padding:** `px-3 pt-6 pb-24` (sm: `px-4`, md: `px-5 pt-8`, lg: `px-6 pt-8 pb-0`). Bottom padding reserves space for the fixed bottom nav; on `lg`, `pb-0` because layout differs.
- **Bottom nav:** Fixed at bottom, full width. **Slides down** off-screen on scroll-down and **slides back** on scroll-up (150ms ease-out). Height includes safe area: `minHeight: calc(66px + env(safe-area-inset-bottom))`. Content area uses `pb-24` so it is not hidden behind the nav.

---

## 2. Color usage

### 2.1 Brand / primary palette

- **Dark blue (primary surface):** `#0D162C` — Page background, header, nav bar, card backgrounds, neumorphic base. Used for all major surfaces.
- **Light blue (accent):** `#009BF2` — Primary accent: links, active states, icons, labels, CTAs, focus rings, rank badges. The only strong secondary color in the UI.
- **White / off-white:** Used for primary text and highlights on dark blue: `rgba(255, 255, 255, 0.95)` (primary), `rgba(255, 255, 255, 0.9)` (labels), `rgba(255, 255, 255, 0.7)` (muted).

### 2.2 Neumorphic design tokens (CSS variables)

Defined in `src/styles/neumorphic.module.css` and used across dashboard, wallet, stake, auth:

- **Background:** `--neu-bg: #0d162c` (same as brand dark blue).
- **Accent:** `--neu-accent: #009bf2`; `--neu-accent-rgb: 0, 155, 242` for rgba usage.
- **Text hierarchy (accent-based opacity):**
  - `--neu-text-primary: rgba(var(--neu-accent-rgb), 0.95)`
  - `--neu-text-secondary: rgba(var(--neu-accent-rgb), 0.75)`
  - `--neu-text-muted: rgba(var(--neu-accent-rgb), 0.5)`
- **Border:** `--neu-border: rgba(var(--neu-accent-rgb), 0.08)` — subtle, never heavy.
- **Shadows (dark neumorphism, no colored glow):**
  - Dark: `--neu-shadow-dark: rgba(0, 0, 0, 0.45)`
  - Light: `--neu-shadow-light: rgba(255, 255, 255, 0.04)`
  - Raised: `8px 8px 16px` dark, `-8px -8px 16px` light (hover: 10px/20px).
  - Inset: `inset 5px 5px 10px` dark, `inset -5px -5px 10px` light (press: 6px/12px).
- **Focus:** `--neu-focus-ring: rgba(var(--neu-accent-rgb), 0.2)`.
- **Radius:** `--neu-radius-sm: 16px`, `--neu-radius-md: 18px`, `--neu-radius-lg: 24px`.
- **Transition:** `--neu-transition: 0.25s cubic-bezier(0.4, 0, 0.2, 1)`; slow: `0.3s`.

### 2.3 WelcomeBackCard (inverted) colors

- **Main card:** Background `#0D162C`; label `rgba(255, 255, 255, 0.9)`; value `#009BF2`.
- **Sub-cards (e.g. Total Assets breakdown):** Background `#009BF2`; label `rgba(13, 22, 44, 0.85)`; value `#0D162C`; border `1px solid rgba(13, 22, 44, 0.2)`.
- **Share / Eye buttons:** Light blue circle (`#009BF2` or similar), dark icon for contrast.

### 2.4 Semantic / feedback colors

- **Success / earned / positive:** Green tones (e.g. `text-green-600`, `dark:text-green-400`, `emerald-*` for registration bonus, progress).
- **Warning / bonus:** Amber (`amber-500/30`, `amber-500/10`), gold in charts.
- **Info / links:** Blue accent `#009BF2`.
- **Destructive:** Red/destructive token only where needed.
- **Activity feed:** Type-based colors (deposit=blue, withdraw=purple, stake=emerald, referral=green, etc.) for icons and labels.

### 2.5 App-level tokens (globals.css)

- `--app-page-bg`, `--app-surface`, `--app-surface-raised` (light mode); dark mode overrides.
- `--app-accent: #009bf2`, `--app-border`, `--app-shadow-dark`, `--app-shadow-light` — used where component-specific neumorphic tokens are not.

---

## 3. Spacing: margins, padding, gaps

### 3.1 Page and main content

- **Main content area:** `px-3 pt-6 pb-24` (base); `sm:px-4`; `md:px-5 md:pt-8`; `lg:px-6 lg:pt-8 lg:pb-0`.
- **Vertical rhythm:** Consistent **gap-5** (1.25rem / 20px) between sections and cards within a column. Between columns on grid: **gap-5** (`lg:gap-5`).

### 3.2 Dashboard home (three-column grid on lg)

- **Outer container:** `space-y-5` on mobile; `lg:grid lg:grid-cols-3 lg:gap-5 lg:space-y-0`.
- **Each column:** `flex flex-col gap-5`; columns use `lg:min-h-0 lg:overflow-y-auto` so each column scrolls independently when needed.
- **Cards within a column:** Same **gap-5** between WelcomeBackCard, QuickActions card, Stats carousel, Activity Feed, StakeCard, LiveTradingSignals, RosCalendarCard, LivePlatformActivities.

### 3.3 Card internal padding

- **Standard cards (Quick Actions, Stats carousel, etc.):** `p-5 sm:p-6` with `rounded-2xl` (e.g. 1rem radius).
- **WelcomeBackCard:** `p-5 sm:p-6` in the inner content wrapper.
- **StakeCard:** `p-4 sm:p-6` and `rounded-[18px]` (aligns with `--neu-radius-md`).
- **Header:** `py-2`, horizontal `px-3` (and `pr-16`/`pr-20` to clear the theme/support icons).

### 3.4 Component spacing

- **QuickActions:** Container uses `gap-x-2 gap-y-6 sm:gap-x-4 sm:gap-y-2`; on desktop grid: `lg:gap-4`. Buttons: `gap-3 sm:gap-2` (icon to label).
- **Stats carousel:** Label/value spacing: `mb-2` for label above value.
- **StakeCard:** `mb-4` for header block; internal sections use consistent small gaps (e.g. `gap-2`, `gap-3`).
- **Activity feed / lists:** List items spaced by parent `gap-5` or equivalent; internal padding follows card rules above.

### 3.5 Bottom nav and safe areas

- **Bottom nav height:** `66px + env(safe-area-inset-bottom)` so content uses `pb-24` to stay above the bar and notch.
- **Header spacer:** `minHeight: calc(4rem + env(safe-area-inset-top))` so content starts below the fixed header.

---

## 4. Cards and surfaces

### 4.1 Neumorphic card style (default)

- **Background:** `#0D162C` or `var(--neu-bg)`.
- **Border:** `1px solid var(--neu-border)` or `1px solid var(--app-border)` (very subtle).
- **Shadow:** Dual shadow for “raised” look: e.g. `8px 8px 20px rgba(4, 8, 18, 0.7), -8px -8px 20px rgba(25, 40, 72, 0.5)` (or use `--neu-shadow-raised`).
- **Border radius:** `rounded-2xl` (1rem) or `rounded-[18px]` (--neu-radius-md).
- **Hover:** Slightly stronger shadow (e.g. 10px/20px) and optional `translateY(-1px)`.
- **Press/active:** Inset shadow (`--neu-shadow-inset`) and no translate.

### 4.2 Quick Actions

- Wrapper: same neumorphic card (dark blue, dual shadow, `rounded-2xl p-5 sm:p-6`). Buttons inside: raised by default, inset on press; icon color `#009BF2`; no glow, only dual shadows.

### 4.3 WelcomeBackCard

- Outer card: dark blue `#0D162C`; inner sub-cards for breakdown: light blue `#009BF2` with dark text; share/eye as neumorphic icon buttons (same treatment as theme toggle).

### 4.4 StakeCard

- Uses `neu-card` from neumorphic module; `rounded-[18px] p-4 sm:p-6`. Registration bonus variant: stronger border `border-[rgba(0,155,242,0.25)]`. Internal fields use `--neu-shadow-inset`, `--neu-border`, `--neu-bg` for inputs/values. Dashboard variant: white primary text; amounts respect balance visibility (masked with `••••••` when hidden).

### 4.5 Header and nav bar

- **Header:** `var(--neu-bg)`, `borderBottom: 1px solid var(--neu-border)`, boxShadow: dual shadow plus subtle inset top highlight (`inset 0 1px 0 rgba(255,255,255,0.04)`).
- **Nav bar:** Same neumorphic raised style: `var(--neu-bg)`, top border `var(--neu-border)`, dual shadow; bottom nav has rounded top corners (`20px 20px 0 0`) and optional notch mask. Icon color active: `#009BF2`; inactive: `rgba(0, 155, 242, 0.75)`.

---

## 5. Typography

- **Primary text on dark:** White/off-white: `rgba(255, 255, 255, 0.95)` or `var(--neu-text-primary)`.
- **Labels/secondary:** `rgba(255, 255, 255, 0.9)` or smaller with `var(--neu-text-secondary)` / `0.75` opacity.
- **Muted/tertiary:** `var(--neu-text-muted)` or `0.5` opacity; or Tailwind `text-slate-400`/`text-slate-500` where semantic (e.g. hints).
- **Accent labels (e.g. stat names):** `#009BF2`, `text-xs` or `text-sm`, `font-semibold`/`font-medium`.
- **Numbers/values:** Large and bold: `text-xl` to `text-3xl`, `font-black` or `font-bold`; white or accent depending on context.
- **Rank badge:** Small uppercase: `text-[10px] font-semibold tracking-wider uppercase`, background `rgba(0, 155, 242, 0.35)`, color `#009BF2`, border `1px solid rgba(0, 155, 242, 0.4)`.

---

## 6. Borders and shadows (summary)

- **Borders:** Prefer subtle: `var(--neu-border)` or `rgba(0, 155, 242, 0.08)`. Stronger only for emphasis (e.g. registration bonus card, focus state): `rgba(0, 155, 242, 0.25)` or `0.35`.
- **Shadows:** No colored glows. Raised: dual (dark bottom-right, light top-left). Inset: dual inset for inputs and pressed states. Header/nav: same dual shadow plus optional thin inset highlight on top edge.

---

## 7. Responsive breakpoints

- **Mobile-first.** Base: single column, full-width cards, `px-3`, `gap-5`, `space-y-5`.
- **sm:** `px-4`, slightly larger touch targets and text where needed.
- **md:** `px-5 pt-8`, more breathing room.
- **lg:** Three-column grid (`grid-cols-3`), `gap-5`, main is scroll container; columns can scroll independently; bottom padding on main removed (`pb-0`).
- **xl/2xl:** Optional `gap-8` or `gap-10` for Quick Actions grid; larger typography scales (e.g. `xl:text-2xl`).

---

## 8. Motion and transitions

- **Header/nav show-hide:** `transition-transform duration-150 ease-out` (translateY).
- **Neumorphic interactions:** `--neu-transition` (0.25s) for box-shadow and transform; press uses inset shadow.
- **Page entrance:** Framer Motion: subtle `opacity` + `y` (e.g. 20px or -20px) with short delay (0.15–0.35s) for cards/sections.
- **Carousels (stats, featured stake):** AnimatePresence; exit with opacity and optional position absolute to avoid layout jump. Duration ~0.25s.
- **Reduced motion:** Respect `prefersReducedMotion()`; disable or simplify animations where applicable.

---

## 9. PWA and safe areas

- **Standalone display:** `min-height: 100dvh` and `-webkit-fill-available` on html/body so the viewport isn’t clipped when launched from home screen.
- **Safe areas:** All fixed/sticky UI (header, nav, theme button) use `env(safe-area-inset-top)` / `env(safe-area-inset-bottom)` so notches and home indicators don’t overlap content. Layout wrapper uses `paddingTop/Left/Right` from safe-area insets.

---

## 10. Important elements checklist

- **Page background:** Always `#0D162C`.
- **Cards:** Dark blue base, dual shadow, 1px subtle border, `rounded-2xl` or 18px, internal padding `p-5 sm:p-6` (or `p-4 sm:p-6` for StakeCard).
- **Spacing between sections/cards:** Uniform **gap-5** (and column gap `gap-5` on grid).
- **Main content padding:** `px-3 pt-6 pb-24` scaling to `px-6 pt-8 pb-0` on lg.
- **Accent:** `#009BF2` for interactive elements, labels, and highlights; text hierarchy via white/opacity or accent opacity.
- **No light blue border on header/nav:** Use `var(--neu-border)` only.
- **Header/nav:** Neumorphic (dual shadow + subtle border); scroll-to-hide with 150ms transform.
- **Balance visibility:** When hidden, mask amounts with `••••••` in dashboard StakeCard and anywhere displaying sensitive figures.

Use this document to keep new components and pages consistent with the existing dashboard structure and to generate accurate design or implementation prompts.
