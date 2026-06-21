# UI Registry

Living document. Updated after every component is built. Read this before building any new component — match existing patterns exactly before inventing new ones.

---

## How to Use

Before building any component:

1. Check if a similar component already exists here
2. If yes — match its exact classes
3. If no — build it following ui-rules.md and ui-tokens.md, then add it here

After building any component — update this file with the component name, file path, and exact classes used.

---

## Components

### Navbar
**File:** `components/layout/Navbar.tsx`
**Pattern:** Full-width white header, 64px tall, max-w-[1440px] inner container, px-6.
```
header: bg-surface border-b border-border
inner: max-w-[1440px] mx-auto h-16 flex items-center justify-between px-6
logo: Image h-7 w-auto
nav links: text-sm font-medium text-text-dark hover:text-accent transition-colors
cta button: bg-overlay-dark text-overlay-foreground text-sm font-medium px-4 py-2 rounded-lg
```

### Footer
**File:** `components/layout/Footer.tsx`
**Pattern:** Full-width white footer, 64px tall, logo left, nav links right.
```
footer: bg-surface border-t border-border
inner: max-w-[1440px] mx-auto h-16 flex items-center justify-between px-6
nav links: text-sm text-text-secondary hover:text-text-primary transition-colors
```

### Hero
**File:** `components/homepage/Hero.tsx`
**Pattern:** Full-width hero-gradient section, centered content, browser mockup at bottom.
```
section: hero-gradient pt-24 pb-0 px-8
h1: text-[56px] font-bold leading-tight text-text-primary tracking-tight
subtext: text-base text-text-secondary max-w-md mx-auto leading-relaxed
primary button: inline-flex items-center gap-2 bg-overlay-dark text-overlay-foreground text-sm font-medium px-5 py-2.5 rounded-lg
secondary button: inline-flex items-center bg-surface border border-border text-text-primary text-sm font-medium px-5 py-2.5 rounded-lg
browser chrome: bg-surface-secondary border-b border-border
```

### HowItWorks
**File:** `components/homepage/HowItWorks.tsx`
**Pattern:** White bg, 2-col grid, feature list with accent left border on left, screenshot on right.
```
section: bg-surface py-24 px-8
h2: text-[40px] font-bold text-text-primary leading-tight tracking-tight
feature item: flex gap-4 — accent bar (w-0.5 bg-accent rounded-full) + title (text-sm font-semibold text-text-primary) + desc (text-sm text-text-secondary)
image card: rounded-2xl overflow-hidden border border-border shadow-sm
```

### Features
**File:** `components/homepage/Features.tsx`
**Pattern:** Background bg, 2-col grid reversed (image left, text right), same feature item pattern.
```
section: bg-background py-24 px-8
image card: rounded-2xl overflow-hidden border border-border shadow-sm bg-surface-secondary
h2/feature items: same as HowItWorks
```

### Testimonial
**File:** `components/homepage/Testimonial.tsx`
**Pattern:** White bg, centered, eyebrow label in accent uppercase, large quote, avatar + name.
```
section: bg-surface py-24 px-8
eyebrow: text-xs font-semibold text-accent uppercase tracking-widest
quote: text-[28px] font-bold text-text-primary max-w-3xl mx-auto leading-snug
avatar: rounded-full, w-40 h-40
name: text-sm font-semibold text-text-primary
role: text-xs text-text-muted
```

### CTASection
**File:** `components/homepage/CTASection.tsx`
**Pattern:** cta-gradient bg, centered text, same button pair as Hero.
```
section: cta-gradient py-24 px-8
h2: text-[44px] font-bold text-text-primary leading-tight max-w-2xl tracking-tight
subtext: text-sm text-text-secondary max-w-sm leading-relaxed
buttons: same as Hero
```

### Login Page — Auth Card
**File:** `app/(auth)/login/page.tsx`
**Last updated:** 2026-06-14
**Pattern:** Full-height centered layout, single card, logo + heading + OAuth buttons. No Navbar or Footer.

| Property | Class |
| --- | --- |
| Page background | `bg-background` |
| Card background | `bg-surface` |
| Card border | `border border-border` |
| Card radius | `rounded-2xl` |
| Card padding | `p-8` |
| Card shadow | `shadow-sm` |
| Heading | `text-2xl font-bold text-text-primary tracking-tight` |
| Subtext | `text-sm text-text-secondary leading-relaxed` |
| Micro-copy / legal | `text-xs text-text-muted leading-relaxed` |
| Error banner bg | `bg-surface-secondary` |
| Error banner border | `border border-border rounded-md` |
| Error banner text | `text-sm text-error px-3 py-2` |
| Button gap | `flex flex-col gap-3` |

