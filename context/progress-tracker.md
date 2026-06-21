# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 5 — Dashboard
**Last completed:** Global Button Cursor
**Next:** 15 Stats Bar — Real Data

---

## Progress

### Phase 1 — Foundation

- [x] 01 Homepage
- [x] 02 Auth
- [x] 03 PostHog Initialization
- [x] 04 Database Schema

### Phase 2 — Profile Page

- [x] 05 Profile Page — Full UI
- [x] 06 Profile Save Logic
- [x] 07 AI Profile Extraction from Resume
- [x] 08 Resume PDF Generation from Profile

### Phase 3 — Find Jobs Page

- [x] 09 Find Jobs Page — Full UI
- [x] 10 Adzuna Job Discovery
- [x] 11 Filter + Sort + Pagination

### Phase 4 — Job Details Page

- [x] 12 Job Details Page — Full UI
- [x] 13 Company Research Agent

### Phase 5 — Dashboard

- [x] 14 Dashboard Page — Full UI
- [ ] 15 Stats Bar — Real Data
- [ ] 16 Recent Activity — Real Data
- [ ] 17 Analytics Charts — PostHog Data

### Cross-cutting Auth Polish

- [x] Logout Button

### Cross-cutting UI Polish

- [x] Global Button Cursor

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
- **02 Auth — OAuth button navigation:** Login provider controls use native
  `GET` forms, not `next/link`. `/api/auth/oauth/[provider]` is a redirecting
  route handler, not an App Router page; using `Link` makes Next attempt an RSC
  payload fetch before falling back to browser navigation.

- **05 Profile Page — Navbar split:** Navbar updated to accept `showCta?: boolean`. App pages pass `showCta={false}` to hide the "Start for free" CTA. A `NavLinks` client component (uses `usePathname`) handles active link coloring.
- **05 Profile Page — ProfileForm props pattern:** `ProfileForm` takes `initialData: ProfileData` and manages all form state internally. Feature 06 only needs to (a) fetch real data in the page and pass it as `initialData`, and (b) wire the Save button to a server action.
- **05 Profile Page — types/index.ts:** Created with `ProfileData`, `WorkExperience`, `ProfileEducation` — aligned with the DB schema in `architecture.md`.

- **06 Profile Save Logic — SDK has no `upsert`:** the installed `@insforge/sdk` storage `upload(path, file)` has no options param and auto-renames on key collision (build plan's "upsert: true / deterministic path" is not supported). To keep one resume per user we store the returned `key` and `remove(oldKey)` before each new `upload`. Added `resume_pdf_key TEXT` to `profiles` (`migrations/20260616120000_add-resume-pdf-key.sql`, applied via `run-raw-sql` since the CLI isn't installed locally).
- **06 — resume upload is client-side:** Next 16 Server Actions cap the request body at 1MB (default), but resumes are up to 5MB. So `ResumeUpload` uploads via the browser InsForge client on file-select, then a `saveResumeUrl(url, key)` server action persists the URL+key. The form fields save through a separate `saveProfile(form)` action — two independent write paths in `actions/profile.ts`.
- **06 — completion is derived, not stored:** only `is_complete` persists. `lib/profile.ts` `computeCompletion()` (pure, over the "Core 10" required fields) feeds both the page's `CompletionIndicator` and the `is_complete` value written on save. No completion columns. Core 10 = full_name, phone, location, current_title, experience_level, skills(≥1), work_experience(≥1 role w/ company+title), education(degree+institution), work_authorization, remote_preference.
- **06 — type↔DB mapping in `lib/profile.ts`:** `rowToProfileData`/`profileDataToRow` handle snake_case↔camelCase, comma-string↔`text[]` (`jobTitlesSeeking`, `preferredLocations`), `years_experience` int↔string, and jsonb (`work_experience`, `education`). `email` is read-only (never written from the form).
- **06 — Save wiring:** `ProfileForm` uses `useActionState(saveProfile)` called imperatively, wrapped in `startTransition(() => saveAction(form))` — React 19 requires the dispatch from `useActionState` to run inside a transition when called outside a native `<form action>`; omitting `startTransition` causes a runtime error and `isPending` breaks. NOT a native `<form action>` — controlled state holds arrays/objects that FormData would drop.
- **06 — ResumePreview not built:** architecture.md lists `components/profile/ResumePreview.tsx`, but the uploaded-resume state is rendered inline in `ResumeUpload` instead. No separate component created.
- **06 — CompletionIndicator complete state:** at 100% the component switches to a green ring, green checkmark icon, and "Profile complete" heading. The "needs attention" copy and missing-field tags are hidden. Below 100% is unchanged.
- **06 — Post-review fixes applied:** (a) try/catch added to both server actions with `[actions/profile]` console prefix; (b) `profile_completed` PostHog event fires on first completion (reads prior `is_complete`, fires only on false→true transition); (c) file input value cleared after each selection so the same file can be re-uploaded; (d) `dirtyAfterSave` state clears the "Profile saved." message when any field is edited after a save; (e) type assertion on `row` in `app/profile/page.tsx` commented to explain SDK returns `any`; (f) `console.error` added to `ResumeUpload` catch block.

