type Props = {
  percent: number;
  missingFields: string[];
};

export function CompletionIndicator({ percent, missingFields }: Props) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - percent / 100);
  const isComplete = percent === 100;

  return (
    <div className="bg-surface border border-border rounded-xl p-6 shadow-sm flex items-center justify-between gap-6">
      <div className="flex items-start gap-3 flex-1">
        <div className="mt-0.5 flex-shrink-0">
          {isComplete ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="10" fill="var(--color-success)" />
              <path
                d="M6 10l3 3 5-5"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="10" fill="var(--color-error)" />
              <path
                d="M10 6v4M10 13h.01"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-text-primary mb-1">
            {isComplete ? "Profile complete" : "Profile needs attention"}
          </p>
          <p className="text-sm text-text-secondary leading-relaxed">
            {isComplete
              ? "Your profile is fully filled out. You're ready to find tailored job matches."
              : "Complete the missing fields to improve your chance of getting tailored matches and generating quality resumes."}
          </p>
          {!isComplete && missingFields.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {missingFields.map((field) => (
                <span
                  key={field}
                  className="text-xs font-semibold text-error bg-surface-secondary border border-border rounded px-2 py-0.5 uppercase tracking-wide"
                >
                  {field}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-shrink-0 relative w-24 h-24">
        <svg width="96" height="96" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={isComplete ? "var(--color-success)" : "var(--color-error)"}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-semibold text-text-primary">{percent}%</span>
        </div>
      </div>
    </div>
  );
}