**Pattern notes:**
Auth card always uses `rounded-2xl` (not `rounded-lg`). Cards on inner app pages use `rounded-xl`. The distinction: auth/onboarding surfaces get the larger radius; data cards in the dashboard get `rounded-xl`.

### OAuth Button — Secondary (Google-style)
**File:** `app/(auth)/login/page.tsx`
**Element:** Native `GET` form submit button to `/api/auth/oauth/google` (not `next/link`; OAuth start routes redirect and must use browser navigation).

| Property | Class |
| --- | --- |
| Background | `bg-surface` |
| Border | `border border-border` |
| Text | `text-text-primary text-sm font-medium` |
| Radius | `rounded-lg` |
| Padding | `px-4 py-2.5` |
| Layout | `inline-flex w-full items-center justify-center gap-3` |
| Hover | `hover:bg-surface-secondary transition-colors` |

### OAuth Button — Primary dark (GitHub-style)
**File:** `app/(auth)/login/page.tsx`
**Element:** Native `GET` form submit button to `/api/auth/oauth/github` (not `next/link`; OAuth start routes redirect and must use browser navigation).

| Property | Class |
| --- | --- |
| Background | `bg-overlay-dark` |
| Text | `text-overlay-foreground text-sm font-medium` |
| Radius | `rounded-lg` |
| Padding | `px-4 py-2.5` |
| Layout | `inline-flex w-full items-center justify-center gap-3` |
| Hover | `hover:opacity-90 transition-opacity` |

**Pattern notes:**
Dark buttons always use `hover:opacity-90 transition-opacity` (not `hover:bg-*`). Light/surface buttons always use `hover:bg-surface-secondary transition-colors`. Never mix the two hover strategies on the same button.

### NavLinks (Active Nav)
**File:** `components/layout/NavLinks.tsx`
**Last updated:** 2026-06-22
**Pattern:** Client component (`"use client"`) using `usePathname` to detect the active route. Imported by `Navbar`. Updated to match the Feature 14 dashboard design: icon + label nav items with an accent underline on the active route.
```
nav: flex h-full items-center gap-7
link: relative flex h-16 items-center gap-2 text-sm font-medium transition-colors
icon: h-4 w-4
active link: text-accent + absolute bottom underline inset-x-0 h-0.5 rounded-full bg-accent
inactive link: text-text-dark hover:text-accent
```

### Navbar (App Pages)
**File:** `components/layout/Navbar.tsx` (updated)
**Last updated:** 2026-06-22
**Pattern:** Full-width white header using `NavLinks` for active state. Accepts `showCta?: boolean` (default true) and `showLogout?: boolean` (default false). Pass `showCta={false} showLogout` on authenticated app pages to hide the "Start for free" CTA and show the session action. App pages align the nav to the right, matching the dashboard design reference.
```
header: w-full bg-surface border-b border-border
inner: max-w-[1440px] mx-auto h-16 flex items-center justify-between px-6
logo: Image h-7 w-auto
right cluster: flex h-full items-center gap-8
cta button: bg-overlay-dark text-overlay-foreground text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity
```

### LogoutButton
**File:** `components/layout/LogoutButton.tsx`
**Last updated:** 2026-06-22
**Pattern:** Authenticated navbar account action. Secondary outlined button with LogOut icon, loading spinner during sign-out, and compact retry state if logout fails.

| Property | Class |
| --- | --- |
| Wrapper | `flex items-center gap-2` |
| Background | `bg-surface` |
| Border | `border border-border` |
| Text | `text-sm font-medium text-text-secondary` |
| Radius | `rounded-md` |
| Spacing | `px-3 py-2 gap-2` |
| Hover | `hover:bg-surface-secondary hover:text-text-primary transition-colors` |
| Disabled | `disabled:cursor-not-allowed disabled:opacity-60` |
| Error text | `text-xs text-error` |
| Icons | `h-4 w-4` |

