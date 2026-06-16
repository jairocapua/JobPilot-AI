# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 2 — Profile Page
**Last completed:** 08 Resume PDF Generation from Profile
**Next:** 09 Find Jobs Page — Full UI

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

- **08 Resume PDF Generation — @react-pdf/renderer in serverExternalPackages:** same pattern as pdf-parse/pdfjs-dist. Added `"@react-pdf/renderer"` to the array in `next.config.ts` — its yoga-layout and fontkit internals fail when webpack bundles them.
- **08 — agent file is .tsx:** `agent/generate-resume.tsx` uses JSX (`<Document>`, `<Page>`) so extension must be `.tsx`, not `.ts`.
- **08 — GPT-4o with JSON fallback:** `generateAiContent()` calls GPT-4o with `response_format: { type: "json_object" }` to produce a professional summary and `workBullets` keyed by string index (`"0"`, `"1"`, …). If the call or JSON parse fails, the PDF still renders using raw `responsibilities` text from the profile — the AI step degrades gracefully.
- **08 — Buffer→Uint8Array for Blob:** `renderToBuffer` returns an `ArrayBufferLike`; wrapping as `new Uint8Array(buffer)` is required before `new Blob([...])` to satisfy TypeScript's `BlobPart` constraint.
- **08 — DB update inline in route:** `saveResumeUrl` Server Action is not called from the API route (wrong layer). The route directly upserts `{ resume_pdf_url, resume_pdf_key, resume_pdf_name }` using `createInsforgeServer()`.
- **08 — no new migration needed:** all three resume columns (`resume_pdf_url`, `resume_pdf_key`, `resume_pdf_name`) already exist from Features 06–07.
- **08 — verification status:** `tsc --noEmit` passes. End-to-end (click Generate → GPT-4o → PDF → storage → file chip update) requires OAuth to be configured in InsForge dashboard.

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

- **03 PostHog — posthog.reset() deferred:** `posthog.reset()` must be called alongside `insforge.auth.signOut()` when the logout button is built. `resetPostHog()` is already exported from `@/lib/posthog-client` — import and call it there. InsForge `Auth` has no `onAuthStateChange`, so reset cannot be wired reactively.
