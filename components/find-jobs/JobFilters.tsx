"use client";

import { useState } from "react";
import { Search, ChevronDown } from "lucide-react";

export function JobFilters() {
  const [search, setSearch] = useState("");
  const [matchFilter, setMatchFilter] = useState("all");
  const [sortBy, setSortBy] = useState("match_score");

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
      <div className="relative flex-1">
        <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by company or role..."
          className="w-full pl-6 pr-3 py-1 text-sm text-text-primary placeholder:text-text-muted focus:outline-none bg-transparent"
        />
      </div>
      <div className="relative">
        <select
          value={matchFilter}
          onChange={(e) => setMatchFilter(e.target.value)}
          className="appearance-none pl-3 pr-8 py-1.5 border border-border rounded-md text-sm text-text-primary bg-surface focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
        >
          <option value="all">All Matches</option>
          <option value="high">High Match</option>
          <option value="low">Low Match</option>
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
      </div>
      <div className="relative">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="appearance-none pl-3 pr-8 py-1.5 border border-border rounded-md text-sm text-text-primary bg-surface focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
        >
          <option value="match_score">Match Score</option>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
      </div>
    </div>
  );
}
