"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

type Props = {
  from: number;
  to: number;
  total: number;
  page: number;
  pageCount: number;
};

export function JobsPagination({ from, to, total, page, pageCount }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function goToPage(p: number) {
    const next = new URLSearchParams(searchParams.toString());
    if (p <= 1) {
      next.delete("page");
    } else {
      next.set("page", String(p));
    }
    router.push(`${pathname}?${next.toString()}`);
  }

  function getVisiblePages(): (number | "...")[] {
    if (pageCount <= 7) {
      return Array.from({ length: pageCount }, (_, i) => i + 1);
    }
    const pages: (number | "...")[] = [1];
    if (page > 3) pages.push("...");
    const start = Math.max(2, page - 1);
    const end = Math.min(pageCount - 1, page + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (page < pageCount - 2) pages.push("...");
    pages.push(pageCount);
    return pages;
  }

  const visiblePages = getVisiblePages();

  return (
    <div className="flex items-center justify-between px-4 py-3.5 border-t border-border">
      <div className="flex items-center gap-4">
        <p className="text-sm text-text-muted">
          Showing {from} to {to} of {total} results
        </p>
        <p className="text-xs text-text-muted">Jobs by Adzuna</p>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => goToPage(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1.5 text-sm text-text-secondary border border-border rounded-md hover:bg-surface-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        {visiblePages.map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="px-1 text-sm text-text-muted">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => goToPage(p as number)}
              className={`w-8 h-8 text-sm rounded-md transition-colors ${
                p === page
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-text-secondary hover:bg-surface-secondary"
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          type="button"
          onClick={() => goToPage(page + 1)}
          disabled={page >= pageCount}
          className="px-3 py-1.5 text-sm text-text-secondary border border-border rounded-md hover:bg-surface-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
