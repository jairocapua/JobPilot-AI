"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Search,
  Loader2,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Code2,
  Link2,
  MessageSquareText,
  Sparkles,
  Target,
  Users,
  ClipboardCheck,
  type LucideIcon,
} from "lucide-react";
import type { CompanyResearchDossier } from "@/types";

const researchSteps = [
  {
    title: "Finding the company site",
    description: "Following the job post and resolving the best public company homepage.",
  },
  {
    title: "Reading public pages",
    description: "Scanning the homepage plus useful About, product, blog, or engineering pages.",
  },
  {
    title: "Connecting it to your profile",
    description: "Comparing the company signals with the role, your skills, and your gaps.",
  },
  {
    title: "Building the dossier",
    description: "Summarizing interview prep, smart questions, tech stack, and sources.",
  },
];

type DossierTone = "accent" | "success" | "info" | "warning" | "neutral";

type DossierListVariant = "check" | "numbered" | "plain";

function getToneClasses(tone: DossierTone): string {
  if (tone === "accent") {
    return "bg-accent-muted text-accent border-accent-light";
  }

  if (tone === "success") {
    return "bg-success-lightest text-success border-success-light";
  }

  if (tone === "info") {
    return "bg-info-lightest text-info-foreground border-info-light";
  }

  if (tone === "warning") {
    return "bg-warning/10 text-warning border-warning/20";
  }

  return "bg-surface-secondary text-text-muted border-border";
}

function DossierList({
  items,
  variant = "plain",
}: {
  items: string[];
  variant?: DossierListVariant;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-text-muted">No details available yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, index) => (
        <li key={`${item}-${index}`} className="flex gap-3">
          <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-surface-secondary border border-border text-xs font-semibold text-text-secondary">
            {variant === "check" ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
            ) : variant === "numbered" ? (
              index + 1
            ) : (
              <span className="h-1.5 w-1.5 rounded-full bg-text-muted" />
            )}
          </span>
          <span className="text-sm text-text-primary leading-relaxed">
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}

