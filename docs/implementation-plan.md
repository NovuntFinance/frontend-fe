# Novunt Frontend & PWA Master Plan

> Drafted: 2025-10-05  \
> Scope: Build a banking-grade, animation-rich progressive web application for Novunt

---

## 1. Vision & Success Criteria

- **Experience**: Deliver a premium, trust-first financial UX rivaling Revolut, Apple Card, and Binance, with buttery animations that clarify state changes.
- **Performance**: Fast first paint (<2s on mid-tier mobile), <100ms interactive transitions, offline-ready core flows, responsive from 320px to ultrawide.
- **Security**: Respect banking-level expectations—strict auth flows, protected data handling, guarded API calls, and clear user feedback.
- **Delight**: Continuous micro-interactions (hover, press, data updates), guided onboarding, celebratory success states (e.g., confetti, coin flows).
- **Reliability**: Automated tests (unit, integration, e2e) and rigorous quality gates (lint, typecheck, Lighthouse PWA > 95).

---

## 2. Experience Pillars

| Pillar | Description | Key Artifacts |
| --- | --- | --- |
| **Immersive Motion** | Framer Motion driven transitions, animated charts, staged data reveals. | Animation library, motion tokens, component guidelines. |
| **Data Trustworthiness** | Real-time balances, staking progress, and notifications backed by resilient React Query patterns. | Shared API client, caching strategy, optimistic updates. |
| **Progressive Web App** | Installable, offline-ready, smart caching, push notification plumbing. | `manifest.json`, service worker, background sync, push registration. |
| **Accessibility & Inclusivity** | WCAG 2.1 AA color contrast, keyboard flows, reduced-motion fallbacks, screen-reader affordances. | A11y checklist, component linting, semantic structure. |
| **Scalability** | Modularized feature domains, typed state slices, easy-to-extend UI kit. | `src/components/ui`, domain-driven routing, story-driven docs. |

---

## 3. Architecture Overview

### Frontend Stack
- **Framework**: Next.js 15 App Router (current project version).
- **Language**: TypeScript, leveraging strict mode.
- **Styling**: Tailwind CSS + custom utility classes + CSS variables for theming.
- **State**: React Query for server state (already scaffolded Providers), Zustand for auth/session store, React Context for theme & feature toggles.
- **Animations**: Framer Motion as core library, supplemented with CSS keyframes for micro-interactions.
- **Forms**: `react-hook-form` + `zod` for validation.
- **Charts & Data Viz**: `recharts` for interactive charts, animated with Motion wrappers.
- **Real-time**: `socket.io-client` for notifications and live balance updates.

### Backend Integration
- Base URL: `process.env.NEXT_PUBLIC_API_URL` (default `http://localhost:5000`).
- Auth: Bearer token (persisted via Zustand + localStorage) with interceptor-based refresh/redirect.
- API definitions: Reference `API_COMPLETE_DOCUMENTATION.md` for endpoints (auth, wallets, stakes, transactions, referrals, admin).

---

## 4. Progressive Web App Roadmap

1. **Manifest & Icons**
   - Create `public/manifest.json` with complete metadata (name, theme, icons, start URL, display `standalone`).
   - Generate icon set (192, 256, 384, 512) and maskable variants.

2. **Service Worker & Caching Strategy**
   - Use Next.js `appDir` + custom `app/sw.ts` (or `worker/` directory) compiled with Workbox or `next-pwa` plugin.
   - Precaching shell assets, runtime caching for API GETs (`stale-while-revalidate`), background sync for POST fallbacks.

3. **Offline UX**
   - Offline screen for critical routes, graceful fallbacks for dashboard and transactions.
   - Persistent queue for stake/withdraw actions (with background sync retry).

4. **Push Notifications**
   - Wire VAPID public key from `.env.local`.
   - Provide opt-in UI inside dashboard settings.

5. **PWA Verification**
   - Lighthouse PWA score ≥ 95 on mobile; automated in CI.
   - Manual install tests on iOS Safari, Android Chrome, Desktop Chrome/Edge.

---

## 5. Feature Programme

### Milestone A — Foundation (Week 1)
- ✅ Audit current landing experience (already animated hero & progress demo).
- [ ] Add PWA essentials (manifest, icons, service worker scaffold).
- [ ] Harden global typography, spacing, and theme tokens.
- [ ] Establish component docs (Storybook or MDX-based Styleguide).

### Milestone B — Authentication & Onboarding (Week 2)
- [ ] Login, signup, verify-email, password recovery (App Router segments as per guide).
- [ ] Auth layout with dynamic hero, animated forms, error states.
- [ ] Integrate API endpoints for auth, persist tokens, handle refresh + logout flows.
- [ ] Add onboarding walkthrough (modal/coach marks) after first login.

### Milestone C — Core Dashboard (Weeks 3-4)
- [ ] Dashboard overview: balances, staking progress, premium pool metrics.
- [ ] Animated BalanceCard with live updates, toggleable balance masking.
- [ ] Active stakes grid with progress arcs, withdraw CTA, ROI timeline.
- [ ] Recent transactions list with filters, skeleton loaders, virtualization.
- [ ] Socket-driven notifications center + in-app toasts.

