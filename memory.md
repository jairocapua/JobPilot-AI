# Memory — Feature 03 PostHog Initialization + Review Fixes

Last updated: 2026-06-16

## What was built

**Feature 03 — PostHog Initialization (complete):**

- `lib/posthog-client.ts` — browser PostHog wrapper; exports `initPostHog()` (calls `posthog.init` with `capture_pageview: false`, `person_profiles: "identified_only"`), `resetPostHog()` (wraps `posthog.reset()` for use when logout is built), and re-exports the `posthog` singleton
- `lib/posthog-server.ts` — server PostHog factory; exports `createPostHogServer()` returning a `PostHog` instance with `flushAt: 1`, `flushInterval: 0`
- `app/providers.tsx` — updated; calls `initPostHog()` on mount, then `insforge.auth.getCurrentUser()` to identify the user if a session exists; `.catch()` handles auth failures silently; `posthog` now imported from `@/lib/posthog-client` (not directly from `posthog-js`)
- `package.json` / `package-lock.json` — `posthog-node` installed
- `context/progress-tracker.md` — Feature 03 marked complete; `posthog.reset()` deferral noted under Notes

**Carried forward from Feature 02 (unchanged):**
- `app/layout.tsx` already wraps the app in `<PostHogProvider>` — no changes needed
- `app/providers.tsx` already had `PostHogPageView` for manual `$pageview` tracking — kept as-is

## Decisions made

- **InsForge `Auth` has no `onAuthStateChange`:** Cannot reactively listen for login/logout events. Identity is established on mount by calling `getCurrentUser()`. `posthog.reset()` cannot be wired reactively — it must be called explicitly at the logout trigger.
- **`posthog.reset()` deferred to logout feature:** `resetPostHog()` is exported from `@/lib/posthog-client` and ready. Trigger: call it alongside `insforge.auth.signOut()` wherever the logout button is built. Logout is `POST /api/auth/logout` (from Feature 02) — a logout client component will need to call `resetPostHog()` before/after submitting that form.
- **`posthog` singleton import source:** All files that use `posthog` import it from `@/lib/posthog-client`, never directly from `posthog-js`. This keeps the module as the single source of truth for the PostHog instance.
- **Server client is always a fresh factory:** `createPostHogServer()` returns a new `PostHog` instance each call. Callers must always call `await posthog.shutdown()` after use — events are lost without it.

## Problems solved

- **Review caught unhandled promise rejection:** `getCurrentUser()` in `providers.tsx` had no `.catch()`. Fixed — failures are logged with `[PostHogProvider]` prefix and silently swallowed (identify is non-critical).
- **`posthog.reset()` was missing and untracked:** Not implementable reactively (no `onAuthStateChange`). Added `resetPostHog()` export and a note in `progress-tracker.md` so the next session that builds logout knows exactly where to call it.

## Current state

- Feature 01 Homepage: ✅ complete
- Feature 02 Auth: ✅ complete (OAuth round-trip unverified until Feature 14 dashboard exists)
- Feature 03 PostHog Initialization: ✅ complete
- `posthog.identify()` wired — fires on mount if user session exists
- `posthog.reset()` ready but deferred — no logout UI exists yet
- `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` must be in `.env.local` for PostHog to actually send events — **not yet confirmed by user**
- Features 04–17: pending

## Next session starts with

**Feature 04 — Database Schema.**

Per `context/build-plan.md`:
1. Create `profiles`, `agent_runs`, `jobs`, `agent_logs` tables in InsForge (use `run-raw-sql` MCP tool)
2. Create `resumes` storage bucket with authenticated-only access (use `create-bucket` MCP tool)
3. Add RLS policies on all four tables — always scoped to `user_id`
4. Verify schema with `get-table-schema` MCP tool after creation
5. Reference `context/architecture.md` for the exact column definitions — do not deviate

No UI is built in this feature. It is pure infrastructure.

## Open questions

- **PostHog env vars** — `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` must be in `.env.local`. Confirm with user before relying on PostHog events in any feature.
- **Full OAuth round-trip** — still unverified end-to-end; needs `/dashboard` page (Feature 14) to confirm session is established after login.
- **Production `allowedRedirectUrls`** — InsForge dashboard needs the deployed domain added when the app ships.
- **`posthog.reset()` on logout** — call `resetPostHog()` from `@/lib/posthog-client` alongside `insforge.auth.signOut()` when logout UI is built.
