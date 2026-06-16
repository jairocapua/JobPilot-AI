"use client";

import { useState } from "react";
import { Search, Sparkles } from "lucide-react";

export function SearchControls() {
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");

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
            placeholder="Remote, New York..."
            className="w-full px-3 py-2 border border-border rounded-md text-sm text-text-primary placeholder:text-text-muted focus:ring-1 focus:ring-accent focus:border-accent bg-surface outline-none"
          />
        </div>
        <button
          type="button"
          className="flex items-center gap-2 px-5 py-2 bg-accent text-accent-foreground text-sm font-medium rounded-md hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          <Search className="h-4 w-4" />
          Find Jobs
        </button>
      </div>
      {/* Mock success state — driven by real search results in Feature 10 */}
      <div className="mt-4 px-4 py-2.5 bg-success-lightest rounded-lg flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-success flex-shrink-0" />
        <p className="text-sm font-medium text-success-foreground">
          Found 8 jobs and saved 4 strong matches.
        </p>
      </div>
    </div>
  );
}