### Milestone D — Wallets & Staking Journeys (Weeks 5-6)
- [ ] Wallet management (funded vs earnings) with transfer flows.
- [ ] Create stake wizard with goal visualization (200% target), risk disclosures.
- [ ] Withdraw, auto-compound, premium pool join flows.
- [ ] Goal tracking timeline + milestone celebrations.

### Milestone E — Referrals, Bonuses & Admin (Weeks 7-8)
- [ ] Referral dashboard with share links, tree visualization, leaderboard.
- [ ] Bonuses history cards with filters, claim animations.
- [ ] Admin suite: user management, KYC reviews, analytics dashboards.
- [ ] Audit logs and role-based UI locking.

### Milestone F — Polish, Performance & Launch (Weeks 9-10)
- [ ] Lighthouse sweeps, bundle optimization (code-splitting, RSC where possible).
- [ ] Full accessibility audit (axe-core, manual keyboard testing, screen reader).
- [ ] Localization/i18n groundwork (English launch, ready for future languages).
- [ ] Final branding QA, marketing landing sections, production deployment runbook.

---

## 6. Delivery Tracks

1. **Design System & Motion**
   - Build component tokens, theme generator, motion presets.
   - Document usage in `/docs/design-system.md` (future addition).

2. **Domain Features**
   - Each domain (auth, dashboard, stakes, wallets, referrals, admin) has dedicated `src/app/(domain)` routes, shared hooks (`src/hooks`), and UI modules.

3. **Quality & Tooling**
   - Enforce lint (`npm run lint`), typecheck, tests (`npm run test`) in CI.
   - Add Storybook or Ladle for component QA.
   - Set up Playwright for end-to-end critical journeys.

4. **DevX Enhancements**
   - Pre-commit lint-staged hooks, GitHub Actions pipeline, preview deployments.
   - DX documentation in `/docs/dev-workflow.md` (future addition).

---

## 7. Immediate Action Items (Next 48 Hours)

1. **PWA Setup**
   - Create manifest + icons.
   - Integrate service worker scaffold with Workbox.
   - Update `next.config.ts` to register SW (`next-pwa` or custom middleware).

2. **Infrastructure Enhancements**
   - Configure Absolute imports & alias checks (already partially done).
   - Add Storybook/Ladle for rapid UI prototyping (optional but recommended early).

3. **Design System Kickoff**
   - Audit `shadcn/ui` components in use; generate base theme variants (dark/light/premium).
   - Document typography scale and spacing decisions.

4. **API Integration Prep**
   - Create shared `api` wrapper (already present) and typed query hooks for wallets, stakes, transactions.
   - Draft mock data fixtures for offline development & storybook.

---

## 8. Quality Gates & Metrics

- **Static Analysis**: ESLint (with Next, Tailwind, accessibility plugins) must pass.
- **Types**: `npx tsc --noEmit` as mandatory gate.
- **Tests**: Unit (Vitest/Jest), component (Testing Library), e2e (Playwright) baseline coverage for auth & dashboard before Milestone C sign-off.
- **Performance**: Track Core Web Vitals with Next Analytics + Lighthouse CI.
- **Security**: OWASP ASVS Level 1 checklist, dependency audit (`npm audit`, `snyk` optional).

---

## 9. Risks & Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Complex animation pipeline increases render cost | Medium | Use motion variants judiciously, respect `prefers-reduced-motion`, profile with React DevTools. |
| Offline caching conflicts with fresh financial data | High | Adopt cache-first for shell, network-first for balances/transactions, force revalidation on focus. |
| Backend API instability | High | Implement graceful fallbacks, exponential retry, expose status banners when API degraded. |
| Scope creep | Medium | Lock milestone scope, maintain backlog triage in `/docs/roadmap.md`. |
| Accessibility regressions | Medium | Automated axe checks in CI, manual QA every milestone. |

---

## 10. Communication & Workflow

- **Backlog**: Maintain canonical backlog in `/docs/roadmap.md` (to be created) synced with project management tool.
- **Branching**: Conventional branches per feature (`feature/<domain>-<short-desc>`), PR templates with QA checklist.
- **Cadence**: Weekly milestone review, bi-weekly design QA, monthly accessibility audit.
- **Decision Log**: Record major decisions in `/docs/adr/` (architecture decision records).

---

## 11. Next Steps

1. Implement Manifest + Service Worker scaffold (Milestone A tasks #1-2).
2. Set up Storybook or Ladle for component visualization.
3. Begin Auth route implementations per `GETTING_STARTED_VSCODE_CLAUDE.md` Phase 6.
4. Schedule accessibility baseline audit after PWA setup.

> This plan will evolve as we deliver milestones. Keep the document updated with progress, and create linked docs (`design-system.md`, `roadmap.md`, ADRs) as milestones kick off.
