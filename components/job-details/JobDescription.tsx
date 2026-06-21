import { Briefcase } from "lucide-react";

export function JobDescription({ aboutRole }: { aboutRole: string | null }) {
  if (!aboutRole) return null;

  return (
    <div className="bg-surface border border-border rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <Briefcase className="h-4 w-4 text-text-muted" />
        <h2 className="text-base font-semibold text-text-primary">Job Description</h2>
      </div>
      <p className="text-sm text-text-primary leading-relaxed whitespace-pre-line">
        {aboutRole}
      </p>
    </div>
  );
}
