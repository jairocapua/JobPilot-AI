"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles, Loader2 } from "lucide-react";

export function SearchControls() {
  const router = useRouter();
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<{
    jobsFound: number;
    savedCount: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch() {
    if (searching || !jobTitle.trim()) return;
    setSearching(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/agent/find", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobTitle: jobTitle.trim(), location: location.trim() }),
      });
      const json = (await res.json()) as {
        success: boolean;
        jobsFound?: number;
        savedCount?: number;
        error?: string;
      };

      if (!json.success) {
        setError(json.error ?? "Search failed. Please try again.");
      } else {
        setResult({ jobsFound: json.jobsFound ?? 0, savedCount: json.savedCount ?? 0 });
        router.refresh();
      }
    } catch {
      setError("Search failed. Please try again.");
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-xs font-medium text-text-secondary uppercase tracking-wide mb-1.5">
            Job Title
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Frontend Engineer"
              className="w-full pl-9 pr-3 py-2 border border-border rounded-md text-sm text-text-primary placeholder:text-text-muted focus:ring-1 focus:ring-accent focus:border-accent bg-surface outline-none"
            />
          </div>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-text-secondary uppercase tracking-wide mb-1.5">
            Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Remote, New York..."
            className="w-full px-3 py-2 border border-border rounded-md text-sm text-text-primary placeholder:text-text-muted focus:ring-1 focus:ring-accent focus:border-accent bg-surface outline-none"
          />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          disabled={searching || !jobTitle.trim()}
          className="flex items-center gap-2 px-5 py-2 bg-accent text-accent-foreground text-sm font-medium rounded-md hover:opacity-90 transition-opacity whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {searching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          {searching ? "Searching..." : "Find Jobs"}
        </button>
      </div>

      {result && (
        <div className="mt-4 px-4 py-2.5 bg-success-lightest rounded-lg flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-success flex-shrink-0" />
          <p className="text-sm font-medium text-success-foreground">
            Found {result.jobsFound} jobs and saved {result.savedCount} strong matches.
          </p>
        </div>
      )}

      {error && (
        <div className="mt-4 px-4 py-2.5 bg-error-lightest rounded-lg">
          <p className="text-sm font-medium text-error-foreground">{error}</p>
        </div>
      )}
    </div>
  );
}
