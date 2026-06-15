# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 1 — Foundation
**Last completed:** 04 Database Schema
**Next:** 05 Profile Page — Full UI

---

## Progress

### Phase 1 — Foundation

- [x] 01 Homepage
- [x] 02 Auth
- [x] 03 PostHog Initialization
- [x] 04 Database Schema

### Phase 2 — Profile Page

- [ ] 05 Profile Page — Full UI
- [ ] 06 Profile Save Logic
- [ ] 07 AI Profile Extraction from Resume
- [ ] 08 Resume PDF Generation from Profile

### Phase 3 — Find Jobs Page

- [ ] 09 Find Jobs Page — Full UI
- [ ] 10 Adzuna Job Discovery
- [ ] 11 Filter + Sort + Pagination

### Phase 4 — Job Details Page

- [ ] 12 Job Details Page — Full UI
- [ ] 13 Company Research Agent

### Phase 5 — Dashboard

- [ ] 14 Dashboard Page — Full UI
- [ ] 15 Stats Bar — Real Data
- [ ] 16 Recent Activity — Real Data
- [ ] 17 Analytics Charts — PostHog Data

---

## Decisions Made During Build

- **04 Database Schema — profile auto-creation:** DB trigger `on_auth_user_created` (`AFTER INSERT ON auth.users`, `SECURITY DEFINER`) inserts a skeleton profiles row on every new OAuth sign-in. No app-level upsert needed.
- **04 Database Schema — jobs.status column:** Added `status TEXT NOT NULL DEFAULT 'active'` to `jobs` table to support future `actions/jobs.ts` status updates (saved / applied / archived). Cheapest time to add it.
- **04 Database Schema — migration file:** `migrations/20260615200535_initial-schema.sql` — single migration covering all 4 tables, indexes, trigger, RLS policies, and grants. Applied via `db migrations up --all`.
- **04 Database Schema — resumes bucket:** Private bucket named `resumes` created via InsForge CLI. Authenticated access only.

- **02 Auth — InsForge SSR package:** the real package is `@insforge/sdk` with the
  `@insforge/sdk/ssr` subexport (`createBrowserClient`, `createServerClient`,
  `updateSession`, `createRefreshAuthRouter`, `setAuthCookies`). There is no
  `@insforge/ssr` package. Context files were corrected to match.
- **02 Auth — Next.js 16 proxy:** route protection is `proxy.ts` at the root
  (Next 16 renamed `middleware` → `proxy`), running `updateSession()`.
- **02 Auth — server-side OAuth:** OAuth must complete server-side. The browser
  SDK keeps tokens in memory + an InsForge-domain httpOnly cookie and never writes
  app-domain cookies, so a client callback page can't establish the session the
  proxy reads. Flow: `/api/auth/oauth/[provider]` (stores PKCE verifier in an
  httpOnly lax cookie) → provider → `/api/auth/callback` (exchanges code,
  `setAuthCookies`) → `/dashboard`.
- **02 Auth — session reads:** use `auth.getCurrentUser()` (async), not `getUser()`.

---

## Notes

- **02 Auth — manual step required:** add the OAuth callback URL
  (`<origin>/api/auth/callback`, e.g. `http://localhost:3000/api/auth/callback`
  for dev + the production URL) to **allowedRedirectUrls** in the InsForge
  dashboard. Until then the OAuth round-trip fails. Only the `redirect_uri` passed
  to `signInWithOAuth` needs allowlisting — not `/dashboard`.
- **02 Auth — verification status:** build/typecheck pass; proxy redirects
  unauthenticated `/dashboard`, `/profile`, `/find-jobs/*` → `/login`; OAuth
  initiation redirects to the provider and sets the PKCE cookie. The full
  Google/GitHub consent → callback → session leg is **unverified pending the
  dashboard config above** (and `/dashboard` page, built in Feature 14).
- **Env:** `.env.local` holds `NEXT_PUBLIC_INSFORGE_URL` + `NEXT_PUBLIC_INSFORGE_ANON_KEY`.
- **03 PostHog — posthog.reset() deferred:** `posthog.reset()` must be called alongside `insforge.auth.signOut()` when the logout button is built. `resetPostHog()` is already exported from `@/lib/posthog-client` — import and call it there. InsForge `Auth` has no `onAuthStateChange`, so reset cannot be wired reactively.
