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
cta button: bg-overlay-dark text-white text-sm font-medium px-4 py-2 rounded-lg
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
primary button: inline-flex items-center gap-2 bg-overlay-dark text-white text-sm font-medium px-5 py-2.5 rounded-lg
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

---

## Global CSS Classes

### `.hero-gradient`
Multi-stop radial gradient using accent-muted, info-lightest, accent-light tokens over white surface. Used in Hero and nowhere else.

### `.cta-gradient`
Same token palette as hero-gradient with different radial positions. Used in CTASection.
