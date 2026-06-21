import type { ReactNode } from "react";
import { Building2, DollarSign, MapPin, Briefcase, Clock, ExternalLink } from "lucide-react";
import type { JobDetail } from "@/types";

function matchBadgeClasses(score: number): string {
  if (score >= 80) return "bg-success-lightest text-success-foreground";
  return "bg-warning/10 text-warning";
}

function InfoCard({
  icon,
  iconBg,
  label,
  value,
}: {
  icon: ReactNode;
  iconBg: string;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-surface border border-border rounded-xl shadow-sm p-4">
      <div
        className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center mb-3`}
      >
        {icon}
      </div>
      <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-sm font-medium text-text-primary truncate">{value}</p>
    </div>
  );
}

export function JobInfo({ job }: { job: JobDetail }) {
  return (
    <div className="flex flex-col gap-4">
      {/* Job header card */}
      <div className="bg-surface border border-border rounded-xl shadow-sm p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-surface-tertiary border border-border flex items-center justify-center flex-shrink-0">
              <Building2 className="h-5 w-5 text-text-muted" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-primary">{job.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-text-secondary">{job.company}</span>
                <span className="text-text-muted text-sm">•</span>
                <span
                  className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${matchBadgeClasses(job.matchScore)}`}
                >
                  {job.matchScore}% Match Score
                </span>
              </div>
            </div>
          </div>
          {job.externalApplyUrl && (
            <a
              href={job.externalApplyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-text-primary border border-border rounded-md hover:bg-surface-secondary transition-colors whitespace-nowrap flex-shrink-0"
            >
              <ExternalLink className="h-4 w-4" />
              View Job Post
            </a>
          )}
        </div>
      </div>

      {/* Info row */}
      <div className="grid grid-cols-4 gap-4">
        <InfoCard
          icon={<DollarSign className="h-4 w-4 text-success" />}
          iconBg="bg-success-lightest"
          label="Salary Est."
          value={job.salary ?? "—"}
        />
        <InfoCard
          icon={<MapPin className="h-4 w-4 text-info-medium" />}
          iconBg="bg-info-lightest"
          label="Location"
          value={job.location ?? "—"}
        />
        <InfoCard
          icon={<Briefcase className="h-4 w-4 text-text-muted" />}
          iconBg="bg-surface-tertiary"
          label="Job Type"
          value={job.jobType ?? "—"}
        />
        <InfoCard
          icon={<Clock className="h-4 w-4 text-accent" />}
          iconBg="bg-accent-muted"
          label="Date Found"
          value={job.foundAt}
        />
      </div>
    </div>
  );
}
