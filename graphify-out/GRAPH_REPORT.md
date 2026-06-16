# Graph Report - .  (2026-06-16)

## Corpus Check
- Large corpus: 64 files · ~828,826 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 322 nodes · 402 edges · 44 communities (25 shown, 19 thin omitted)
- Extraction: 80% EXTRACTED · 20% INFERRED · 0% AMBIGUOUS · INFERRED: 81 edges (avg confidence: 0.85)
- Token cost: 21,762 input · 9,320 output

## Community Hubs (Navigation)
- [[_COMMUNITY_AI Agent Architecture|AI Agent Architecture]]
- [[_COMMUNITY_Project Config & Guidelines|Project Config & Guidelines]]
- [[_COMMUNITY_Landing Page Design System|Landing Page Design System]]
- [[_COMMUNITY_Profile Page UI Design|Profile Page UI Design]]
- [[_COMMUNITY_Build Plan & Progress Tracking|Build Plan & Progress Tracking]]
- [[_COMMUNITY_Auth & App Shell|Auth & App Shell]]
- [[_COMMUNITY_Homepage & Profile Components|Homepage & Profile Components]]
- [[_COMMUNITY_Dashboard UI Design|Dashboard UI Design]]
- [[_COMMUNITY_Job Listings UI|Job Listings UI]]
- [[_COMMUNITY_InsForge Client & Auth Config|InsForge Client & Auth Config]]
- [[_COMMUNITY_Feature Band 1 Design|Feature Band 1 Design]]
- [[_COMMUNITY_Dashboard Demo Screenshot|Dashboard Demo Screenshot]]
- [[_COMMUNITY_AI Action Log Design|AI Action Log Design]]
- [[_COMMUNITY_Job Match Table Design|Job Match Table Design]]
- [[_COMMUNITY_Footer & CTA Design|Footer & CTA Design]]
- [[_COMMUNITY_Navbar & Hero Design|Navbar & Hero Design]]
- [[_COMMUNITY_Find Jobs Page Design|Find Jobs Page Design]]
- [[_COMMUNITY_Job Details Page Design|Job Details Page Design]]
- [[_COMMUNITY_Database Schema & Migrations|Database Schema & Migrations]]
- [[_COMMUNITY_Agent Log UI Asset|Agent Log UI Asset]]
- [[_COMMUNITY_Testimonial & Confidence Design|Testimonial & Confidence Design]]
- [[_COMMUNITY_Analytics (PostHog)|Analytics (PostHog)]]
- [[_COMMUNITY_Project Config Files|Project Config Files]]
- [[_COMMUNITY_Brand Logo|Brand Logo]]
- [[_COMMUNITY_User Avatar Asset|User Avatar Asset]]
- [[_COMMUNITY_Singleton Node|Singleton Node]]
- [[_COMMUNITY_Singleton Node|Singleton Node]]
- [[_COMMUNITY_Singleton Node|Singleton Node]]
- [[_COMMUNITY_Singleton Node|Singleton Node]]
- [[_COMMUNITY_Singleton Node|Singleton Node]]
- [[_COMMUNITY_Singleton Node|Singleton Node]]
- [[_COMMUNITY_Singleton Node|Singleton Node]]
- [[_COMMUNITY_Singleton Node|Singleton Node]]
- [[_COMMUNITY_Singleton Node|Singleton Node]]
- [[_COMMUNITY_Singleton Node|Singleton Node]]
- [[_COMMUNITY_Singleton Node|Singleton Node]]
- [[_COMMUNITY_Singleton Node|Singleton Node]]
- [[_COMMUNITY_Singleton Node|Singleton Node]]
- [[_COMMUNITY_Singleton Node|Singleton Node]]
- [[_COMMUNITY_Singleton Node|Singleton Node]]
- [[_COMMUNITY_Singleton Node|Singleton Node]]
- [[_COMMUNITY_Singleton Node|Singleton Node]]
- [[_COMMUNITY_Singleton Node|Singleton Node]]

## God Nodes (most connected - your core abstractions)
1. `Jobs List UI - Match Score Table` - 11 edges
2. `Technology Stack` - 9 edges
3. `Library Docs Document` - 9 edges
4. `Landing Page Overall Layout` - 9 edges
5. `Home` - 8 edges
6. `Context Files Reading Order` - 8 edges
7. `OpenAI GPT-4o Model` - 8 edges
8. `Code Standards Document` - 8 edges
9. `UI Registry Document` - 8 edges
10. `Job Details Page UI` - 8 edges

