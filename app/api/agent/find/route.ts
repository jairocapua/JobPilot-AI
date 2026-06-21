import { NextResponse } from "next/server";
import { createInsforgeServer } from "@/lib/insforge-server";
import { createPostHogServer } from "@/lib/posthog-server";
import { findJobsAgent } from "@/agent/adzuna";
import type { ProfileRow } from "@/lib/profile";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { jobTitle?: unknown; location?: unknown };
    const { jobTitle, location } = body;

    if (!jobTitle || typeof jobTitle !== "string" || !jobTitle.trim()) {
      return NextResponse.json(
        { success: false, error: "jobTitle is required." },
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

    const locationStr = typeof location === "string" ? location.trim() : "";

    // PostHog: job_search_started
    const posthog = createPostHogServer();
    posthog.capture({
      distinctId: user.id,
      event: "job_search_started",
      properties: {
        userId: user.id,
        jobTitle: jobTitle.trim(),
        location: locationStr || null,
      },
    });
    await posthog.shutdown();

    // Fetch user profile
    const { data: profileData } = await insforge.database
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // Create agent_run record
    const { data: runData, error: runError } = await insforge.database
      .from("agent_runs")
      .insert([
        {
          user_id: user.id,
          status: "running",
          job_title_searched: jobTitle.trim(),
          location_searched: locationStr || null,
        },
      ])
      .select()
      .single();

    if (runError || !runData) {
      return NextResponse.json(
        { success: false, error: "Failed to start job search." },
        { status: 500 },
      );
    }

    const runId = (runData as { id: string }).id;

    // Run the agent
    const result = await findJobsAgent(
      insforge,
      user.id,
      runId,
      profileData as ProfileRow,
      jobTitle.trim(),
      locationStr,
    );

    // Update agent_run status
    await insforge.database
      .from("agent_runs")
      .update({
        status: result.success ? "completed" : "failed",
        jobs_found: result.savedCount,
        completed_at: new Date().toISOString(),
      })
      .eq("id", runId);

    // PostHog: job_found per saved job
    if (result.savedMatchScores.length > 0) {
      const posthog2 = createPostHogServer();
      for (const matchScore of result.savedMatchScores) {
        posthog2.capture({
          distinctId: user.id,
          event: "job_found",
          properties: { userId: user.id, source: "search", matchScore },
        });
      }
      await posthog2.shutdown();
    }

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      jobsFound: result.jobsFound,
      savedCount: result.savedCount,
    });
  } catch (err) {
    console.error("[api/agent/find]", err);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 },
    );
  }
}
