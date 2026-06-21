import type { ReactElement } from "react";

type StatItem = {
  label: string;
  value: string;
  trend?: string;
  helper: string;
};

const STATS: StatItem[] = [
  {
    label: "Total Jobs Found",
    value: "284",
    trend: "+12%",
    helper: "vs last week",
  },
  {
    label: "Avg. Match Rate",
    value: "82%",
    trend: "+3%",
    helper: "vs last week",
  },
  {
    label: "Companies Researched",
    value: "35",
    helper: "Total researched",
  },
  {
    label: "Jobs This Week",
    value: "28",
    helper: "New this week",
  },
];

export function StatsBar(): ReactElement {
  return (
    <section
      aria-label="Dashboard statistics"
      className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4"
    >
      {STATS.map((stat) => (
        <article
          key={stat.label}
          className="min-h-32 rounded-xl border border-border bg-surface p-6 shadow-sm"
        >
          <p className="text-sm font-semibold text-text-secondary">
            {stat.label}
          </p>
          <p className="mt-1 text-[30px] font-semibold leading-9 text-text-primary">
            {stat.value}
          </p>
          <div className="mt-3 flex items-center gap-3">
            {stat.trend ? (
              <span className="rounded-sm bg-success-lightest px-2 py-0.5 text-xs font-medium text-success-darker">
                {stat.trend}
              </span>
            ) : null}
            <span className="text-xs text-text-muted">{stat.helper}</span>
          </div>
        </article>
      ))}
    </section>
  );
}
