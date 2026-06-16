type Props = {
  from: number;
  to: number;
  total: number;
  page: number;
  pageCount: number;
};

export function JobsPagination({ from, to, total, page, pageCount }: Props) {
  const visiblePages = [1, 2, 3];

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
          className="px-3 py-1.5 text-sm text-text-secondary border border-border rounded-md hover:bg-surface-secondary transition-colors"
        >
          Previous
        </button>
        {visiblePages.map((p) => (
          <button
            key={p}
            type="button"
            className={`w-8 h-8 text-sm rounded-md transition-colors ${
              p === page
                ? "bg-accent text-accent-foreground font-medium"
                : "text-text-secondary hover:bg-surface-secondary"
            }`}
          >
            {p}
          </button>
        ))}
        <span className="px-1 text-sm text-text-muted">…</span>
        <button
          type="button"
          className="w-8 h-8 text-sm text-text-secondary rounded-md hover:bg-surface-secondary transition-colors"
        >
          {pageCount}
        </button>
        <button
          type="button"
          className="px-3 py-1.5 text-sm text-text-secondary border border-border rounded-md hover:bg-surface-secondary transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}