- **07 AI Profile Extraction — pdf-parse v2 API:** installed version is v2.4.5, which exports a `PDFParse` class (not a v1-style default function). Usage: `new PDFParse({ data: new Uint8Array(buffer) })`, then `.getText()` → `TextResult.text`, then `.destroy()` in a finally block. Named import only: `import { PDFParse } from "pdf-parse"`.
- **07 — state bridge pattern:** `ProfileBody` client wrapper holds `profileData` state + `formKey` int. `handleExtract` does a sparse merge (`{ ...prev, ...extracted }`) then increments `formKey` — `ProfileForm` remounts with new `initialData` via React `key` prop. `ResumeUpload` manages its own storage state independently (no key threading needed through ProfileBody).
- **07 — server-side PDF download:** API route at `POST /api/resume/extract` receives `{ resumeKey: string }`, downloads the file from InsForge `resumes` bucket using `createInsforgeServer()` (cookie auth), buffers the blob, calls `extractProfileFromPdf(buffer)`, returns `{ success: true, data: Partial<ProfileData> }`. Not edge runtime — must stay Node.js for PDFParse.
- **07 — post-review fixes applied:** (a) route moved from `app/api/extract-resume/` → `app/api/resume/extract/` to match `architecture.md`; (b) all route responses now include `success: boolean`; (c) `extractProfileFromPdf` returns `{ success, data?, error? }` instead of throwing — image-PDF case returns `success: false` with a user-friendly message, unexpected errors log with `[agent/extract-resume]` prefix and return a generic message; (d) `ResumeUpload` fetch URL updated to `/api/resume/extract`, checks `!json.success` instead of `json.error`.
- **07 — fields not extracted (by design):** job preference fields (`remotePreference`, `salaryExpectation`, `jobTitlesSeeking`, `workAuthorization`, `preferredLocations`) are intentionally excluded — they reflect future intent, not past history, so GPT-4o cannot reliably infer them from a resume.
- **07 — pdfjs-dist webpack bundling:** pdf-parse uses pdfjs-dist internally. When Next.js webpack bundles pdfjs-dist, it creates chunks but the worker file (`pdf.worker.mjs`) can't be resolved at runtime — "Setting up fake worker failed". Fix: `serverExternalPackages: ["pdf-parse", "pdfjs-dist"]` in `next.config.ts` tells webpack to skip these packages entirely; Node.js requires them natively at runtime and pdfjs-dist finds its own worker without issue.
- **07 — resume_pdf_name column:** Added `resume_pdf_name TEXT` to `profiles` (`migrations/20260617120000_add-resume-pdf-name.sql`, applied via `run-raw-sql`). `saveResumeUrl` now takes a third `name: string` param and writes `resume_pdf_name`. `ResumeUpload` passes `file.name` on upload and reads it back via a `resumePdfName` prop (from `ProfileData → ProfileBody → ResumeUpload`) on return visits. Falls back to `"resume.pdf"` for rows predating the column.
- **07 — verification status:** `tsc --noEmit` passes; `serverExternalPackages` config confirmed to eliminate the worker error in the browser. Resume filename persistence verified. Full end-to-end extraction round-trip (GPT-4o → form repopulate) verified live. OAuth round-trip still pending InsForge dashboard config.