## Surprising Connections (you probably didn't know these)
- `Progress Tracker Document` --semantically_similar_to--> `Memory Session Document`  [INFERRED] [semantically similar]
  context/progress-tracker.md → memory.md
- `Home` --calls--> `CTASection`  [EXTRACTED]
  app/page.tsx → components/homepage/CTASection.tsx
- `Home` --calls--> `Features`  [EXTRACTED]
  app/page.tsx → components/homepage/Features.tsx
- `Home` --calls--> `Footer`  [EXTRACTED]
  app/page.tsx → components/layout/Footer.tsx
- `Home` --calls--> `Hero`  [EXTRACTED]
  app/page.tsx → components/homepage/Hero.tsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **OAuth PKCE Authentication Flow** — oauth_route_get, callback_route_get, concept_auth_cookies [EXTRACTED 1.00]
- **Homepage Page Composition** — app_page_home, hero_hero, ctasection_ctasection, howitworks_howitworks [EXTRACTED 1.00]
- **Profile Page Composition** — profile_page_profilepage, completionindicator_completionindicator, profileform_profileform, resumeupload_resumeupload [EXTRACTED 1.00]
- **InsForge Auth Session Flow (client, server, proxy)** — lib_insforge_client_insforge, lib_insforge_server_create_insforge_server, proxy_ts_proxy_function [INFERRED 0.90]
- **Database Schema, RLS Policies, and TypeScript Types** — migrations_initial_schema_profiles_table, migrations_initial_schema_rls_policies, types_index_profile_data [INFERRED 0.85]
- **PostHog Analytics (client and server)** — lib_posthog_client_init_posthog, lib_posthog_server_create_posthog_server, package_json_posthog_js [INFERRED 0.80]
- **Company Research Pipeline: Browserbase + Stagehand + GPT-4o** — context_architecture_browserbase, context_architecture_stagehand, context_architecture_gpt4o [EXTRACTED 1.00]
- **Agent Context Documentation System** — agents_md_doc, context_projectoverview_doc, context_architecture_doc, context_buildplan_doc, context_progresstracker_doc [EXTRACTED 0.95]
- **Profile Page UI Component Set** — context_uiregistry_profileform, context_uiregistry_completionindicator, context_uiregistry_resumeupload [EXTRACTED 1.00]
- **Two-Column Feature Showcase Layout** — designs_band_cta_ai_log_panel, designs_band_cta_feature_list, designs_band_cta_cta_section [EXTRACTED 0.95]
- **AI Job Application Pipeline Actions** — designs_band_cta_scan_action, designs_band_cta_action_action, designs_band_cta_cover_letter_action [EXTRACTED 1.00]
- **Core Value Proposition Feature Trio** — designs_band_cta_match_score_feature, designs_band_cta_ai_matching_feature, designs_band_cta_focus_roles_feature [EXTRACTED 1.00]
- **** — designs_band_features_1_total_jobs_found_card, designs_band_features_1_avg_match_rate_card, designs_band_features_1_companies_researched_card, designs_band_features_1_jobs_this_week_card [EXTRACTED 1.00]
- **** — designs_band_features_1_recent_activity_panel, designs_band_features_1_company_research_chart, designs_band_features_1_stats_cards [EXTRACTED 1.00]
- **** — designs_band_features_1_navbar, designs_band_features_1_find_jobs_nav, designs_band_features_1_profile_nav [EXTRACTED 1.00]

## Communities (44 total, 19 thin omitted)

### Community 0 - "AI Agent Architecture"
Cohesion: 0.08
Nodes (35): Adzuna Job Discovery API, Browserbase Cloud Browser, Agent Operations Data Flow, Company Research Data Flow, OpenAI GPT-4o Model, InsForge Backend, InsForge Client Pattern, Next.js 16 App Router (+27 more)

### Community 1 - "Project Config & Guidelines"
Cohesion: 0.07
Nodes (28): InsForge Project Jairo_JobPilot, InsForge SDK Overview, Agent Invariant Rules, Next.js Breaking Changes Rule, Context Files Reading Order, Agent Logs Table, Agent Runs Table, OAuth Authentication Flow (+20 more)

