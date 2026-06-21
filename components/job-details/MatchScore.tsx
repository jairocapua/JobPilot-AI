import { Sparkles, Check, X } from "lucide-react";

export function MatchScore({
  matchReason,
  matchedSkills,
  missingSkills,
}: {
  matchScore: number;
  matchReason: string | null;
  matchedSkills: string[];
  missingSkills: string[];
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* AI Match Reasoning */}
      {matchReason && (
        <div className="bg-surface border border-border rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-success" />
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
              AI Match Reasoning
            </span>
          </div>
          <p className="text-sm text-text-primary leading-relaxed">{matchReason}</p>
        </div>
      )}

      {/* Required Skills vs Your Profile */}
      {(matchedSkills.length > 0 || missingSkills.length > 0) && (
        <div className="bg-surface border border-border rounded-xl shadow-sm p-6">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-4">
            Required Skills vs Your Profile
          </p>

          {matchedSkills.length > 0 && (
            <div className={missingSkills.length > 0 ? "mb-4" : ""}>
              <p className="text-xs font-medium text-text-muted mb-2">You have</p>
              <div className="flex flex-wrap gap-2">
                {matchedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-success-lightest text-success-foreground"
                  >
                    <Check className="h-3 w-3" />
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {matchedSkills.length > 0 && missingSkills.length > 0 && (
            <div className="border-t border-border mb-4" />
          )}

          {missingSkills.length > 0 && (
            <div>
              <p className="text-xs font-medium text-text-muted mb-2">You lack</p>
              <div className="flex flex-wrap gap-2">
                {missingSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-warning/10 text-warning"
                  >
                    <X className="h-3 w-3" />
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
