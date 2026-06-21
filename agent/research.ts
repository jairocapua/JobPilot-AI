import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import OpenAI from "openai";
import type { InsForgeClient } from "@insforge/sdk";
import { z } from "zod";
import { createCompanyResearchSession } from "@/lib/browserbase";
import { createStagehandClient } from "@/lib/stagehand";
import type { ProfileRow } from "@/lib/profile";
import type { CompanyResearchDossier } from "@/types";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const REDIRECT_FETCH_TIMEOUT_MS = 8000;
const MAX_REDIRECTS = 5;
const APPLY_PLATFORM_ROOT_DOMAINS = new Set([
  "adzuna.com",
  "ashbyhq.com",
  "bamboohr.com",
  "greenhouse.io",
  "icims.com",
  "indeed.com",
  "jobvite.com",
  "lever.co",
  "linkedin.com",
  "myworkdayjobs.com",
  "myworkdaysite.com",
  "oraclecloud.com",
  "recruitee.com",
  "smartrecruiters.com",
  "successfactors.com",
  "taleo.net",
  "teamtailor.com",
  "workable.com",
  "workdayjobs.com",
]);

const pageLinkKindSchema = z.enum([
  "about",
  "careers",
  "blog",
  "engineering",
  "product",
  "team",
  "other",
]);

const homepageSchema = z.object({
  oneLiner: z.string(),
  productSummary: z.string(),
  signals: z.array(z.string()),
  pageLinks: z.array(
    z.object({
      url: z.string(),
      kind: pageLinkKindSchema,
    }),
  ),
});

const subPageSchema = z.object({
  keyPoints: z.array(z.string()),
  technologies: z.array(z.string()),
  valuesOrCulture: z.array(z.string()),
  notable: z.array(z.string()),
});

const dossierSchema = z.object({
  companyOverview: z.string(),
  techStack: z.array(z.string()),
  culture: z.array(z.string()),
  whyThisRole: z.string(),
  yourEdge: z.array(z.string()),
  gapsToAddress: z.array(z.string()),
  smartQuestions: z.array(z.string()),
  interviewPrep: z.array(z.string()),
  sources: z.array(z.string()),
});

type PageLinkKind = z.infer<typeof pageLinkKindSchema>;
type HomepageResearch = z.infer<typeof homepageSchema>;
type SubPageResearch = z.infer<typeof subPageSchema> & {
  url: string;
  kind: PageLinkKind;
};

export type ResearchJobRow = {
  id: string;
  run_id: string | null;
  title: string | null;
  company: string | null;
  about_role: string | null;
  matched_skills: string[] | null;
  missing_skills: string[] | null;
  external_apply_url: string | null;
  source_url: string | null;
};

type CompanyWebsiteResearch = {
  homepageUrl: string | null;
  homepage: HomepageResearch | null;
  pages: SubPageResearch[];
  sources: string[];
};

type ResearchAgentResult = {
  success: boolean;
  dossier: CompanyResearchDossier;
  error?: string;
};

type AgentLogLevel = "info" | "success" | "warning" | "error";

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function logAgent(
  insforge: InsForgeClient,
  runId: string,
  userId: string,
  jobId: string,
  message: string,
  level: AgentLogLevel,
): Promise<void> {
  const { error } = await insforge.database.from("agent_logs").insert([
    {
      run_id: runId,
      user_id: userId,
      job_id: jobId,
      message,
      level,
    },
  ]);

  if (error) {
    console.error("[agent/research] Failed to log agent event:", error);
  }
}