**Pattern notes:**
Logout is not a primary nav item. Keep it outside `NavLinks`, at the far right of the authenticated navbar cluster. The button clears InsForge browser state, calls `/api/auth/logout` to expire SSR cookies, resets PostHog, and redirects to `/login`.

### Dashboard StatsBar
**File:** `components/dashboard/StatsBar.tsx`
**Last updated:** 2026-06-22
**Pattern:** Four equal stat cards with mock dashboard numbers and compact trend badges.
```
grid: grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4
card: min-h-32 rounded-xl border border-border bg-surface p-6 shadow-sm
label: text-sm font-semibold text-text-secondary
value: text-[30px] font-semibold leading-9 text-text-primary
trend badge: rounded-sm bg-success-lightest px-2 py-0.5 text-xs font-medium text-success-darker
helper text: text-xs text-text-muted
```

### Dashboard RecentActivity
**File:** `components/dashboard/RecentActivity.tsx`
**Last updated:** 2026-06-22
**Pattern:** White card with bordered header and vertical timeline list using tokenized colored dots.
```
card: rounded-xl border border-border bg-surface shadow-sm
header: border-b border-border px-6 py-6
title: text-base font-semibold text-text-primary
body: px-6 py-7
row: flex gap-5
activity text: text-sm font-semibold text-text-primary
timestamp: mt-1 text-xs text-text-muted
timeline line: mt-2 h-11 w-px bg-border
dot outer: h-4 w-4 rounded-full border-2 border-surface
dot variants: bg-accent-light/bg-accent, bg-info-light/bg-info, bg-success-light/bg-success-alt
```

### Dashboard AnalyticsCharts
**File:** `components/dashboard/AnalyticsCharts.tsx`
**Last updated:** 2026-06-22
**Pattern:** Mock SVG charts matching the dashboard design: top chart pairs with Recent Activity, lower row uses a wide line chart and compact distribution chart.
```
chart card: rounded-xl border border-border bg-surface p-6 shadow-sm
chart title: text-base font-semibold text-text-primary
top grid: grid gap-6 lg:grid-cols-2
bottom grid: grid gap-6 lg:grid-cols-[2fr_1fr]
axis labels: fill-text-muted text-xs
grid lines: stroke var(--color-border) with strokeDasharray 4 4
company research bars: fill var(--color-info)
jobs line: stroke var(--color-accent), strokeWidth 3, gradient fill from var(--color-accent)
distribution bars: fill var(--color-success)
```
**Pattern notes:**
Feature 14 uses lightweight SVG/CSS charts with mock data instead of adding a chart dependency. Feature 17 can preserve the chart card shells and replace only the data/rendering layer when PostHog analytics are wired.

### CompletionIndicator
**File:** `components/profile/CompletionIndicator.tsx`
**Pattern:** White card, `rounded-xl`. Two-column layout: left = icon + text + missing-field pills; right = SVG donut ring.
```
card: bg-surface border border-border rounded-xl p-6 shadow-sm
icon: SVG circle with fill error, white exclamation path
heading: text-sm font-semibold text-text-primary
body text: text-sm text-text-secondary leading-relaxed
missing field pills: text-xs font-semibold text-error bg-surface-secondary border border-border rounded px-2 py-0.5 uppercase tracking-wide
donut track: stroke var(--color-border), strokeWidth 8
donut fill: stroke var(--color-error), strokeWidth 8, strokeLinecap round, rotate(-90 50 50)
percent text: text-lg font-semibold text-text-primary (absolute centered)
```

