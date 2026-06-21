# Memory — Feature 11 Filter + Sort + Pagination (complete)

Last updated: 2026-06-18

## What was built

**Feature 11 — Filter + Sort + Pagination (complete, all post-review fixes applied):**

- `app/find-jobs/page.tsx` — now accepts `searchParams` as async prop (Next.js 15/16 requirement). Reads `q`, `match`, `sort`, `page` from URL. Builds InsForge query with `.or()` for text search, `.gte`/`.lt` for match filter, `.order()` for sort, `.range()` + `{ count: 'exact' }` for 20-per-page pagination. `q` is sanitized (`replace(/[,()%]/g, "")`) before use in `.or()`. `error` from query destructured and logged. `NaN` guard on `page` param.
- `components/find-jobs/JobFilters.tsx` — rewritten from local state to URL search params. Text search debounced 500ms via `useEffect` + `useRef` pattern (refs keep `router`/`pathname`/`searchParams` current in timeout closure). Dropdowns push immediately. All changes delete `page` to reset to page 1. Wrapped in `<Suspense>` in page.tsx.
- `components/find-jobs/JobsPagination.tsx` — rewritten as real client component navigating via URL params. Smart page window (≤7 → show all; >7 → first+last+current±1 with `…` gaps). Previous/Next disabled at bounds. Wrapped in `<Suspense>` in page.tsx.
- `components/find-jobs/JobsTable.tsx` — empty state added (`colSpan={5}`, `py-12 text-center`, `text-sm text-text-muted`) for when filters return zero results.
- `context/progress-tracker.md` — Feature 11 marked complete with all decisions and post-review fixes logged.
- `context/ui-registry.md` — `JobFilters`, `JobsTable`, `JobsPagination` entries updated to reflect URL-driven behavior and empty state.

---

## Decisions made

- **URL search params pattern:** All filter/sort/pagination state lives in URL params (`?q=&match=&sort=&page=`). Server component reads them, no new API routes.
- **`searchParams` is async in Next.js 15/16:** Must `await searchParams` in the page component.
- **`<Suspense>` required for `useSearchParams` consumers:** `JobFilters` and `JobsPagination` both wrapped in `<Suspense fallback={null}>` in the page.
- **Debounce via `useRef` pattern:** Stable refs (`routerRef`, `pathnameRef`, `searchParamsRef`) updated every render before the `useEffect` — avoids stale closures without adding them to the effect deps array.
- **`q` sanitization:** `q.replace(/[,()%]/g, "").trim()` before inserting into `.or()` string — PostgREST parses commas as OR separators, so a user typing "react, node" would break the filter without this.
- **`MATCH_THRESHOLD = 70` reused:** High/Low match filter uses the same constant from `lib/utils.ts`.
- **PAGE_SIZE = 20:** Defined as a constant in `page.tsx`.
- **Match score color thresholds (locked from Feature 09):** ≥90% green (`bg-success`/`text-success`), ≥80% blue (`bg-info`/`text-info-medium`), else orange (`bg-warning`/`text-warning`). Feature 12 `MatchScore` component must use these same thresholds.

---

## Problems solved

- **`Math.max(1, NaN) = NaN` bug:** `parseInt("abc") = NaN`, and `Math.max(1, NaN)` is `NaN` in JavaScript (not 1). Fixed with `Number.isNaN` guard before `Math.max`.
- **Comma in search query breaks PostgREST `.or()` syntax:** The filter string `company.ilike.%react, node%,title.ilike.%react, node%` would have PostgREST treat `, node%` as a separate OR condition. Fixed by stripping `,()%` from `q` before use.
- **DB query error silently discarded:** `error` was not destructured; now logged with `[find-jobs/page]` prefix.

---

## Current state

- Features 01–11: ✅ complete including all post-review fixes
- `tsc --noEmit`: passes
- Phase 3 (Find Jobs Page) fully complete
- End-to-end verification still requires OAuth `allowedRedirectUrls` configured in InsForge dashboard and `.env.local` keys (`ADZUNA_APP_ID`, `ADZUNA_APP_KEY`, `OPENAI_API_KEY`, `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`)

---

## Next session starts with

**Feature 12 — Job Details Page — Full UI**

Per `context/build-plan.md`:
1. Run `/architect 12 Job Details Page — Full UI` before writing any code
2. Build complete UI with real DB data — job info, match score, matched/missing skills, job description, company research empty state
3. Route: `app/find-jobs/[id]/page.tsx` (already in `architecture.md`)
4. Components live in `components/job-details/`: `JobInfo`, `MatchScore`, `JobDescription`, `CompanyResearch`, `JobActions`
5. **MatchScore badge must use the Feature 09/11 thresholds:** ≥90% green, ≥80% blue, else orange — NOT the stale ui-rules.md/ui-tokens.md values
6. Company research section shows empty state with "Research Company" button (logic wired in Feature 13)

---

## Open questions

- **OAuth allowedRedirectUrls:** add `<origin>/api/auth/callback` to InsForge dashboard. Until then the full auth round-trip is unverified.
- **`posthog.reset()` on logout:** call `resetPostHog()` from `@/lib/posthog-client` alongside `insforge.auth.signOut()` when logout UI is built.