- **09 Find Jobs — match score color thresholds (design overrides context files):** Design shows ≥90% green, 80–89% blue, <80% orange. This contradicts ui-rules.md (80–100% green, 60–79% blue) and ui-tokens.md (70–89% green). Design is the source of truth for visual decisions — thresholds implemented as: `score >= 90 → bg-success/text-success`, `score >= 80 → bg-info/text-info-medium`, `else → bg-warning/text-warning`. ui-rules.md and ui-tokens.md are stale for this section; Feature 12 MatchScore component must use these same thresholds.
- **09 Find Jobs — SOURCE column omitted (design takes precedence):** build-plan.md lists a SOURCE (badge) column; the design shows only 5 columns (COMPANY, ROLE, MATCH SCORE, SALARY EST., DATE FOUND). "Exactly as shown" requirement overrides the spec. Feature 10 can add SOURCE if needed when real data is wired.
- **09 Find Jobs — pagination mock matches design, not build-plan per-page rule:** Design shows "1 to 6 of 24 results" / 8 pages. Build-plan says 20 per page. Mock hardcodes design values; Feature 11 wires real pagination with 20 per page.
- **09 Find Jobs — visual verification blocked pending OAuth:** `/find-jobs` is proxy-protected. Full visual verification requires OAuth `allowedRedirectUrls` to be configured in InsForge dashboard (see Auth manual step in Notes section).
- **08 Resume PDF Generation — @react-pdf/renderer in serverExternalPackages:** same pattern as pdf-parse/pdfjs-dist. Added `"@react-pdf/renderer"` to the array in `next.config.ts` — its yoga-layout and fontkit internals fail when webpack bundles them.
- **08 — agent file is .tsx:** `agent/generate-resume.tsx` uses JSX (`<Document>`, `<Page>`) so extension must be `.tsx`, not `.ts`.
- **08 — GPT-4o with JSON fallback:** `generateAiContent()` calls GPT-4o with `response_format: { type: "json_object" }` to produce a professional summary and `workBullets` keyed by string index (`"0"`, `"1"`, …). If the call or JSON parse fails, the PDF still renders using raw `responsibilities` text from the profile — the AI step degrades gracefully.
- **08 — Buffer→Uint8Array for Blob:** `renderToBuffer` returns an `ArrayBufferLike`; wrapping as `new Uint8Array(buffer)` is required before `new Blob([...])` to satisfy TypeScript's `BlobPart` constraint.
- **08 — DB update inline in route:** `saveResumeUrl` Server Action is not called from the API route (wrong layer). The route directly upserts `{ resume_pdf_url, resume_pdf_key, resume_pdf_name }` using `createInsforgeServer()`.
- **08 — no new migration needed:** all three resume columns (`resume_pdf_url`, `resume_pdf_key`, `resume_pdf_name`) already exist from Features 06–07.
- **08 — verification status:** `tsc --noEmit` passes. End-to-end (click Generate → GPT-4o → PDF → storage → file chip update) requires OAuth to be configured in InsForge dashboard.

