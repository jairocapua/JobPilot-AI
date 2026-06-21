import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createInsforgeServer } from "@/lib/insforge-server";
import { formatRelativeTime, MATCH_THRESHOLD } from "@/lib/utils";
import { Navbar } from "@/components/layout/Navbar";
import { SearchControls } from "@/components/find-jobs/SearchControls";
import { JobFilters } from "@/components/find-jobs/JobFilters";
import { JobsTable } from "@/components/find-jobs/JobsTable";
import { JobsPagination } from "@/components/find-jobs/JobsPagination";
import type { Job } from "@/types";

const PAGE_SIZE = 20;

type JobRow = {
  id: string;
  company: string | null;
  title: string | null;
  location: string | null;
  salary: string | null;
  match_score: number | null;
  found_at: string;
};

export default async function FindJobsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    match?: string;
    sort?: string;
    page?: string;
  }>;
}) {
  const insforge = await createInsforgeServer();
  const {
    data: { user },
  } = await insforge.auth.getCurrentUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const rawQ = params.q?.trim() ?? "";
  const q = rawQ.replace(/[,()%]/g, "").trim();
  const match = params.match ?? "all";
  const sort = params.sort ?? "score";
  const pageNum = parseInt(params.page ?? "1", 10);
  const page = Number.isNaN(pageNum) ? 1 : Math.max(1, pageNum);
  const rangeFrom = (page - 1) * PAGE_SIZE;
  const rangeTo = rangeFrom + PAGE_SIZE - 1;

  let query = insforge.database
    .from("jobs")
    .select("id, company, title, location, salary, match_score, found_at", {
      count: "exact",
    })
    .eq("user_id", user.id)
    .eq("status", "active");

  if (q) {
    query = query.or(`company.ilike.%${q}%,title.ilike.%${q}%`);
  }

  if (match === "high") {
    query = query.gte("match_score", MATCH_THRESHOLD);
  } else if (match === "low") {
    query = query.lt("match_score", MATCH_THRESHOLD);
  }

  if (sort === "newest") {
    query = query.order("found_at", { ascending: false });
  } else if (sort === "oldest") {
    query = query.order("found_at", { ascending: true });
  } else {
    query = query.order("match_score", { ascending: false });
  }

  query = query.range(rangeFrom, rangeTo);

  const { data: rows, count, error } = await query;
  if (error) console.error("[find-jobs/page]", error);

  const jobs: Job[] = ((rows as JobRow[]) ?? []).map((row) => ({
    id: row.id,
    company: row.company ?? "Unknown",
    title: row.title ?? "Unknown Role",
    location: row.location,
    salary: row.salary,
    matchScore: row.match_score ?? 0,
    foundAt: formatRelativeTime(row.found_at),
  }));

  const total = count ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const displayFrom = total === 0 ? 0 : rangeFrom + 1;
  const displayTo = Math.min(rangeFrom + jobs.length, total);

  return (
    <>
      <Navbar showCta={false} />
      <main className="min-h-screen bg-background">
        <div className="max-w-[1440px] mx-auto px-8 py-8 flex flex-col gap-6">
          <SearchControls />
          <div className="bg-surface border border-border rounded-xl shadow-sm">
            <Suspense fallback={null}>
              <JobFilters />
            </Suspense>
            <JobsTable jobs={jobs} />
            <Suspense fallback={null}>
              <JobsPagination
                from={displayFrom}
                to={displayTo}
                total={total}
                page={page}
                pageCount={pageCount}
              />
            </Suspense>
          </div>
        </div>
      </main>
    </>
  );
}
