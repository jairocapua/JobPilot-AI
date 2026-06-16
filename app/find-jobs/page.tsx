import { redirect } from "next/navigation";
import { createInsforgeServer } from "@/lib/insforge-server";
import { Navbar } from "@/components/layout/Navbar";
import { SearchControls } from "@/components/find-jobs/SearchControls";
import { JobFilters } from "@/components/find-jobs/JobFilters";
import { JobsTable } from "@/components/find-jobs/JobsTable";
import { JobsPagination } from "@/components/find-jobs/JobsPagination";
import type { Job } from "@/types";

const MOCK_JOBS: Job[] = [
  {
    id: "1",
    company: "Vercel",
    title: "Senior Frontend Engineer",
    location: null,
    salary: "$160k – $200k",
    matchScore: 94,
    foundAt: "2 hours ago",
  },
  {
    id: "2",
    company: "Stripe",
    title: "Staff UI Engineer",
    location: null,
    salary: "$180k – $240k",
    matchScore: 88,
    foundAt: "Yesterday",
  },
  {
    id: "3",
    company: "Linear",
    title: "Product Engineer",
    location: null,
    salary: "$150k – $190k",
    matchScore: 96,
    foundAt: "Yesterday",
  },
  {
    id: "4",
    company: "Notion",
    title: "Frontend Developer",
    location: null,
    salary: "$130k – $170k",
    matchScore: 72,
    foundAt: "2 days ago",
  },
  {
    id: "5",
    company: "OpenAI",
    title: "Design Engineer",
    location: null,
    salary: "$200k – $280k",
    matchScore: 91,
    foundAt: "3 days ago",
  },
  {
    id: "6",
    company: "Figma",
    title: "Software Engineer, Editor",
    location: null,
    salary: "$170k – $220k",
    matchScore: 85,
    foundAt: "4 days ago",
  },
];

export default async function FindJobsPage() {
  const insforge = await createInsforgeServer();
  const {
    data: { user },
  } = await insforge.auth.getCurrentUser();
  if (!user) redirect("/login");

  return (
    <>
      <Navbar showCta={false} />
      <main className="min-h-screen bg-background">
        <div className="max-w-[1440px] mx-auto px-8 py-8 flex flex-col gap-6">
          <SearchControls />
          <div className="bg-surface border border-border rounded-xl shadow-sm">
            <JobFilters />
            <JobsTable jobs={MOCK_JOBS} />
            <JobsPagination from={1} to={6} total={24} page={1} pageCount={8} />
          </div>
        </div>
      </main>
    </>
  );
}
