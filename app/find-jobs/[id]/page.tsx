import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createInsforgeServer } from "@/lib/insforge-server";
import { formatRelativeTime } from "@/lib/utils";
import { Navbar } from "@/components/layout/Navbar";
import { JobInfo } from "@/components/job-details/JobInfo";
import { MatchScore } from "@/components/job-details/MatchScore";
import { JobDescription } from "@/components/job-details/JobDescription";
import { CompanyResearch } from "@/components/job-details/CompanyResearch";
import { JobActions } from "@/components/job-details/JobActions";
import type { JobDetail, CompanyResearchDossier } from "@/types";

type JobRow = {
  id: string;
  title: string | null;
  company: string | null;
  location: string | null;
  salary: string | null;
  job_type: string | null;
  about_role: string | null;
  match_score: number | null;
  match_reason: string | null;
  matched_skills: string[] | null;
  missing_skills: string[] | null;
  company_research: CompanyResearchDossier | null;
  external_apply_url: string | null;
  found_at: string;
};

export default async function JobDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const insforge = await createInsforgeServer();
  const {
    data: { user },
  } = await insforge.auth.getCurrentUser();
  if (!user) redirect("/login");

  const { data: rows, error } = await insforge.database
    .from("jobs")
    .select(
      "id, title, company, location, salary, job_type, about_role, match_score, match_reason, matched_skills, missing_skills, company_research, external_apply_url, found_at",
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1);

  if (error) console.error("[find-jobs/[id]]", error);
  if (!rows || rows.length === 0) notFound();

  const row = rows[0] as JobRow;
  const job: JobDetail = {
    id: row.id,
    title: row.title ?? "Unknown Role",
    company: row.company ?? "Unknown Company",
    location: row.location,
    salary: row.salary,
    jobType: row.job_type,
    aboutRole: row.about_role,
    matchScore: row.match_score ?? 0,
    matchReason: row.match_reason,
    matchedSkills: row.matched_skills ?? [],
    missingSkills: row.missing_skills ?? [],
    companyResearch: row.company_research,
    externalApplyUrl: row.external_apply_url,
    foundAt: formatRelativeTime(row.found_at),
  };

  return (
    <>
      <Navbar showCta={false} showLogout />
      <main className="min-h-screen bg-background">
        <div className="max-w-[760px] mx-auto px-8 py-8 flex flex-col gap-4">
          <Link
            href="/find-jobs"
            className="flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary transition-colors w-fit"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Jobs
          </Link>
          <JobInfo job={job} />
          <MatchScore
            matchScore={job.matchScore}
            matchReason={job.matchReason}
            matchedSkills={job.matchedSkills}
            missingSkills={job.missingSkills}
          />
          <JobDescription aboutRole={job.aboutRole} />
          <CompanyResearch
            jobId={job.id}
            companyName={job.company}
            research={job.companyResearch}
          />
          <JobActions applyUrl={job.externalApplyUrl} companyName={job.company} />
        </div>
      </main>
    </>
  );
}