- **10 Adzuna Job Discovery — route path:** `app/api/agent/find/route.ts` → `POST /api/agent/find`. Follows build-plan.md exactly (not the `app/api/jobs/search/` path that would have matched resume route conventions).
- **10 — InsForge client passed into agent:** `findJobsAgent()` in `agent/find-jobs.ts` receives the `InsForgeClient` instance from the route — agents do not call `createInsforgeServer()` themselves (no cookie access in arbitrary functions called from route handlers). Route creates the client once and passes it down.
- **10 — Only save jobs at or above MATCH_THRESHOLD:** Adzuna returns up to 10 results; GPT-4o scores all 10; only those with `matchScore >= MATCH_THRESHOLD` (70) are inserted into the `jobs` table. The API response returns both `jobsFound` (total Adzuna results) and `savedCount` (strong matches saved).
- **10 — No migration needed:** all required columns (`match_score`, `match_reason`, `matched_skills`, `missing_skills`, `run_id`, `source`, `external_apply_url`, etc.) exist in the initial schema from Feature 04.
- **10 — Country detection from location string:** `lib/adzuna.ts` `detectCountry()` does keyword matching on the location string — "uk"/"london"/"manchester" → "gb", "australia"/"sydney" → "au", "canada"/"toronto" → "ca", default → "us". Feature 11 can surface an explicit country selector if needed.
- **10 — Per-job `job_found` PostHog events:** The route fires one `job_found` event per saved job (using a single PostHog client instance with multiple `capture()` calls before `shutdown()`), each with `{ userId, source: "search", matchScore }`. This preserves per-job score granularity for Feature 17's Match Score Distribution chart.
- **10 — `formatRelativeTime()` in `lib/utils.ts`:** Added alongside `MATCH_THRESHOLD`. Converts `TIMESTAMPTZ` from DB to human strings: "Just now", "X hours ago", "Yesterday", "X days ago", "Jun 12".
- **10 — `router.refresh()` for job list update:** `SearchControls` (client component) calls `router.refresh()` after a successful search — this triggers Next.js to re-run the `FindJobsPage` server component and re-fetch jobs from DB, updating the table without a full page reload.
- **10 — Feature 11 pagination deferred:** `JobsPagination` now receives real counts (`from=1`, `to=jobs.length`, `total=jobs.length`, `pageCount=1`) but no actual pagination logic. Feature 11 wires 20-per-page with URL search params.

- **12 Job Details Page — route and data:** `app/find-jobs/[id]/page.tsx` — server component, `params` is a Promise (Next.js 15/16), awaited before use. Queries `jobs` table for the single row matching `id + user_id + status=active`; calls `notFound()` if missing. Maps DB snake_case to `JobDetail` camelCase type. Content width `max-w-[760px]` to match design.
- **12 — job description field:** `about_role` stores the raw Adzuna description string (confirmed from `agent/adzuna.ts`). NOT `responsibilities[]` — that array is never populated by the Adzuna agent.
- **12 — apply URL field:** `external_apply_url` (= Adzuna `redirect_url`). Both `source_url` and `external_apply_url` are saved with the same value; `external_apply_url` used for View Job Post and Apply Now links.
- **12 — match badge color (header badge):** Design shows 85% as green. Header badge uses 2-level rule: ≥80 = `bg-success-lightest text-success-foreground` (green), <80 = `bg-warning/10 text-warning` (orange). Different from the table bar which uses a 3-level system (≥90/≥80/else). Design is source of truth.
- **12 — missing skills badge color:** Design shows warning/orange for missing skills. Uses `bg-warning/10 text-warning` (Tailwind opacity modifier for a soft orange). `bg-accent-muted text-accent` (from ui-tokens.md) is overridden by design.
- **12 — CompanyResearch wired for Feature 13:** The Research Company button calls `POST /api/agent/research` with `{ jobId }` and calls `router.refresh()` on success. Feature 13 only needs to implement the API route — the client is already wired. Error state shown below empty state if API call fails.
- **12 — verification status:** `tsc --noEmit` passes. Full end-to-end requires OAuth configured in InsForge dashboard.

