import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { researchCompanyAgent, type ResearchJobRow } from "@/agent/research";
import { createInsforgeServer } from "@/lib/insforge-server";
import { createPostHogServer } from "@/lib/posthog-server";
import type { ProfileRow } from "@/lib/profile";

const JOB_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function readStringArray(value: unknown): string[] | null {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? value
    : null;
}

function toResearchJobRow(value: unknown): ResearchJobRow | null {
  if (!isRecord(value) || typeof value.id !== "string") return null;

  return {
    id: value.id,
    run_id: readString(value.run_id),
    title: readString(value.title),
    company: readString(value.company),
    about_role: readString(value.about_role),
    matched_skills: readStringArray(value.matched_skills),
    missing_skills: readStringArray(value.missing_skills),
    external_apply_url: readString(value.external_apply_url),
    source_url: readString(value.source_url),
  };
}

function readId(value: unknown): string | null {
  return isRecord(value) && typeof value.id === "string" ? value.id : null;
}

function isValidJobId(value: string): boolean {
  return JOB_ID_PATTERN.test(value);
}

async function ensureRunId(
  insforge: Awaited<ReturnType<typeof createInsforgeServer>>,
  userId: string,
  job: ResearchJobRow,
): Promise<{ runId: string | null; created: boolean }> {
  if (job.run_id) return { runId: job.run_id, created: false };

  const { data, error } = await insforge.database
    .from("agent_runs")
    .insert([
      {
        user_id: userId,
        status: "running",
        job_title_searched: `Research: ${job.company ?? "Company"}`,
        location_searched: null,
        jobs_found: 0,
      },
    ])
    .select("id")
    .single();

  if (error) {
    console.error("[api/agent/research] Failed to create research run:", error);
    return { runId: null, created: false };
  }

  return { runId: readId(data), created: true };
}

async function updateFallbackRun(
  insforge: Awaited<ReturnType<typeof createInsforgeServer>>,
  runId: string,
  userId: string,
  success: boolean,
): Promise<void> {
  const { error } = await insforge.database
    .from("agent_runs")
    .update({
      status: success ? "completed" : "failed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", runId)
    .eq("user_id", userId);

  if (error) {
    console.error("[api/agent/research] Failed to update research run:", error);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { jobId?: unknown };
    const jobId = typeof body.jobId === "string" ? body.jobId.trim() : "";

    if (!jobId || !isValidJobId(jobId)) {
      return NextResponse.json(
        { success: false, error: "A valid jobId is required." },
        { status: 400 },
      );
    }

    const insforge = await createInsforgeServer();
    const {
      data: { user },
    } = await insforge.auth.getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated." },
        { status: 401 },
      );
    }

    const { data: jobRows, error: jobError } = await insforge.database
      .from("jobs")
      .select(
        "id, run_id, title, company, about_role, matched_skills, missing_skills, external_apply_url, source_url",
      )
      .eq("id", jobId)
      .eq("user_id", user.id)
      .eq("status", "active")
      .limit(1);

    if (jobError) {
      console.error("[api/agent/research] Failed to load job:", jobError);
      return NextResponse.json(
        { success: false, error: "Failed to load job." },
        { status: 500 },
      );
    }

    if (!Array.isArray(jobRows) || jobRows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Job not found." },
        { status: 404 },
      );
    }

    const job = toResearchJobRow(jobRows[0]);
    if (!job) {
      return NextResponse.json(
        { success: false, error: "Job data is invalid." },
        { status: 500 },
      );
    }

    const { data: profileData, error: profileError } = await insforge.database
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("[api/agent/research] Failed to load profile:", profileError);
    }

    const { runId, created } = await ensureRunId(insforge, user.id, job);
    if (!runId) {
      return NextResponse.json(
        { success: false, error: "Failed to start company research." },
        { status: 500 },
      );
    }

    // SDK rows are untyped; selected profile columns match ProfileRow in lib/profile.ts.
    const profile = profileData as ProfileRow | null;
    const result = await researchCompanyAgent(
      insforge,
      user.id,
      runId,
      job,
      profile,
    );

    if (created) {
      await updateFallbackRun(insforge, runId, user.id, result.success);
    }

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error ?? "Company research failed." },
        { status: 500 },
      );
    }

    const posthog = createPostHogServer();
    posthog.capture({
      distinctId: user.id,
      event: "company_researched",
      properties: {
        userId: user.id,
        jobId: job.id,
        company: job.company,
      },
    });
    await posthog.shutdown();

    revalidatePath(`/find-jobs/${job.id}`);

    return NextResponse.json({
      success: true,
      data: result.dossier,
    });
  } catch (error) {
    console.error("[api/agent/research]", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 },
    );
  }
}
