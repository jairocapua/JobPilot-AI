"use client";

import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";
import type { Job } from "@/types";

function getScoreColors(score: number): { bar: string; text: string } {
  if (score >= 90) return { bar: "bg-success", text: "text-success" };
  if (score >= 80) return { bar: "bg-info", text: "text-info-medium" };
  return { bar: "bg-warning", text: "text-warning" };
}

function MatchScoreBar({ score }: { score: number }) {
  const { bar, text } = getScoreColors(score);
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1 bg-border-light rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${bar}`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-sm font-semibold ${text}`}>{score}%</span>
    </div>
  );
}

type Props = { jobs: Job[] };

export function JobsTable({ jobs }: Props) {
  const router = useRouter();

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            {(["Company", "Role", "Match Score", "Salary Est.", "Date Found"] as const).map(
              (col) => (
                <th
                  key={col}
                  className="text-left text-xs font-medium text-text-secondary uppercase tracking-wide px-4 py-3 whitespace-nowrap"
                >
                  {col}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {jobs.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-12 text-center">
                <p className="text-sm text-text-muted">No jobs match your current filters.</p>
              </td>
            </tr>
          ) : (
            jobs.map((job) => (
              <tr
                key={job.id}
                onClick={() => router.push(`/find-jobs/${job.id}`)}
                className="border-b border-border last:border-0 hover:bg-surface-secondary transition-colors cursor-pointer"
              >
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-surface-tertiary border border-border flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-4 w-4 text-text-muted" />
                    </div>
                    <span className="text-sm font-medium text-text-primary">{job.company}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-sm text-text-primary">{job.title}</span>
                </td>
                <td className="px-4 py-3.5">
                  <MatchScoreBar score={job.matchScore} />
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-sm text-text-primary">{job.salary ?? "—"}</span>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-sm text-text-muted">{job.foundAt}</span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
