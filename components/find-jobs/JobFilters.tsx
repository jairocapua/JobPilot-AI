"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, ChevronDown } from "lucide-react";

export function JobFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("q") ?? "");

  // Stable refs used inside debounce timeout — avoids stale closure
  const routerRef = useRef(router);
  const pathnameRef = useRef(pathname);
  const searchParamsRef = useRef(searchParams);
  useEffect(() => {
    routerRef.current = router;
    pathnameRef.current = pathname;
    searchParamsRef.current = searchParams;
  }, [router, pathname, searchParams]);

  // Debounce text search — pushes to URL 500ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      const next = new URLSearchParams(searchParamsRef.current.toString());
      if (search) {
        next.set("q", search);
      } else {
        next.delete("q");
      }
      next.delete("page");
      routerRef.current.push(`${pathnameRef.current}?${next.toString()}`);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  function handleParamChange(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value && value !== "all" && value !== "score") {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.delete("page");
    router.push(`${pathname}?${next.toString()}`);
  }

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
          value={searchParams.get("match") ?? "all"}
          onChange={(e) => handleParamChange("match", e.target.value)}
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
          value={searchParams.get("sort") ?? "score"}
          onChange={(e) => handleParamChange("sort", e.target.value)}
          className="appearance-none pl-3 pr-8 py-1.5 border border-border rounded-md text-sm text-text-primary bg-surface focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
        >
          <option value="score">Match Score</option>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
      </div>
    </div>
  );
}