function cleanCompanyForDomain(company: string): string {
  return company
    .replace(/\b(inc|inc\.|llc|ltd|ltd\.|corp|corp\.|co|co\.)\b.*$/i, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

function getRootDomain(hostname: string): string {
  const labels = hostname.replace(/^www\./i, "").split(".").filter(Boolean);
  if (labels.length <= 2) return labels.join(".");

  const multiPartSuffixes = new Set([
    "co.uk",
    "com.au",
    "co.nz",
    "com.sg",
    "com.br",
    "co.jp",
  ]);
  const suffix = labels.slice(-2).join(".");
  if (multiPartSuffixes.has(suffix)) {
    return labels.slice(-3).join(".");
  }

  return labels.slice(-2).join(".");
}

function normalizeHostname(hostname: string): string {
  return hostname.replace(/^\[/, "").replace(/\]$/, "").replace(/\.$/, "").toLowerCase();
}

function isBlockedIPv4(address: string): boolean {
  const octets = address.split(".").map((part) => Number(part));
  if (octets.length !== 4 || octets.some((part) => !Number.isInteger(part))) {
    return true;
  }

  const [first, second, third] = octets;
  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 100 && second >= 64 && second <= 127) ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168) ||
    (first === 192 && second === 0 && third === 0) ||
    (first === 192 && second === 0 && third === 2) ||
    (first === 198 && (second === 18 || second === 19)) ||
    (first === 198 && second === 51 && third === 100) ||
    (first === 203 && second === 0 && third === 113) ||
    first >= 224
  );
}

function isBlockedIPv6(address: string): boolean {
  const normalized = normalizeHostname(address);
  if (normalized.startsWith("::ffff:")) {
    return isBlockedIPv4(normalized.slice("::ffff:".length));
  }

  return (
    normalized === "::" ||
    normalized === "::1" ||
    normalized.startsWith("fe80:") ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("ff") ||
    normalized.startsWith("2001:db8:")
  );
}

function isBlockedIp(address: string): boolean {
  const normalized = normalizeHostname(address);
  const version = isIP(normalized);
  if (version === 4) return isBlockedIPv4(normalized);
  if (version === 6) return isBlockedIPv6(normalized);
  return false;
}

function isBlockedHostname(hostname: string): boolean {
  const normalized = normalizeHostname(hostname);
  return (
    normalized.length === 0 ||
    normalized === "localhost" ||
    normalized.endsWith(".localhost") ||
    normalized.endsWith(".local") ||
    normalized.endsWith(".internal") ||
    normalized.endsWith(".invalid") ||
    normalized.endsWith(".test") ||
    (!normalized.includes(".") && isIP(normalized) === 0)
  );
}

async function isPublicHttpUrl(url: URL): Promise<boolean> {
  if (!["http:", "https:"].includes(url.protocol)) return false;
  if (url.username || url.password) return false;
  if (isBlockedHostname(url.hostname) || isBlockedIp(url.hostname)) return false;

  try {
    const addresses = await lookup(normalizeHostname(url.hostname), {
      all: true,
      verbatim: true,
    });
    return (
      addresses.length > 0 &&
      addresses.every((address) => !isBlockedIp(address.address))
    );
  } catch {
    return false;
  }
}