- **13 Company Research Agent — dependencies:** Added direct dependencies `@browserbasehq/sdk`, `@browserbasehq/stagehand`, and `zod` for the planned Browserbase + Stagehand + schema extraction flow.
- **13 — route and ownership:** `app/api/agent/research/route.ts` implements `POST /api/agent/research`. It validates `jobId`, uses `getCurrentUser()`, loads only the current user's active job, loads the profile, calls the research agent, saves a success-wrapped response, fires `company_researched`, and revalidates the literal job details path.
- **13 — agent logging:** Research logs use the job's existing `run_id`. If a job has no `run_id`, the route creates a minimal fallback `agent_runs` row so `agent_logs.run_id` stays valid, then marks that fallback run completed or failed.
- **13 — Browserbase/Stagehand helpers:** Added `lib/browserbase.ts` and `lib/stagehand.ts`. Company research uses one Browserbase session with `timeout: 120`, initializes Stagehand with `env: "BROWSERBASE"`, `modelName: "gpt-4o"`, `OPENAI_API_KEY`, and `disablePino`, and always closes Stagehand in `finally`.
- **13 — research flow:** `agent/research.ts` follows `external_apply_url`/`source_url` with server-side `fetch(..., { redirect: "follow", cache: "no-store" })`, derives the root employer homepage, falls back to `https://www.{company}.com`, extracts the homepage plus max 3 prioritized internal pages, and then synthesizes the dossier with GPT-4o.
- **13 — fallback guarantee:** Browser failures, thin homepage extraction, and invalid OpenAI JSON all degrade to a complete deterministic dossier from job/profile data. The agent still saves `jobs.company_research` unless the DB update itself fails.
- **13 — CompanyResearch rendering:** `components/job-details/CompanyResearch.tsx` now renders all 9 dossier fields: overview, tech stack, culture, why this role, your edge, gaps to address, smart questions, interview prep, and sources.
- **13 — CompanyResearch loading state:** Clicking Research Company now swaps the empty state for a multi-step loading card while `/api/agent/research` is in flight. The stepper advances locally every 6.5s through the actual workflow shape: resolve company site, read public pages, connect findings to the profile, and build the dossier. No API or agent changes.
- **13 — CompanyResearch UI refresh:** Completed dossiers now render as a candidate briefing with summary count pills, icon-led sections, row-based list markers, emphasized Your Edge / Interview Prep checklists, numbered Smart Questions, an accent left-rule for Why This Role, and compact bordered source rows. This is UI-only; dossier data shape and research API are unchanged.
- **13 — lint compatibility fixes:** `components/find-jobs/JobFilters.tsx` updates debounce refs in `useEffect` instead of during render to satisfy React 19 lint rules. Login OAuth controls intentionally stay native `GET` forms, because the OAuth start endpoints are redirecting route handlers.
- **13 — verification status:** `npx tsc --noEmit`, `npm run lint`, and `npm run build` pass. Full live click-through still requires a signed-in browser session plus `BROWSERBASE_API_KEY`, `BROWSERBASE_PROJECT_ID`, `OPENAI_API_KEY`, and PostHog env vars.
- **13 — post-review fixes applied:** (a) company homepage resolution follows redirects manually with a timeout and public-host validation to avoid unsafe server-side fetches; (b) known ATS/job-board domains fall back to the company-name homepage instead of researching the platform; (c) malformed non-UUID `jobId` values now return 400; (d) dossier bullet-list sections now render visible markers.
- **13 — Browserbase metadata fix:** Browserbase rejects some `userMetadata` values with spaces/special characters (for example company names like "nTech Solutions"). `lib/browserbase.ts` now slug-sanitizes metadata values before session creation so website browsing can start instead of falling back immediately.

- **14 Dashboard Page — route and UI:** Added `app/dashboard/page.tsx`, protected with the same server-side `getCurrentUser()` check as other app pages, and renders the full dashboard using mock data only. New components: `components/dashboard/StatsBar.tsx`, `RecentActivity.tsx`, and `AnalyticsCharts.tsx`.
- **14 — design source of truth:** `context/designs/dashboard.png` overrides the older dashboard stat label in build-plan.md. The fourth stat is "Jobs This Week" (not "Cover Letters Generated"), matching the screenshot and project overview.
- **14 — navbar visual update:** Shared `Navbar`/`NavLinks` now match the dashboard design reference: right-aligned app nav, lucide icons beside labels, active accent underline, and only the three project nav items. The older color-only active nav registry entry was updated.
- **14 — charts are mock SVG/CSS:** Company Research Activity, Jobs Found Over Time, and Match Score Distribution are rendered with tokenized SVG primitives and mock arrays. No chart dependency was added; Feature 17 can replace the mock data/rendering with PostHog data.
- **14 — incomplete profile banner:** The reference dashboard screenshot shows no incomplete-profile banner, so Feature 14 renders the completed-profile state only. Feature 15/real dashboard wiring can add the conditional banner when profile data is pulled in.
- **14 — verification status:** `npx tsc --noEmit` and `npm run lint` pass. Visual browser verification of `/dashboard` still requires a signed-in session because the route is proxy-protected.
- **14 — post-review fix applied:** Added explicit `ReactElement`/`Promise<ReactElement>` return types to all new dashboard components and the shared navbar functions touched by Feature 14.

