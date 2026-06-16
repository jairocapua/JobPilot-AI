# Memory — Feature 07 AI Profile Extraction from Resume (complete)

Last updated: 2026-06-17

## What was built

**Feature 07 — AI Profile Extraction (complete, all post-review fixes applied):**

- `agent/extract-resume.ts` — `extractProfileFromPdf(buffer)` using pdf-parse v2 (`PDFParse` class) + GPT-4o. Returns `{ success: boolean; data?: Partial<ProfileData>; error?: string }` — never throws. Image-PDF case (text < 50 chars) returns `success: false` with user-friendly message. Unexpected errors logged with `[agent/extract-resume]` prefix, generic message returned.
- `app/api/resume/extract/route.ts` — POST handler at the architecture-correct path. Receives `{ resumeKey: string }`, downloads from private `resumes` bucket via `createInsforgeServer()`, calls agent, returns `{ success, data? }` or `{ success: false, error }`. All responses include `success: boolean`.
- `components/profile/ProfileBody.tsx` — client wrapper owning `profileData` state + `formKey`. `handleExtract` sparse-merges extracted fields and increments `formKey` to remount `ProfileForm`.
- `components/profile/ResumeUpload.tsx` — Extract Profile button in uploaded-file row; `extracting` boolean state; fetch to `/api/resume/extract`; checks `!json.success`.
- `next.config.ts` — `serverExternalPackages: ["pdf-parse", "pdfjs-dist"]` added to prevent webpack bundling pdfjs-dist (worker chunk path breaks at runtime without this).

**Post-review filename persistence fix:**

- `migrations/20260617120000_add-resume-pdf-name.sql` — `resume_pdf_name TEXT` column added to `profiles`; applied to live DB via `run-raw-sql` MCP tool.
- `types/index.ts` — `resumePdfName: string | null` added to `ProfileData`.
- `lib/profile.ts` — `resume_pdf_name: string | null` added to `ProfileRow`; mapped in `rowToProfileData`.
- `actions/profile.ts` — `saveResumeUrl(url, key, name)` now saves `resume_pdf_name`. Third param is required.
- `components/profile/ResumeUpload.tsx` — `resumePdfName` prop; `fileName` state initialises from it (fallback: `"resume.pdf"` for rows predating the column); passes `file.name` to `saveResumeUrl`.
- `components/profile/ProfileBody.tsx` — passes `resumePdfName={profileData.resumePdfName}` to `ResumeUpload`.

**Context files updated:**
- `context/progress-tracker.md` — Feature 07 complete; all decisions and fixes logged
- `context/ui-registry.md` — `ProfileBody` entry added; `ResumeUpload` updated with Extract Profile button + `extracting` state
- `context/library-docs.md` — pdf-parse section updated to v2 API

---

## Decisions made

- **pdf-parse / pdfjs-dist must be in `serverExternalPackages`:** webpack bundles pdfjs-dist and generates a chunk for the worker, but the chunk path can't be resolved at runtime — "Setting up fake worker failed." Adding both to `serverExternalPackages` in `next.config.ts` keeps them out of the webpack graph; Node.js requires them natively and pdfjs-dist finds its own worker.
- **pdf-parse v2 API:** installed version is v2.4.5. Named class import only: `import { PDFParse } from "pdf-parse"`. Constructor: `new PDFParse({ data: new Uint8Array(buffer) })`. Call `.getText()` → `.text`, then `.destroy()` in a `finally` block. The v1 default function does not exist in this version.
- **Agent function pattern — return, never throw:** `extractProfileFromPdf` wraps all logic in try/catch. User-facing errors (image PDF) return `{ success: false, error: "<human message>" }`. Unexpected errors log with `[agent/extract-resume]` prefix and return a generic message — raw errors never reach the client.
- **Route path:** `app/api/resume/extract/route.ts` — matches `architecture.md`. Old path `app/api/extract-resume/` was wrong and has been deleted.
- **State bridge:** `ProfileBody` (client wrapper) owns `profileData` + `formKey`. Extraction merges into `profileData` and increments `formKey` to remount `ProfileForm` with fresh `initialData`. `ResumeUpload` manages its own upload/key state independently.
- **Resume filename stored in DB:** `resume_pdf_name TEXT` on `profiles`. `saveResumeUrl(url, key, name)` saves all three. `ResumeUpload` reads it back via `resumePdfName` prop on return visits. Falls back to `"resume.pdf"` for rows that predate the column.
- **Fields not extracted (by design):** `remotePreference`, `salaryExpectation`, `jobTitlesSeeking`, `workAuthorization`, `preferredLocations` — future intent, not past history. GPT-4o cannot reliably infer them from a resume.
- **`saveResumeUrl` signature change:** now `(url: string, key: string, name: string)` — all three required. Any future call site must pass the filename.

---

## Problems solved

- **"Setting up fake worker failed"** — pdfjs-dist webpack bundling. Fix: `serverExternalPackages: ["pdf-parse", "pdfjs-dist"]` in `next.config.ts`.
- **Filename shows as "resume.pdf" on return visits** — actual filename not stored in DB. Fix: `resume_pdf_name` column + threaded through types/lib/actions/components.
- **Route at wrong path** — was `app/api/extract-resume/`, should be `app/api/resume/extract/`. Deleted old, created new.
- **Agent threw instead of returning** — changed to `{ success, data?, error? }` pattern so the route can forward user-friendly messages without exposing raw errors.

---

## Current state

- Features 01–07: ✅ complete including all post-review and post-ship fixes
- `tsc --noEmit`: passes
- `serverExternalPackages` fix confirmed — worker error gone
- Resume filename now persists correctly across sessions
- **Full extraction round-trip (OAuth → upload → GPT-4o → form repopulate) verified live in browser — worker fix confirmed working**
- `posthog.reset()` on logout: deferred — `resetPostHog()` exported from `@/lib/posthog-client`, call it with `insforge.auth.signOut()` when logout UI is built
- End-to-end save/upload for Features 05–06 still unverified headlessly — verify once OAuth `allowedRedirectUrls` is configured in InsForge dashboard

---

## Next session starts with

**Feature 08 — Resume PDF Generation from Profile**

Per `context/build-plan.md` and `context/library-docs.md`:
1. Run `/architect 08 Resume PDF Generation from Profile` before writing any code
2. Library: `@react-pdf/renderer` — check `context/library-docs.md` "react-pdf" section for rules before implementing (server-side only, `renderToBuffer`, supported CSS properties)
3. Route goes at `app/api/resume/generate/route.ts` (per `architecture.md`)
4. Generated PDF uploaded to InsForge `resumes` bucket — same remove-then-upload pattern as Feature 06 (store returned `url` + `key` + filename)
5. The "Generate Resume from Profile" button in `ResumeUpload` is already in the UI (currently inert) — wire it up
6. `saveResumeUrl(url, key, name)` already handles persisting the result

---

## Open questions

- **OAuth allowedRedirectUrls:** add `<origin>/api/auth/callback` to InsForge dashboard to enable full OAuth round-trip. Until then, login is blocked.
- **`posthog.reset()` on logout** — call `resetPostHog()` from `@/lib/posthog-client` alongside `insforge.auth.signOut()` when logout UI is built.
- **Feature 08 design question:** should PDF generation be triggered from the same `ResumeUpload` card (replacing the current resume) or from a separate UI surface? Decide with `/architect` before implementing.