### Community 2 - "Landing Page Design System"
Cohesion: 0.14
Nodes (20): AI Features List - Tailored Resumes, AI Prospect Matching, Perfect Tone, Bar Chart - Application Activity Over Time, Brand Logo - JobPilot, Color Scheme - Dark Navy / Purple Gradient with White Text, Dashboard Preview / App Screenshot, Feature Bullets - Track Applications, Know Companies, Keep Notes, Feature Section 1 - Manage Your Job Search With Ease, Feature Section 2 - Apply With More Confidence Every Time (+12 more)

### Community 3 - "Profile Page UI Design"
Cohesion: 0.18
Nodes (18): Add Job Link (Work Experience), Profile Completion Progress Ring (70%), Profile Completion Tab Links (Phone, Location, Education), Education Section, Generate Resume from Profile Button, Job Preferences Section, Profile Page Navbar, Personal Info Subsection (+10 more)

### Community 4 - "Build Plan & Progress Tracking"
Cohesion: 0.18
Nodes (15): Phase 2 Profile Page, Current Build Status Phase 2, Progress Tracker Document, CompletionIndicator Component Pattern, UI Registry Document, Footer Component Pattern, Hero Component Pattern, Navbar Component Pattern (+7 more)

### Community 5 - "Auth & App Shell"
Cohesion: 0.18
Nodes (14): RootLayout, PostHogProvider, GET, Auth Cookies Management, InsForge Server Client, OAuth PKCE Flow, PostHog Analytics Integration, GitHubIcon (+6 more)

### Community 6 - "Homepage & Profile Components"
Cohesion: 0.18
Nodes (14): Home, CompletionIndicator, ProfileData Type, Features, CTASection, Hero, Testimonial, HowItWorks (+6 more)

### Community 7 - "Dashboard UI Design"
Cohesion: 0.23
Nodes (13): Average Match Rate Stat Card, Companies Researched Stat Card, Company Research Activity Bar Chart, JobPilot Dashboard Layout, Find Jobs Navigation Item, Jobs Found Over Time Area Chart, Jobs This Week Stat Card, Match Score Distribution Bar Chart (+5 more)

### Community 8 - "Job Listings UI"
Cohesion: 0.31
Nodes (13): Company Column, Job Card - Figma (85% match, $170k-$220k, URL), Job Card - Linear (96% match, $150k-$190k, LinkedIn), Job Card - Notion (72% match, $130k-$170k, LinkedIn), Job Card - OpenAI (91% match, $200k-$280k, LinkedIn), Job Card - Stripe (88% match, $180k-$240k, URL), Job Card - Vercel (94% match, $160k-$200k, LinkedIn), Jobs List UI - Match Score Table (+5 more)

### Community 9 - "InsForge Client & Auth Config"
Cohesion: 0.20
Nodes (12): PKCE_COOKIE constant, createBrowserClient (SSR), insforge browser client, createInsforgeServer function, createServerClient (SSR), InsForge API Base URL (whehy4wh.ap-southeast.insforge.app), InsForge MCP Server Config, @insforge/sdk dependency (+4 more)

### Community 10 - "Feature Band 1 Design"
Cohesion: 0.24
Nodes (11): Average Match Rate Stat Card, Companies Researched Stat Card, Company Research Activity Bar Chart, JobPilot Dashboard Screen, Find Jobs Navigation Link, Jobs This Week Stat Card, Top Navigation Bar, Profile Navigation Link (+3 more)

### Community 11 - "Dashboard Demo Screenshot"
Cohesion: 0.25
Nodes (11): Company Research Activity Bar Chart, JobPilot Dashboard UI Screenshot, Dashboard Nav Link, Find Jobs Nav Link, Profile Nav Link, Dashboard Navigation Bar, Recent Activity Panel, Companies Researched Stat Card (35) (+3 more)

### Community 12 - "AI Action Log Design"
Cohesion: 0.27
Nodes (10): ACTION Log Entry (Resume Tailoring), AI Agent Activity Log Panel, AI-Powered Job Matching Feature, Generating Cover Letter Log Entry, CTA Band Section, Feature Benefits List, Focus on the Right Roles Feature, Understand Your Match Score Feature (+2 more)