async function fetchWithoutUnsafeRedirects(url: URL): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REDIRECT_FETCH_TIMEOUT_MS);

  try {
    return await fetch(url, {
      cache: "no-store",
      redirect: "manual",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function resolvePublicRedirectUrl(applyUrl: string): Promise<string | null> {
  let currentUrl: URL;
  try {
    currentUrl = new URL(applyUrl);
  } catch {
    return null;
  }

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount++) {
    if (!(await isPublicHttpUrl(currentUrl))) return null;

    const response = await fetchWithoutUnsafeRedirects(currentUrl);
    const location = response.headers.get("location");
    const shouldRedirect =
      response.status >= 300 && response.status < 400 && location !== null;

    await response.body?.cancel().catch(() => undefined);

    if (!shouldRedirect) return currentUrl.toString();

    try {
      currentUrl = new URL(location, currentUrl);
    } catch {
      return null;
    }
  }

  return null;
}

function fallbackHomepageUrl(company: string | null): string | null {
  if (!company) return null;

  const cleanName = cleanCompanyForDomain(company);
  return cleanName ? `https://www.${cleanName}.com` : null;
}

async function resolveHomepageUrl(job: ResearchJobRow): Promise<string | null> {
  const applyUrl = job.external_apply_url ?? job.source_url;
  const fallback = fallbackHomepageUrl(job.company);

  if (!applyUrl) return fallback;

  try {
    const resolvedUrl = await resolvePublicRedirectUrl(applyUrl);
    if (!resolvedUrl || resolvedUrl.includes("adzuna.com")) return fallback;

    const url = new URL(resolvedUrl);
    const rootDomain = getRootDomain(url.hostname);
    if (APPLY_PLATFORM_ROOT_DOMAINS.has(rootDomain)) return fallback;

    return rootDomain ? `https://${rootDomain}` : fallback;
  } catch {
    return fallback;
  }
}

function hasMeaningfulHomepage(homepage: HomepageResearch): boolean {
  return (
    homepage.oneLiner.trim().length > 0 ||
    homepage.productSummary.trim().length > 0
  );
}

function normalizeInternalLinks(
  homepage: HomepageResearch,
  homepageUrl: string,
): { url: string; kind: PageLinkKind }[] {
  const base = new URL(homepageUrl);
  const rootDomain = getRootDomain(base.hostname);
  const seen = new Set<string>();

  return homepage.pageLinks
    .map((link) => {
      try {
        const url = new URL(link.url, homepageUrl);
        if (!["http:", "https:"].includes(url.protocol)) return null;
        if (getRootDomain(url.hostname) !== rootDomain) return null;
        url.hash = "";
        const normalized = url.toString();
        if (seen.has(normalized)) return null;
        seen.add(normalized);
        return { url: normalized, kind: link.kind };
      } catch {
        return null;
      }
    })
    .filter((link): link is { url: string; kind: PageLinkKind } => link !== null);
}

function prioritizeLinks(
  links: { url: string; kind: PageLinkKind }[],
): { url: string; kind: PageLinkKind }[] {
  const priority: Record<PageLinkKind, number> = {
    about: 0,
    engineering: 1,
    blog: 2,
    product: 3,
    team: 4,
    careers: 5,
    other: 6,
  };

  return [...links]
    .sort((a, b) => priority[a.kind] - priority[b.kind])
    .slice(0, 3);
}

async function browseCompanyWebsite(
  insforge: InsForgeClient,
  runId: string,
  userId: string,
  job: ResearchJobRow,
  homepageUrl: string | null,
): Promise<CompanyWebsiteResearch> {
  if (!homepageUrl) {
    return { homepageUrl: null, homepage: null, pages: [], sources: [] };
  }

  let stagehand: Awaited<ReturnType<typeof createStagehandClient>> | null = null;

  try {
    const session = await createCompanyResearchSession({
      userId,
      jobId: job.id,
      company: job.company ?? "unknown",
      task: "company_research",
    });
    stagehand = await createStagehandClient(session.id);
    const page = stagehand.context.pages()[0] ?? (await stagehand.context.newPage());

    await page.goto(homepageUrl);
    const homepage = await stagehand.extract(
      "This is a company's homepage. Capture what the company actually does, who it's for, and any concrete signals (funding, customers, scale, mission, recent launches). Then find the internal links most worth visiting to research them as an employer.",
      homepageSchema,
    );

    if (!hasMeaningfulHomepage(homepage)) {
      await logAgent(
        insforge,
        runId,
        userId,
        job.id,
        `Website research for ${job.company ?? "company"} returned thin homepage content.`,
        "warning",
      );
      return {
        homepageUrl,
        homepage: null,
        pages: [],
        sources: [homepageUrl],
      };
    }

    const prioritizedLinks = prioritizeLinks(
      normalizeInternalLinks(homepage, homepageUrl),
    );
    const pages: SubPageResearch[] = [];

    for (const link of prioritizedLinks) {
      try {
        await page.goto(link.url);
        const data = await stagehand.extract(
          "Extract substance that helps a candidate understand this company before applying: what they do, their values and how they work, the specific technologies and tools they use, notable projects or customers, and how the team operates. Ignore nav, footers, cookie banners, and generic marketing copy.",
          subPageSchema,
        );
        pages.push({ ...data, url: link.url, kind: link.kind });
      } catch (error) {
        await logAgent(
          insforge,
          runId,
          userId,
          job.id,
          `Failed to extract ${link.kind} page ${link.url}: ${errorMessage(error)}`,
          "warning",
        );
      }
    }

    return {
      homepageUrl,
      homepage,
      pages,
      sources: [homepageUrl, ...pages.map((item) => item.url)],
    };
  } catch (error) {
    console.error("[agent/research] Browser research failed:", error);
    await logAgent(
      insforge,
      runId,
      userId,
      job.id,
      `Browser research failed: ${errorMessage(error)}`,
      "error",
    );
    return { homepageUrl, homepage: null, pages: [], sources: [] };
  } finally {
    if (stagehand) {
      try {
        await stagehand.close();
      } catch (error) {
        console.error("[agent/research] Failed to close Stagehand:", error);
      }
    }
  }
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function fallbackDossier(
  job: ResearchJobRow,
  profile: ProfileRow | null,
  research: CompanyWebsiteResearch,
): CompanyResearchDossier {
  const company = job.company ?? "this company";
  const role = job.title ?? "this role";
  const matchedSkills = job.matched_skills ?? [];
  const missingSkills = job.missing_skills ?? [];
  const profileSkills = profile?.skills ?? [];
  const techStack = uniqueStrings([
    ...matchedSkills,
    ...research.pages.flatMap((page) => page.technologies),
  ]).slice(0, 8);

  return {
    companyOverview:
      research.homepage?.productSummary ||
      research.homepage?.oneLiner ||
      `${company} is hiring for ${role}. Public website research was limited, so this briefing is grounded in the saved job posting and your profile.`,
    techStack: techStack.length > 0 ? techStack : uniqueStrings(profileSkills).slice(0, 6),
    culture:
      research.pages.flatMap((page) => page.valuesOrCulture).slice(0, 5)
        .length > 0
        ? uniqueStrings(research.pages.flatMap((page) => page.valuesOrCulture)).slice(0, 5)
        : [
            "Public culture details were limited; ask how the team works, reviews code, and supports delivery.",
          ],
    whyThisRole: `This ${role} opening appears tied to the responsibilities described in the job posting. Frame your application around the parts of your profile that map directly to those needs.`,
    yourEdge:
      matchedSkills.length > 0
        ? matchedSkills.slice(0, 5).map((skill) => `Lead with ${skill}, since it already maps to this role's requirements.`)
        : [
            `Use your ${profile?.current_title ?? "recent experience"} background to connect your past work to ${role}.`,
          ],
    gapsToAddress:
      missingSkills.length > 0
        ? missingSkills.slice(0, 5).map((skill) => `Be honest about ${skill}; point to adjacent experience and a concrete plan to ramp quickly.`)
        : ["No major skill gaps were identified in the saved match data."],
    smartQuestions: [
      `What near-term project would make someone successful in this ${role} role at ${company}?`,
      "Which parts of the stack or workflow would you expect a new hire to learn first?",
      "How does the team measure whether this role is creating impact after the first few months?",
    ],
    interviewPrep: [
      "Prepare one story that connects your strongest matched skills to this role's core responsibilities.",
      "Review the missing skills and prepare honest, specific examples of adjacent work.",
      `Read the latest public materials from ${company} before applying so your talking points feel current.`,
    ],
    sources: research.sources.length > 0 ? research.sources : ["Saved job posting"],
  };
}

function buildCompanyResearchPayload(research: CompanyWebsiteResearch): string {
  return JSON.stringify(
    {
      homepageUrl: research.homepageUrl,
      homepage: research.homepage,
      pages: research.pages,
      sources: research.sources,
    },
    null,
    2,
  );
}

function buildProfilePayload(profile: ProfileRow | null): string {
  return JSON.stringify(
    {
      current_title: profile?.current_title ?? null,
      years_experience: profile?.years_experience ?? null,
      experience_level: profile?.experience_level ?? null,
      skills: profile?.skills ?? [],
      work_experience: profile?.work_experience ?? [],
    },
    null,
    2,
  );
}

async function synthesizeDossier(
  insforge: InsForgeClient,
  runId: string,
  userId: string,
  job: ResearchJobRow,
  profile: ProfileRow | null,
  research: CompanyWebsiteResearch,
): Promise<CompanyResearchDossier> {
  const fallback = fallbackDossier(job, profile, research);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      temperature: 0.4,
      max_tokens: 800,
      messages: [
        {
          role: "system",
          content:
            'You are a sharp career strategist preparing a candidate to apply for a specific role. You are given (a) research collected from the company website, (b) the job posting, and (c) the candidate profile. Produce a concise, concrete briefing that gives this specific candidate an edge for this specific role.\n\nRules:\n- Ground every company claim in the provided research or job posting. Never invent funding, customers, headcount, or facts. If research was thin, infer carefully from the job posting and say what is inferred.\n- Be specific to THIS candidate. Connect their actual skills and past work to this company, product, values, and role. No generic advice that would apply to anyone.\n- Turn missing skills into a strategy: how to frame the gap honestly and what adjacent experience to lean on.\n- Talking points and questions must reference real things from the research or job posting.\n- Keep every item tight: one or two sentences. No fluff.\n\nReturn ONLY valid JSON matching this shape: { "companyOverview": string, "techStack": string[], "culture": string[], "whyThisRole": string, "yourEdge": string[], "gapsToAddress": string[], "smartQuestions": string[], "interviewPrep": string[], "sources": string[] }',
        },
        {
          role: "user",
          content: `COMPANY RESEARCH (from their website):\n${buildCompanyResearchPayload(research)}\n\nJOB POSTING:\nTitle: ${job.title ?? ""}\nCompany: ${job.company ?? ""}\nDescription: ${job.about_role ?? ""}\nMatched skills: ${(job.matched_skills ?? []).join(", ")}\nMissing skills: ${(job.missing_skills ?? []).join(", ")}\n\nCANDIDATE PROFILE:\n${buildProfilePayload(profile)}`,
        },
      ],
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("OpenAI returned an empty research dossier.");
    }

    const parsedJson: unknown = JSON.parse(content);
    const parsed = dossierSchema.safeParse(parsedJson);
    if (!parsed.success) {
      throw new Error("OpenAI returned an invalid research dossier shape.");
    }

    return {
      ...parsed.data,
      techStack: uniqueStrings(parsed.data.techStack),
      culture: uniqueStrings(parsed.data.culture),
      yourEdge: uniqueStrings(parsed.data.yourEdge),
      gapsToAddress: uniqueStrings(parsed.data.gapsToAddress),
      smartQuestions: uniqueStrings(parsed.data.smartQuestions),
      interviewPrep: uniqueStrings(parsed.data.interviewPrep),
      sources: uniqueStrings(parsed.data.sources).length > 0
        ? uniqueStrings(parsed.data.sources)
        : fallback.sources,
    };
  } catch (error) {
    console.error("[agent/research] Dossier synthesis failed:", error);
    await logAgent(
      insforge,
      runId,
      userId,
      job.id,
      `Dossier synthesis fallback used: ${errorMessage(error)}`,
      "warning",
    );
    return fallback;
  }
}

export async function researchCompanyAgent(
  insforge: InsForgeClient,
  userId: string,
  runId: string,
  job: ResearchJobRow,
  profile: ProfileRow | null,
): Promise<ResearchAgentResult> {
  try {
    await logAgent(
      insforge,
      runId,
      userId,
      job.id,
      `Starting company research for ${job.company ?? "unknown company"}`,
      "info",
    );

    const homepageUrl = await resolveHomepageUrl(job);
    const research = await browseCompanyWebsite(
      insforge,
      runId,
      userId,
      job,
      homepageUrl,
    );
    const dossier = await synthesizeDossier(
      insforge,
      runId,
      userId,
      job,
      profile,
      research,
    );

    const { error } = await insforge.database
      .from("jobs")
      .update({ company_research: dossier })
      .eq("id", job.id)
      .eq("user_id", userId)
      .eq("status", "active");

    if (error) {
      await logAgent(
        insforge,
        runId,
        userId,
        job.id,
        `Failed to save company research: ${error.message}`,
        "error",
      );
      return {
        success: false,
        dossier,
        error: "Failed to save company research.",
      };
    }

    await logAgent(
      insforge,
      runId,
      userId,
      job.id,
      `Company research completed for ${job.company ?? "company"}`,
      "success",
    );

    return { success: true, dossier };
  } catch (error) {
    console.error("[agent/research]", error);
    const dossier = fallbackDossier(job, profile, {
      homepageUrl: null,
      homepage: null,
      pages: [],
      sources: [],
    });

    await logAgent(
      insforge,
      runId,
      userId,
      job.id,
      `Company research failed: ${errorMessage(error)}`,
      "error",
    );

    const { error: saveError } = await insforge.database
      .from("jobs")
      .update({ company_research: dossier })
      .eq("id", job.id)
      .eq("user_id", userId)
      .eq("status", "active");

    if (saveError) {
      return {
        success: false,
        dossier,
        error: "Failed to save company research.",
      };
    }

    return { success: true, dossier };
  }
}