- **Logout Button — placement:** Added `components/layout/LogoutButton.tsx` as a secondary account action rendered at the far right of the shared `Navbar` on authenticated app pages via `showLogout`. It is intentionally outside `NavLinks` so the primary navigation remains exactly Dashboard / Find Jobs / Profile.
- **Logout Button — auth cleanup:** Clicking logout calls `insforge.auth.signOut()` to clear browser SDK state, then `POST /api/auth/logout` to expire the app-domain SSR cookies (`insforge_access_token` + `insforge_refresh_token`) with `clearAuthCookies()`, then calls `resetPostHog()` and redirects to `/login`.
- **Logout Button — route path:** `app/api/auth/logout/route.ts` returns the standard `{ success: boolean, error?: string }` shape and clears auth cookies in both success and error responses.
- **Logout Button — verification status:** `npx tsc --noEmit` and `npm run lint` pass. Live browser verification still requires a signed-in session.

- **Global Button Cursor — base CSS:** Added global cursor rules in `app/globals.css`: enabled native buttons and `role="button"` controls use `cursor: pointer`; disabled button-like controls use `cursor: not-allowed`. This avoids adding `cursor-pointer` to every individual button class.
- **Global Button Cursor — verification status:** `npx tsc --noEmit` and `npm run lint` pass.

- **11 Filter + Sort + Pagination — URL search params pattern:** All filter/sort/pagination state lives in URL params (`?q=&match=&sort=&page=`). `FindJobsPage` (server component) reads them as an async `searchParams` prop (Next.js 15/16 requirement) and builds the InsForge query accordingly. No client-side fetch, no new API route.
- **11 — InsForge query chain:** `select(..., { count: 'exact' })` returns both `data` and `count`. `.or('company.ilike.%q%,title.ilike.%q%')` handles text search. `.gte('match_score', MATCH_THRESHOLD)` / `.lt(...)` for match filter. `.order()` for sort. `.range(from, to)` for 20-per-page pagination (0-indexed inclusive).
- **11 — Suspense required for useSearchParams:** `JobFilters` and `JobsPagination` both use `useSearchParams()`. In Next.js App Router, client components using this hook must be wrapped in `<Suspense>` in the parent server component — added to `page.tsx`.
- **11 — Debounce pattern for text search:** `search` local state feeds a `useEffect` with a 500ms `setTimeout`. The timeout closure uses `useRef` copies of `router`, `pathname`, `searchParams` (updated each render before the effect) to avoid stale closures without adding them to the effect's dependency array. Dropdowns use synchronous `router.push()` in their `onChange` handlers.
- **11 — Page window algorithm:** `JobsPagination` shows all pages if ≤7; otherwise shows first+last with current±1 and `…` gaps. Previous/Next are disabled at bounds.
- **11 — MATCH_THRESHOLD reused:** High/Low match filter uses the same `MATCH_THRESHOLD = 70` constant from `lib/utils.ts` — not hardcoded.
- **11 — post-review fixes applied:** (a) `parseInt` NaN guard added — `Number.isNaN(pageNum) ? 1 : Math.max(1, pageNum)` prevents NaN propagating through range/display calculations when `page` param is non-numeric; (b) `q` sanitized before `.or()` — `q.replace(/[,()%]/g, "").trim()` strips PostgREST-syntax characters (comma would break the OR-condition parser) and prevents wildcard injection via `%`; (c) `error` destructured from query result and logged with `[find-jobs/page]` prefix — previously silently discarded.
- **11 — verification status:** `tsc --noEmit` passes. End-to-end (filter/sort/page URL updates → server re-fetch → updated table) requires OAuth configured in InsForge dashboard.

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
- **06 — verification status:** `next build` + `tsc` pass; a 0-row UPDATE confirmed every column name and cast against the live `profiles` schema. **Not** verified end-to-end (no headless auth session here): the SDK's JS-array→`text[]` / object→`jsonb` serialization on `.upsert()`, the actual save round-trip, and the client-side upload to the private `resumes` bucket are unexercised — verify these in the browser once OAuth is configured (see Auth manual step below).

- **03 PostHog — logout reset implemented:** `posthog.reset()` is called through `resetPostHog()` inside `components/layout/LogoutButton.tsx` after InsForge sign-out and SSR cookie clearing complete.