function DossierSection({
  title,
  description,
  icon: Icon,
  tone = "neutral",
  children,
}: {
  title: string;
  description?: string;
  icon: LucideIcon;
  tone?: DossierTone;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-border pt-5">
      <div className="flex items-start gap-3 mb-3">
        <div
          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border ${getToneClasses(tone)}`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex flex-col gap-0.5">
          <h3 className="text-sm font-semibold text-text-primary">
            {title}
          </h3>
          {description && (
            <p className="text-xs text-text-muted leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

function ResearchSummary({
  research,
}: {
  research: CompanyResearchDossier;
}): ReactNode {
  const summaryItems: Array<[string, number]> = [
    ["Tech signals", research.techStack.length],
    ["Prep points", research.interviewPrep.length],
    ["Sources", research.sources.length],
  ];

  return (
    <div className="border-t border-border pt-5">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-accent-light bg-accent-muted text-accent">
          <Sparkles className="h-4.5 w-4.5" />
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold text-accent uppercase tracking-wide">
              Candidate briefing
            </p>
            <p className="text-sm text-text-primary leading-relaxed">
              {research.companyOverview}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {summaryItems.map(([label, count]) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-secondary px-2.5 py-1 text-xs font-medium text-text-secondary"
              >
                <span className="text-text-primary">{count}</span>
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function isUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function ResearchLoadingCard({
  activeStep,
}: {
  activeStep: number;
}): ReactNode {
  return (
    <div className="py-2" aria-live="polite" aria-busy="true">
      <div className="flex flex-col gap-1 mb-5">
        <p className="text-sm font-medium text-text-primary">
          Research is running
        </p>
        <p className="text-xs text-text-muted leading-relaxed">
          JobPilot is browsing public company pages and turning the findings
          into a candidate-ready briefing.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {researchSteps.map((step, index) => {
          const isComplete = index < activeStep;
          const isActive = index === activeStep;

          return (
            <div key={step.title} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full border ${
                    isComplete
                      ? "border-success-light bg-success-lightest text-success"
                      : isActive
                        ? "border-accent bg-accent-muted text-accent"
                        : "border-border bg-surface-secondary text-text-muted"
                  }`}
                >
                  {isComplete ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : isActive ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span className="text-xs font-semibold">{index + 1}</span>
                  )}
                </div>
                {index < researchSteps.length - 1 && (
                  <div className="mt-2 h-full min-h-6 w-px bg-border" />
                )}
              </div>

              <div className="pb-3">
                <p className="text-sm font-medium text-text-primary">
                  {step.title}
                </p>
                <p className="text-xs text-text-muted leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CompanyResearch({
  jobId,
  companyName,
  research,
}: {
  jobId: string;
  companyName: string;
  research: CompanyResearchDossier | null;
}) {
  const router = useRouter();
  const [researching, setResearching] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!researching) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveStep((currentStep) =>
        Math.min(currentStep + 1, researchSteps.length - 1),
      );
    }, 6500);

    return () => window.clearInterval(interval);
  }, [researching]);

  async function handleResearch(): Promise<void> {
    setResearching(true);
    setActiveStep(0);
    setError(null);
    try {
      const res = await fetch("/api/agent/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError((json as { error?: string }).error ?? "Research failed. Please try again.");
      } else {
        router.refresh();
      }
    } catch {
      setError("Research failed. Please try again.");
    } finally {
      setResearching(false);
    }
  }

  return (
    <div className="bg-surface border border-border rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-text-muted" />
          <h2 className="text-base font-semibold text-text-primary">Company Research</h2>
        </div>
        {!research && (
          <button
            onClick={handleResearch}
            disabled={researching}
            className="flex items-center gap-1.5 px-4 py-2 bg-accent text-accent-foreground text-sm font-medium rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {researching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            {researching ? "Researching…" : "Research Company"}
          </button>
        )}
      </div>

      {research ? (
        <div className="flex flex-col">
          <ResearchSummary research={research} />

          <DossierSection
            title="Tech Stack"
            description="Concrete tools and platforms mentioned across the research."
            icon={Code2}
            tone="info"
          >
            {research.techStack.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {research.techStack.map((item, index) => (
                  <span
                    key={`${item}-${index}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-info-lightest px-2.5 py-1 text-xs font-medium text-info-foreground"
                  >
                    <Code2 className="h-3 w-3" />
                    {item}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted">No stack details found.</p>
            )}
          </DossierSection>

          <DossierSection
            title="Culture"
            description="Signals about how the team works and what they value."
            icon={Users}
            tone="neutral"
          >
            <DossierList items={research.culture} />
          </DossierSection>

          <DossierSection
            title="Why This Role"
            description="The business or team need this job seems to support."
            icon={Target}
            tone="accent"
          >
            <p className="border-l-2 border-accent pl-3 text-sm text-text-primary leading-relaxed">
              {research.whyThisRole}
            </p>
          </DossierSection>

          <DossierSection
            title="Your Edge"
            description="Specific connections between this role and your background."
            icon={Sparkles}
            tone="success"
          >
            <DossierList items={research.yourEdge} variant="check" />
          </DossierSection>

          <DossierSection
            title="Gaps to Address"
            description="Honest positioning for missing skills or weaker signals."
            icon={AlertTriangle}
            tone="warning"
          >
            <DossierList items={research.gapsToAddress} />
          </DossierSection>

          <DossierSection
            title="Smart Questions"
            description="Use these to show you researched the company carefully."
            icon={MessageSquareText}
            tone="info"
          >
            <DossierList items={research.smartQuestions} variant="numbered" />
          </DossierSection>

          <DossierSection
            title="Interview Prep"
            description="Topics to review before the first conversation."
            icon={ClipboardCheck}
            tone="accent"
          >
            <DossierList items={research.interviewPrep} variant="check" />
          </DossierSection>

          <DossierSection
            title="Sources"
            description="Pages and inputs used to ground this dossier."
            icon={Link2}
            tone="neutral"
          >
            <div className="flex flex-col gap-2">
              {research.sources.map((source, index) =>
                isUrl(source) ? (
                  <a
                    key={`${source}-${index}`}
                    href={source}
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex items-start gap-2 rounded-lg border border-border px-3 py-2 text-xs text-accent transition-colors hover:bg-surface-secondary"
                  >
                    <ExternalLink className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                    <span className="break-all group-hover:opacity-80">
                      {source}
                    </span>
                  </a>
                ) : (
                  <p
                    key={`${source}-${index}`}
                    className="rounded-lg border border-border px-3 py-2 text-xs text-text-muted"
                  >
                    {source}
                  </p>
                ),
              )}
            </div>
          </DossierSection>
        </div>
      ) : researching ? (
        <ResearchLoadingCard activeStep={activeStep} />
      ) : (
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <div className="w-12 h-12 rounded-xl bg-surface-secondary border border-border flex items-center justify-center">
            <Building2 className="h-6 w-6 text-text-muted" />
          </div>
          <p className="text-sm font-medium text-text-primary">No research yet</p>
          <p className="text-xs text-text-muted text-center max-w-xs leading-relaxed">
            Click &ldquo;Research Company&rdquo; to let the AI browse{" "}
            {companyName}&apos;s public pages and build a dossier.
          </p>
          {error && <p className="text-sm text-error">{error}</p>}
        </div>
      )}
    </div>
  );
}