### ResumeUpload
**File:** `components/profile/ResumeUpload.tsx`
**Pattern:** White card, `rounded-xl`. Upload zone with dashed border + cloud icon. Bottom row: text + purple Generate button. When a resume is uploaded, shows a file row with View, Extract Profile, and Replace buttons.
```
card: bg-surface border border-border rounded-xl p-6 shadow-sm
heading: text-base font-semibold text-text-primary
upload zone: border-2 border-dashed border-border rounded-lg p-8 flex-col items-center gap-2 hover:border-accent transition-colors
upload icon: CloudUpload h-8 w-8 text-text-muted
upload text: text-sm font-medium text-text-primary
file note: text-xs text-text-muted
select button: px-4 py-2 border border-border rounded-md text-sm font-medium text-text-primary hover:bg-surface-secondary transition-colors
generate button: flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground text-sm font-medium rounded-md hover:opacity-90 transition-opacity whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed
uploading state: Loader2 h-8 w-8 text-accent animate-spin + "Uploading…" (replaces cloud icon inside the same dashed zone)
uploaded state: border border-border rounded-lg p-4 row — FileText h-5 w-5 text-accent + filename (text-sm font-medium text-text-primary truncate) + "View resume" link (text-xs text-accent) + [Extract Profile button] + Replace button
extract button: flex items-center gap-2 px-4 py-2 border border-border rounded-md text-sm font-medium text-text-primary bg-surface hover:bg-surface-secondary transition-colors whitespace-nowrap disabled:opacity-50 — Sparkles h-4 w-4 icon; Loader2 h-4 w-4 animate-spin + "Extracting…" while in flight
error text: text-sm text-error
```
**State pattern:** dashed drop zone shows when no resume / while uploading; the bordered file row replaces it once a resume exists. Drag-and-drop and click both trigger the hidden `<input type="file" accept="application/pdf">`. Client-side validation: PDF mime + ≤5MB before upload. `extracting` boolean drives disabled state on the Extract Profile button while the `/api/resume/extract` POST is in flight; on success calls `onExtract?(data)` — parent (`ProfileBody`) merges extracted fields into shared state. `generating` boolean drives disabled state on the Generate button while the `/api/resume/generate` POST is in flight; on success updates local `url`, `key`, `fileName` state directly (no prop callback needed).
**Props:** `userId: string, resumePdfUrl: string | null, resumePdfKey: string | null, resumePdfName: string | null, onExtract?: (data: Partial<ProfileData>) => void`

### ProfileBody
**File:** `components/profile/ProfileBody.tsx`
**Pattern:** Client wrapper with no visual output of its own — owns shared state so `ResumeUpload` can push extracted data into `ProfileForm`. Renders both siblings.
**State pattern:** `profileData: ProfileData` holds the merged form state; `formKey: number` remounts `ProfileForm` on each extraction (so `initialData` refreshes). `handleExtract` does a sparse merge `{ ...prev, ...extracted }` then increments `formKey` — extracted fields always win, unextracted fields keep prior values.
**Props:** `initialData: ProfileData, userId: string, resumePdfKey: string | null`

