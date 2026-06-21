import OpenAI from "openai";
import type { InsForgeClient } from "@insforge/sdk";
import type { ProfileRow } from "@/lib/profile";
import { searchJobs, type AdzunaJob } from "@/lib/adzuna";
import { MATCH_THRESHOLD } from "@/lib/utils";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

type ScoredJob = {
  matchScore: number;
  matchReason: string;
  matchedSkills: string[];
  missingSkills: string[];
};

type AgentResult = {
  success: boolean;
  jobsFound: number;
  savedCount: number;
  savedMatchScores: number[];
  error?: string;
};

async function scoreJob(
  job: AdzunaJob,
  profile: ProfileRow,
): Promise<ScoredJob> {
  const skills = (profile.skills ?? []).join(", ");
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    temperature: 0.3,
    max_tokens: 300,
    messages: [
      {
        role: "system",
        content:
          'You are a job matching assistant. Return only valid JSON matching this exact shape: { "matchScore": number (0-100), "matchReason": string (one sentence), "matchedSkills": string[], "missingSkills": string[] }',
      },
      {
        role: "user",
        content: `JOB:\nTitle: ${job.title}\nCompany: ${job.company.display_name}\nDescription: ${job.description}\n\nCANDIDATE:\nTitle: ${profile.current_title ?? ""}\nExperience Level: ${profile.experience_level ?? ""}\nYears of Experience: ${profile.years_experience ?? ""}\nSkills: ${skills}`,
      },
    ],
  });

  return JSON.parse(response.choices[0].message.content!) as ScoredJob;
}

async function log(
  insforge: InsForgeClient,
  runId: string,
  userId: string,
  message: string,
  level: "info" | "error",
  jobId?: string,
): Promise<void> {
  await insforge.database.from("agent_logs").insert([
    {
      run_id: runId,
      user_id: userId,
      message,
      level,
      ...(jobId ? { job_id: jobId } : {}),
    },
  ]);
}

export async function findJobsAgent(
  insforge: InsForgeClient,
  userId: string,
  runId: string,
  profile: ProfileRow,
  jobTitle: string,
  location: string,
): Promise<AgentResult> {
  try {
    await log(
      insforge,
      runId,
      userId,
      `Searching Adzuna for "${jobTitle}" in "${location || "any location"}"`,
      "info",
    );

    let adzunaJobs: AdzunaJob[];
    try {
      adzunaJobs = await searchJobs(jobTitle, location);
    } catch (err) {
      const message = `Adzuna API failed: ${err instanceof Error ? err.message : "unknown error"}`;
      await log(insforge, runId, userId, message, "error");
      return { success: false, jobsFound: 0, savedCount: 0, savedMatchScores: [], error: "Failed to fetch jobs from Adzuna." };
    }

    await log(insforge, runId, userId, `Adzuna returned ${adzunaJobs.length} results`, "info");

    const scoringResults = await Promise.allSettled(
      adzunaJobs.map((job) => scoreJob(job, profile)),
    );

    type JobRecord = Record<string, unknown>;
    const toSave: JobRecord[] = [];
    const savedMatchScores: number[] = [];

    for (let i = 0; i < adzunaJobs.length; i++) {
      const scoringResult = scoringResults[i];
      const job = adzunaJobs[i];

      if (scoringResult.status === "rejected") {
        console.error(`[agent/adzuna] Scoring failed for "${job.title}":`, scoringResult.reason);
        await log(insforge, runId, userId, `Scoring failed for "${job.title}": ${String(scoringResult.reason)}`, "error");
        continue;
      }

      const scored = scoringResult.value;
      if (scored.matchScore >= MATCH_THRESHOLD) {
        toSave.push({
          user_id: userId,
          run_id: runId,
          source: "search",
          source_url: job.redirect_url,
          external_apply_url: job.redirect_url,
          title: job.title,
          company: job.company.display_name,
          location: job.location.display_name,
          salary:
            job.salary_min != null
              ? `$${Math.round(job.salary_min / 1000)}k – $${Math.round((job.salary_max ?? 0) / 1000)}k`
              : null,
          job_type: job.contract_type ?? "fulltime",
          about_role: job.description,
          match_score: scored.matchScore,
          match_reason: scored.matchReason,
          matched_skills: scored.matchedSkills,
          missing_skills: scored.missingSkills,
          found_at: new Date().toISOString(),
        });
        savedMatchScores.push(scored.matchScore);
      }
    }

    if (toSave.length > 0) {
      const { error } = await insforge.database.from("jobs").insert(toSave);
      if (error) {
        await log(insforge, runId, userId, `Failed to save jobs: ${error.message}`, "error");
        return {
          success: false,
          jobsFound: adzunaJobs.length,
          savedCount: 0,
          savedMatchScores: [],
          error: "Failed to save jobs.",
        };
      }
    }

    await log(
      insforge,
      runId,
      userId,
      `Saved ${toSave.length} strong matches out of ${adzunaJobs.length} results`,
      "info",
    );

    return {
      success: true,
      jobsFound: adzunaJobs.length,
      savedCount: toSave.length,
      savedMatchScores,
    };
  } catch (err) {
    console.error("[agent/adzuna]", err);
    return {
      success: false,
      jobsFound: 0,
      savedCount: 0,
      savedMatchScores: [],
      error: "An unexpected error occurred.",
    };
  }
}