### Community 13 - "Job Match Table Design"
Cohesion: 0.29
Nodes (10): Company Rows - Vercel, Stripe, Linear, Notion, OpenAI, Figma, Features Section - Manage Your Job Search With Ease, Feature Item - Find Jobs That Actually Fit, Section Headline - Manage Your Job Search With Ease, Job Matches Table with Match Score and Salary Estimate, Feature Item - Know the Company Before You Apply, Match Score Column with Color-Coded Progress Bars, Salary Estimate Column (+2 more)

### Community 14 - "Footer & CTA Design"
Cohesion: 0.24
Nodes (10): CTA Band / Call-to-Action Section, Dashboard Footer Link, Find Your First Match Secondary Button, Footer Navigation Links, Band Footer Section, Get Started CTA Button, JobPilot Logo (Footer), Privacy Policy Footer Link (+2 more)

### Community 15 - "Navbar & Hero Design"
Cohesion: 0.29
Nodes (10): Gradient Background, Start for Free CTA Button, Find Your First Match Button, Get Started Button, Hero Headline Text, Hero Section, JobPilot Logo, Navigation Links (+2 more)

### Community 16 - "Find Jobs Page Design"
Cohesion: 0.31
Nodes (10): Filter Bar (Company/Role + Matches + Sort), Individual Job Listing Row, Find Jobs Page - Job Search UI, Match Score Column, Top Navigation Bar (Dashboard / Find Jobs / Profile), Pagination Controls, Job Results Table, Salary Estimate Column (+2 more)

### Community 17 - "Job Details Page Design"
Cohesion: 0.29
Nodes (10): AI Match Reasoning Section, Apply Now CTA Button, Company Research Section, Job Description Section, Job Details Page UI, Job Header Section, Job Metadata Bar, Match Score Badge (+2 more)

### Community 18 - "Database Schema & Migrations"
Cohesion: 0.36
Nodes (10): handle_new_user (fixed with EXCEPTION handler), agent_logs table, agent_runs table, handle_new_user trigger function, jobs table, profiles table, Row Level Security Policies, ProfileData type (+2 more)

### Community 19 - "Agent Log UI Asset"
Cohesion: 0.43
Nodes (8): Action Tailoring Resume Log Entry, Agent Log Terminal Screenshot, agent_log.ts File Reference, Filter Roles Log Entry, Generating Cover Letter Log Entry, JobPilot Agent, Scan Matching Roles Log Entry, System Initialization Log Entry

### Community 20 - "Testimonial & Confidence Design"
Cohesion: 0.60
Nodes (6): Application Tracker Feature Block, Code Terminal Preview Block, Apply With More Confidence Heading, JobPilot Agent Log Terminal UI, Band Testimonial Section, Two Column Layout Pattern

### Community 21 - "Analytics (PostHog)"
Cohesion: 0.33
Nodes (6): initPostHog function, posthog browser instance, resetPostHog function, createPostHogServer function, posthog-js dependency, posthog-node dependency

### Community 22 - "Project Config Files"
Cohesion: 0.67
Nodes (3): Next.js Config, Project Dependencies (package.json), TypeScript Config

### Community 23 - "Brand Logo"
Cohesion: 1.00
Nodes (3): JobPilot (App Name), JobPilot Brand Logo, JobPilot App Icon (Grid/Dashboard Symbol)

## Knowledge Gaps
- **100 isolated node(s):** `GET`, `Testimonial`, `Footer`, `NavLinks`, `ResumeUpload` (+95 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Context Files Reading Order` connect `Project Config & Guidelines` to `AI Agent Architecture`, `Build Plan & Progress Tracking`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Why does `Code Standards Document` connect `Project Config & Guidelines` to `AI Agent Architecture`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Why does `Architecture Document` connect `Project Config & Guidelines` to `AI Agent Architecture`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `Landing Page Overall Layout` (e.g. with `Color Scheme - Dark Navy / Purple Gradient with White Text` and `Typography - Large Bold Headlines with Subtitle Body Text`) actually correct?**
  _`Landing Page Overall Layout` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `GET`, `Testimonial`, `Footer` to the rest of the system?**
  _109 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AI Agent Architecture` be split into smaller, more focused modules?**
  _Cohesion score 0.08403361344537816 - nodes in this community are weakly interconnected._
- **Should `Project Config & Guidelines` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._