### ProfileForm
**File:** `components/profile/ProfileForm.tsx`
**Pattern:** Client component. Single `rounded-xl` card containing all profile sections. Takes `initialData: ProfileData` prop and manages state internally.
```
card: bg-surface border border-border rounded-xl shadow-sm
card header: px-6 pt-6 pb-5 border-b border-border
card title: text-base font-semibold text-text-primary
card subtitle: text-sm text-text-secondary
section gap: gap-8 (between Personal/Professional/Work Exp/Education/Preferences)
section header: text-sm font-semibold text-text-secondary mb-4
field label: text-xs font-medium text-text-secondary uppercase tracking-wide mb-1
text input: px-3 py-2 border border-border rounded-md text-sm text-text-primary placeholder:text-text-muted focus:ring-1 focus:ring-accent focus:border-accent bg-surface
disabled input: opacity-60 cursor-not-allowed (email field)
select: same as input + appearance-none + ChevronDown icon wrapper
date input: same as input + pl-9 + Calendar icon left-3
skill/industry tag: bg-surface-secondary border border-border rounded-full px-3 py-1 text-xs text-text-primary
tag remove: X h-3 w-3 text-text-muted hover:text-text-primary
work exp entry: border border-border rounded-lg p-4
currently working checkbox: h-4 w-4 rounded border-2; checked: bg-info border-info; Check icon text-accent-foreground
save button: w-full py-3 bg-accent text-accent-foreground text-sm font-medium rounded-md hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed
save button (pending): label becomes "Saving…", disabled while the action runs
save feedback: text-sm text-center below the button — success: text-success ("Profile saved."), error: text-error
```
**Save pattern:** wired via `useActionState(saveProfile, …)` called imperatively — `onClick={() => saveAction(form)}` (not a native form submit, since controlled state holds arrays/objects that FormData can't carry). `isPending` drives the disabled + "Saving…" state.

### SearchControls
**File:** `components/find-jobs/SearchControls.tsx`
**Pattern:** White card, `rounded-xl`. Two flex inputs (JOB TITLE with search icon, LOCATION plain) + purple Find Jobs button, all aligned to `items-end`. Posts to `/api/agent/find` on click; shows loading spinner during search; shows success banner or error banner below. On success calls `router.refresh()` to re-fetch the server component's job list. Client component with `useRouter`.
**State:** `searching: boolean`, `result: { jobsFound, savedCount } | null`, `error: string | null`
```
card: bg-surface border border-border rounded-xl p-6 shadow-sm
label: text-xs font-medium text-text-secondary uppercase tracking-wide
text input: pl-9 pr-3 py-2 border border-border rounded-md text-sm text-text-primary placeholder:text-text-muted focus:ring-1 focus:ring-accent bg-surface outline-none
location input: px-3 py-2 (no left icon)
search icon in input: absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted
Find Jobs button: flex items-center gap-2 px-5 py-2 bg-accent text-accent-foreground text-sm font-medium rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed
loading icon: Loader2 h-4 w-4 animate-spin (replaces Search icon during search)
success banner: mt-4 px-4 py-2.5 bg-success-lightest rounded-lg flex items-center gap-2
banner icon: h-4 w-4 text-success flex-shrink-0
banner text: text-sm font-medium text-success-foreground
error banner: mt-4 px-4 py-2.5 bg-error-lightest rounded-lg
error text: text-sm font-medium text-error-foreground
```

### JobFilters
**File:** `components/find-jobs/JobFilters.tsx`
**Pattern:** Full-width flex row inside the jobs card; bottom border divides it from the table. Left: borderless search icon + plain input. Right: two native selects styled as outlined pills with ChevronDown overlay. Client component — drives real data via URL search params. Wrapped in `<Suspense>` in page.tsx (required by `useSearchParams`).
```
row: flex items-center gap-3 px-4 py-3 border-b border-border
filter input: w-full pl-6 py-1 text-sm text-text-primary placeholder:text-text-muted focus:outline-none bg-transparent (no border)
filter icon: absolute left-0, h-4 w-4 text-text-muted
select: appearance-none pl-3 pr-8 py-1.5 border border-border rounded-md text-sm text-text-primary bg-surface focus:outline-none focus:ring-1 focus:ring-accent
select chevron: absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none
```
**URL params:** `?q=<text>&match=all|high|low&sort=score|newest|oldest`. Text search is debounced 500ms via `useEffect` + `useRef` pattern (refs keep router/pathname/searchParams stable in the timeout closure). Dropdowns push immediately. All changes delete `page` param to reset to page 1.

### JobsTable
**File:** `components/find-jobs/JobsTable.tsx`
**Pattern:** Client component — uses `useRouter` for row click navigation to `/find-jobs/[id]`. Accepts `jobs: Job[]` prop. Columns: COMPANY (icon + name), ROLE, MATCH SCORE (bar + %), SALARY EST., DATE FOUND. No alternating rows; hover is `bg-surface-secondary`. Empty state shown when `jobs.length === 0`.
```
table: w-full (inside overflow-x-auto wrapper)
th: text-left text-xs font-medium text-text-secondary uppercase tracking-wide px-4 py-3 whitespace-nowrap
tr: border-b border-border last:border-0 hover:bg-surface-secondary transition-colors cursor-pointer
td: px-4 py-3.5
company icon box: w-8 h-8 rounded-md bg-surface-tertiary border border-border flex items-center justify-center
company icon: Building2 h-4 w-4 text-text-muted
company name: text-sm font-medium text-text-primary
role: text-sm text-text-primary
salary: text-sm text-text-primary (fallback "—" when null)
date: text-sm text-text-muted
empty state: colSpan=5 td, py-12 text-center, text-sm text-text-muted
```
**MatchScoreBar (inlined):** 
```
track: w-20 h-1 bg-border-light rounded-full overflow-hidden
fill: h-full rounded-full — bg-success (≥90), bg-info (≥80), bg-warning (<80) — width via inline style
text: text-sm font-semibold — text-success (≥90), text-info-medium (≥80), text-warning (<80)
```
**Color threshold decision:** ≥90% green, 80–89% blue, <80% orange — matches design image (overrides ui-rules.md/ui-tokens.md which are stale for this section).

### JobsPagination
**File:** `components/find-jobs/JobsPagination.tsx`
**Pattern:** Client component — navigates via URL search params. Flex row: "Showing X to Y of Z results" + "Jobs by Adzuna" credit on left; Previous/page numbers/Next on right. Active page has `bg-accent text-accent-foreground`. Previous/Next disabled at bounds. Wrapped in `<Suspense>` in page.tsx.
```
row: flex items-center justify-between px-4 py-3.5 border-t border-border
results text: text-sm text-text-muted
attribution: text-xs text-text-muted
Previous/Next: px-3 py-1.5 text-sm text-text-secondary border border-border rounded-md hover:bg-surface-secondary disabled:opacity-50 disabled:cursor-not-allowed
page button (inactive): w-8 h-8 text-sm text-text-secondary rounded-md hover:bg-surface-secondary
page button (active): w-8 h-8 text-sm bg-accent text-accent-foreground font-medium rounded-md
ellipsis: text-sm text-text-muted px-1
```
**Page window logic:** ≤7 pages → show all. >7 pages → always show first+last, show current±1 with `…` gaps.

### JobInfo
**File:** `components/job-details/JobInfo.tsx`
**Pattern:** Two stacked cards. Top card: company icon box + job title + company name + match badge + View Job Post button. Below: 4-column grid of info mini-cards (Salary, Location, Job Type, Date Found), each with icon, uppercase label, value.
```
header card: bg-surface border border-border rounded-xl shadow-sm p-6
company icon box: w-10 h-10 rounded-lg bg-surface-tertiary border border-border
job title: text-xl font-bold text-text-primary
company name: text-sm text-text-secondary
match badge (≥80): bg-success-lightest text-success-foreground text-xs font-medium px-2.5 py-0.5 rounded-full
match badge (<80): bg-warning/10 text-warning text-xs font-medium px-2.5 py-0.5 rounded-full
View Job Post btn: flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-text-primary border border-border rounded-md hover:bg-surface-secondary transition-colors
info mini-card: bg-surface border border-border rounded-xl shadow-sm p-4
info icon box: w-8 h-8 rounded-lg {color-specific-bg}
info label: text-xs font-medium text-text-muted uppercase tracking-wide
info value: text-sm font-medium text-text-primary truncate
```
**Match badge color note:** Header badge uses 2-level rule (≥80=green, else orange). Table bar uses 3-level rule (≥90/≥80/else). Different components — design is source of truth for each.

### MatchScore
**File:** `components/job-details/MatchScore.tsx`
**Pattern:** Two separate cards. First: AI Match Reasoning — Sparkles icon + "AI MATCH REASONING" eyebrow + paragraph. Second: Required Skills — "REQUIRED SKILLS VS YOUR PROFILE" eyebrow; "You have" row (green pills with Check icon); divider; "You lack" row (orange pills with X icon).
```
card: bg-surface border border-border rounded-xl shadow-sm p-6
section eyebrow: text-xs font-semibold text-text-secondary uppercase tracking-wide
match reason text: text-sm text-text-primary leading-relaxed
sub-label: text-xs font-medium text-text-muted mb-2
matched skill pill: inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-success-lightest text-success-foreground
missing skill pill: inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-warning/10 text-warning
divider: border-t border-border
```

### JobDescription
**File:** `components/job-details/JobDescription.tsx`
**Pattern:** Single card. Briefcase icon + "Job Description" heading + description text. Returns null if `aboutRole` is null.
```
card: bg-surface border border-border rounded-xl shadow-sm p-6
heading: text-base font-semibold text-text-primary
description: text-sm text-text-primary leading-relaxed whitespace-pre-line
```

### CompanyResearch
**File:** `components/job-details/CompanyResearch.tsx`
**Last updated:** 2026-06-22
**Pattern:** Client component. Single card. Header row: Building2 icon + "Company Research" title + Research Company button (only shown when `research === null`). Empty state: centered building icon box, "No research yet" text, description, optional error text. Loading state shows a multi-step process. Completed state renders a candidate briefing summary followed by icon-led dossier sections with section descriptions, stronger priority hierarchy, tokenized pills, list rows, and compact source rows. Calls `POST /api/agent/research` with `{ jobId }` on button click; calls `router.refresh()` on success.
```
card: bg-surface border border-border rounded-xl shadow-sm p-6
Research Company btn: flex items-center gap-1.5 px-4 py-2 bg-accent text-accent-foreground text-sm font-medium rounded-md hover:opacity-90 transition-opacity disabled:opacity-50
loading wrapper: py-2, aria-live polite, aria-busy true
loading title: text-sm font-medium text-text-primary
loading helper text: text-xs text-text-muted leading-relaxed
loading step list: flex flex-col gap-3
loading step row: flex gap-3
loading step icon base: flex h-7 w-7 items-center justify-center rounded-full border
loading step complete icon: border-success-light bg-success-lightest text-success
loading step active icon: border-accent bg-accent-muted text-accent with Loader2 h-4 w-4 animate-spin
loading step pending icon: border-border bg-surface-secondary text-text-muted with number text-xs font-semibold
loading connector: mt-2 h-full min-h-6 w-px bg-border
loading step title: text-sm font-medium text-text-primary
loading step description: text-xs text-text-muted leading-relaxed
completed wrapper: flex flex-col
briefing wrapper: border-t border-border pt-5
briefing icon: h-9 w-9 rounded-lg border border-accent-light bg-accent-muted text-accent
briefing eyebrow: text-xs font-semibold text-accent uppercase tracking-wide
briefing paragraph: text-sm text-text-primary leading-relaxed
summary pills: inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-secondary px-2.5 py-1 text-xs font-medium text-text-secondary
dossier section: border-t border-border pt-5
dossier header row: flex items-start gap-3 mb-3
dossier icon base: flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border
dossier icon accent: bg-accent-muted text-accent border-accent-light
dossier icon success: bg-success-lightest text-success border-success-light
dossier icon info: bg-info-lightest text-info-foreground border-info-light
dossier icon warning: bg-warning/10 text-warning border-warning/20
dossier icon neutral: bg-surface-secondary text-text-muted border-border
dossier section title: text-sm font-semibold text-text-primary
dossier section description: text-xs text-text-muted leading-relaxed
dossier list: flex flex-col gap-2
dossier list row: flex gap-3
dossier list marker: mt-0.5 h-5 w-5 rounded-full bg-surface-secondary border border-border text-xs font-semibold text-text-secondary
dossier list text: text-sm text-text-primary leading-relaxed
why-this-role callout: border-l-2 border-accent pl-3 text-sm text-text-primary leading-relaxed
tech stack pill: inline-flex items-center gap-1.5 rounded-full bg-info-lightest px-2.5 py-1 text-xs font-medium text-info-foreground
source link row: group inline-flex items-start gap-2 rounded-lg border border-border px-3 py-2 text-xs text-accent transition-colors hover:bg-surface-secondary
source fallback row: rounded-lg border border-border px-3 py-2 text-xs text-text-muted
empty state icon box: w-12 h-12 rounded-xl bg-surface-secondary border border-border
empty state text: text-sm font-medium text-text-primary
empty state sub-text: text-xs text-text-muted text-center max-w-xs leading-relaxed
error text: text-sm text-error
```
**State pattern:** `researching` swaps the empty state for the loading stepper while `/api/agent/research` is in flight. `activeStep` resets on click and advances every 6.5s, capping at the final step because the backend does not stream real progress events. Steps describe the actual agent workflow: resolve company site, read public pages, connect findings to the profile, and build the dossier.
**Completed-state notes:** Keep the overview as a candidate briefing summary before all detailed sections. Use icon-led section headers to make the dossier scannable without nesting cards inside the card. `Your Edge` and `Interview Prep` use check markers, `Smart Questions` uses numbered markers, and `Why This Role` uses the accent left rule to read as a concise callout.

### JobActions
**File:** `components/job-details/JobActions.tsx`
**Pattern:** Full-width purple anchor tag styled as button. Links to `externalApplyUrl` in new tab. Returns null if `applyUrl` is null.
```
button: block w-full py-3.5 bg-accent text-accent-foreground text-sm font-medium text-center rounded-xl hover:opacity-90 transition-opacity
```

---

## Global CSS Classes

### Button Cursor
**File:** `app/globals.css`
**Last updated:** 2026-06-22
**Pattern:** Enabled native buttons and `role="button"` controls use a pointer cursor globally; disabled button-like controls use not-allowed.
```
button:not(:disabled), [role="button"]:not([aria-disabled="true"]): cursor: pointer
button:disabled, [aria-disabled="true"]: cursor: not-allowed
```

### `.hero-gradient`
Multi-stop radial gradient using accent-muted, info-lightest, accent-light tokens over white surface. Used in Hero and nowhere else.

### `.cta-gradient`
Same token palette as hero-gradient with different radial positions. Used in CTASection.
