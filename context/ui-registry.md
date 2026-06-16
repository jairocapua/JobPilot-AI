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

| Property | Class |
| --- | --- |
| Background | `bg-surface` |
| Border | `border border-border` |
| Text | `text-text-primary text-sm font-medium` |
| Radius | `rounded-lg` |
| Padding | `px-4 py-2.5` |
| Layout | `inline-flex items-center justify-center gap-3` |
| Hover | `hover:bg-surface-secondary transition-colors` |

### OAuth Button — Primary dark (GitHub-style)
**File:** `app/(auth)/login/page.tsx`

| Property | Class |
| --- | --- |
| Background | `bg-overlay-dark` |
| Text | `text-overlay-foreground text-sm font-medium` |
| Radius | `rounded-lg` |
| Padding | `px-4 py-2.5` |
| Layout | `inline-flex items-center justify-center gap-3` |
| Hover | `hover:opacity-90 transition-opacity` |

**Pattern notes:**
Dark buttons always use `hover:opacity-90 transition-opacity` (not `hover:bg-*`). Light/surface buttons always use `hover:bg-surface-secondary transition-colors`. Never mix the two hover strategies on the same button.

### NavLinks (Active Nav)
**File:** `components/layout/NavLinks.tsx`
**Pattern:** Client component (`"use client"`) using `usePathname` to detect the active route. Imported by `Navbar`.
```
active link: text-accent
inactive link: text-text-dark hover:text-accent transition-colors
font: text-sm font-medium
gap between links: gap-8
```

### Navbar (App Pages)
**File:** `components/layout/Navbar.tsx` (updated)
**Pattern:** Same as before but now uses `NavLinks` for active state. Accepts `showCta?: boolean` (default true). Pass `showCta={false}` on authenticated app pages to hide the "Start for free" CTA. A `div.w-24` spacer keeps the logo centered when CTA is hidden.

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

---

## Global CSS Classes

### `.hero-gradient`
Multi-stop radial gradient using accent-muted, info-lightest, accent-light tokens over white surface. Used in Hero and nowhere else.

### `.cta-gradient`
Same token palette as hero-gradient with different radial positions. Used in CTASection.
