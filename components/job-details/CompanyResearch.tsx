"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Search,
  Loader2,
  ExternalLink,
  CheckCircle2,
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

function DossierList({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-text-muted">No details available yet.</p>;
  }

  return (
    <ul className="list-disc pl-5 space-y-2 marker:text-text-muted">
      {items.map((item, index) => (
        <li
          key={`${item}-${index}`}
          className="text-sm text-text-primary leading-relaxed"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function DossierSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-border pt-4">
      <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
        {title}
      </h3>
      {children}
    </section>
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
        <div className="flex flex-col gap-4">
          <p className="text-sm text-text-primary leading-relaxed">
            {research.companyOverview}
          </p>

          <DossierSection title="Tech Stack">
            {research.techStack.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {research.techStack.map((item, index) => (
                  <span
                    key={`${item}-${index}`}
                    className="text-xs font-medium px-2.5 py-1 rounded-full bg-info-lightest text-info-foreground"
                  >
                    {item}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted">No stack details found.</p>
            )}
          </DossierSection>

          <DossierSection title="Culture">
            <DossierList items={research.culture} />
          </DossierSection>

          <DossierSection title="Why This Role">
            <p className="text-sm text-text-primary leading-relaxed">
              {research.whyThisRole}
            </p>
          </DossierSection>

          <DossierSection title="Your Edge">
            <DossierList items={research.yourEdge} />
          </DossierSection>

          <DossierSection title="Gaps to Address">
            <DossierList items={research.gapsToAddress} />
          </DossierSection>

          <DossierSection title="Smart Questions">
            <DossierList items={research.smartQuestions} />
          </DossierSection>

          <DossierSection title="Interview Prep">
            <DossierList items={research.interviewPrep} />
          </DossierSection>

          <DossierSection title="Sources">
            <div className="flex flex-col gap-2">
              {research.sources.map((source, index) =>
                isUrl(source) ? (
                  <a
                    key={`${source}-${index}`}
                    href={source}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-accent hover:opacity-80 transition-opacity break-all"
                  >
                    {source}
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  </a>
                ) : (
                  <p
                    key={`${source}-${index}`}
                    className="text-xs text-text-muted"
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
