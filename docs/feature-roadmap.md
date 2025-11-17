# Novunt Frontend Delivery Roadmap

_This roadmap captures the phased rebuild priorities derived from_ `FRONTEND_BUILD_PROMPT.md` _and_ `API_COMPLETE_DOCUMENTATION.md`. _Each phase must be feature-complete, exercised against the real API, and accompanied by automated and manual verification before it can be checked off._

> **Verification rule:** A phase is only marked complete (`[x]`) after all scoped features pass linting, unit/integration tests, UI smoke checks, and a live API sanity run in the intended environments (desktop + mobile viewport, light + dark mode, offline/online where applicable).

## Phase 0 — Platform Foundations (Blocker Level)
- [ ] **Environment & Tooling**
  - React Query, Zustand, Tailwind, shadcn/ui, Framer Motion baselines aligned with the prompt.
  - Jest/Vitest unit harness + Playwright/Cypress smoke suite wired into CI.
  - Lint/format hooks (ESLint, Prettier, Stylelint) and type-check gate.
- [ ] **API Contract Sync**
  - Validate all existing clients against `API_COMPLETE_DOCUMENTATION.md`; stub contracts for missing endpoints.
  - Global error handling, toast patterns, and retry policies.
- [ ] **PWA Skeleton**
  - next-pwa service worker, manifest, install prompt handler, offline shell, basic caching strategy.

## Phase 1 — Trust & Access (Highest Priority)
- [ ] **Landing Experience**
  - Hero, feature highlights, testimonials, CTA flow per design brief with motion system.
- [ ] **Authentication Suite**
  - Multi-step signup (email verification → password → profile → optional 2FA setup) aligned to API payloads.
  - Login with email/password, 2FA, biometric hand-off, remember-me.
  - Password recovery & reset, session expiry refresh, demo login toggle.
- [ ] **KYC Onboarding**
  - Document capture, selfie upload, progress tracker, status polling, and UX guardrails.

## Phase 2 — Core Banking Surfaces
- [ ] **Dashboard Hero**
  - Total balance counter, animated quick actions, performance KPIs, skeletons, error fallbacks.
- [ ] **Portfolio Analytics**
  - Real data charts (7D/30D/90D/1Y), ROI indicators, number animations, accessibility compliance.
- [ ] **Activity Feed**
  - Real-time (or polled) transaction, stake, bonus events with filters, micro-interactions, and empty states.

## Phase 3 — Wallet Management
- [ ] **Funded & Earnings Wallets**
  - Balance cards, threaded transaction history with infinite scroll and filters.
- [ ] **Transfers**
  - Funded ↔ Earnings transfer wizard with validation, optimistic updates, reversal handling.
- [ ] **Deposits**
  - USDT address generation, QR display, copy feedback, expiration timers, status polling, offline persistence.

## Phase 4 — Investment Engine
 - [ ] **Staking Offers Surface**
   - Render dynamic staking opportunities exactly as delivered by the staking engine (e.g., `/api/v1/staking/plans`), including rate tiers, minimums, tenure, and eligibility flags with premium hover/motion treatments.
  - Amount validation, confirmation modal, success celebration, API confirmation.
  - Progress cards, ROI tracking, and stake withdrawal flow via `/api/v1/staking/:id/withdraw`, ensuring goal progress mirrors stake status.

## Phase 5 — Cash Out Operations
- [ ] **Withdrawal Request**
  - Amount + fee calculator, network selection, saved address book integration, preview modal.
- [ ] **Withdrawal Timeline**
  - Status tracker (pending → processing → completed/rejected), cancellation paths, notifications.
- [ ] **Transaction Center**
  - Master list with grouping, filters, search, detail view receipts, share/download.

## Phase 6 — Growth Programs
- [ ] **Referral Intelligence Hub**
  - Surfaces from `/api/v1/bonus/referral-stats`, `/api/v1/referrals/tree`, and leaderboard endpoints with share sheets, QR invites, and level-based earnings.
- [ ] **Registration & Social Bonus Flow**
  - UX for `/api/v1/registration-bonus/status`, `/claim`, and `/verify-social`, including social dwell timers and bonus claim celebrations.
- [ ] **Rank & Pool Rewards**
  - Visualize `/user/rank/current`, `/user/rank/progress`, and pool eligibility pulled from rank config APIs—Performance Pool (`/distribute-rank-pool`) and Premium Pool (`/distribute-redistribution-pool`)—with celebratory unlock animations and payout history.

## Phase 7 — Personalisation & Security
- [ ] **Profile Management**
  - Avatar upload with crop, personal info edits, rank progression display.
- [ ] **Security Center**
  - 2FA management, biometric toggle, password change, session viewer/termination.
- [ ] **Notification Preferences**
  - Email/SMS/push toggles, topic filters, in-app notification panel.
- [ ] **Biometric Authentication**
  - WebAuthn device registration, biometric login, backup PIN flows using `/api/v1/biometric/*` endpoints.

## Phase 8 — Administrative Command Center
- [ ] **Admin Dashboard**
  - Platform metrics, financial charts, reconciliation status, fraud alerts.
- [ ] **User Management**
  - Advanced search, filters, KYC approvals, role updates, account actions, audit log linkage.
- [ ] **Approval & Rules Engine**
  - Multi-step approval workflows, comments, business rule editor with versioning.
- [ ] **Special Funds Management**
  - Admin dashboards for `/admin/special-funds/*` (contract creation, activation, analytics) plus user-side insights from `/user/special-funds/*`.
- [ ] **Dynamic Configuration Center**
  - UI for managing system configs (e.g., rank system `/rank-management/config`, social media URLs, notification settings) with audit trail and approvals.
- [ ] **AI Operations Suite**
  - Surface AI chatbot management endpoints and insights referenced in the documentation (training data, audit logs, escalation routing).

## Phase 9 — PWA Excellence & Polish (Ongoing)
- [ ] **Advanced PWA Features**
  - Push notifications (web push subscription flow), background sync, IndexedDB caching for offline transactions.
- [ ] **Performance & Accessibility**
  - Lighthouse ≥ 90 (Performance, Accessibility), bundle analysis, lazy loading strategy.
- [ ] **Visual Polish**
  - Light/dark theming parity, motion refinement, glassmorphism accents, WCAG verification.

---

### Usage Notes
- Track additional subtasks beneath each bullet in commit messages or linked issue trackers.
- Align each implementation ticket with both the roadmap phase and the corresponding API documentation section.
- Update this file at the end of every phase with:
  1. Checkbox state change.
  2. Links to merged PRs, demos, or testing artifacts.
  3. Any discovered follow-up work or regression risks.
