import type { ReactElement } from "react";

type ActivityTone = "accent" | "info" | "success";

type ActivityItem = {
  title: string;
  timestamp: string;
  tone: ActivityTone;
};

const ACTIVITIES: ActivityItem[] = [
  {
    title: "Found 8 jobs for Frontend Engineer",
    timestamp: "10 mins ago",
    tone: "accent",
  },
  {
    title: "Researched Stripe",
    timestamp: "1 hour ago",
    tone: "info",
  },
  {
    title: "Found 12 jobs for React Developer",
    timestamp: "2 hours ago",
    tone: "success",
  },
  {
    title: "Researched Vercel",
    timestamp: "Yesterday",
    tone: "accent",
  },
  {
    title: "Found 10 jobs for Full Stack Engineer",
    timestamp: "Yesterday",
    tone: "success",
  },
];

const DOT_CLASSES: Record<ActivityTone, { outer: string; inner: string }> = {
  accent: { outer: "bg-accent-light", inner: "bg-accent" },
  info: { outer: "bg-info-light", inner: "bg-info" },
  success: { outer: "bg-success-light", inner: "bg-success-alt" },
};

export function RecentActivity(): ReactElement {
  return (
    <section className="rounded-xl border border-border bg-surface shadow-sm">
      <div className="border-b border-border px-6 py-6">
        <h2 className="text-base font-semibold text-text-primary">
          Recent Activity
        </h2>
      </div>
      <div className="px-6 py-7">
        {ACTIVITIES.map((activity, index) => {
          const dot = DOT_CLASSES[activity.tone];
          const isLast = index === ACTIVITIES.length - 1;

          return (
            <div key={`${activity.title}-${activity.timestamp}`} className="flex gap-5">
              <div className="flex flex-col items-center pt-1">
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full border-2 border-surface ${dot.outer}`}
                >
                  <span className={`h-2 w-2 rounded-full ${dot.inner}`} />
                </span>
                {!isLast ? <span className="mt-2 h-11 w-px bg-border" /> : null}
              </div>
              <div className={isLast ? "" : "pb-7"}>
                <p className="text-sm font-semibold text-text-primary">
                  {activity.title}
                </p>
                <p className="mt-1 text-xs text-text-muted">
                  {activity.timestamp}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
