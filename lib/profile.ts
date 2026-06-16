import type { ProfileData, WorkExperience, ProfileEducation } from "@/types";

/**
 * Shape of a `profiles` row as returned by the InsForge database SDK
 * (snake_case columns). Only the fields Feature 06 reads/writes are typed.
 */
export type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  current_title: string | null;
  experience_level: string | null;
  years_experience: number | null;
  skills: string[] | null;
  industries: string[] | null;
  work_experience: WorkExperience[] | null;
  education: ProfileEducation | null;
  job_titles_seeking: string[] | null;
  remote_preference: string | null;
  preferred_locations: string[] | null;
  salary_expectation: string | null;
  cover_letter_tone: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  work_authorization: string | null;
  resume_pdf_url: string | null;
  resume_pdf_key: string | null;
  resume_pdf_name: string | null;
  is_complete: boolean | null;
};

const EMPTY_EDUCATION: ProfileEducation = {
  degree: "",
  fieldOfStudy: "",
  institution: "",
  graduationYear: "",
};

/** "React, TypeScript , Next.js" -> ["React", "TypeScript", "Next.js"] */
function splitCsv(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Empty string -> null, so text columns stay clean. */
function orNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

// ─────────────────────────────────────────────────────────────
// Completion — derived, never stored (only `is_complete` persists)
// ─────────────────────────────────────────────────────────────

/**
 * The "Core 10" required fields. `label` is the UPPERCASE tag rendered by
 * CompletionIndicator; `filled` decides whether the field counts as complete.
 */
const REQUIRED_FIELDS: { label: string; filled: (p: ProfileData) => boolean }[] =
  [
    { label: "FULL NAME", filled: (p) => p.fullName.trim().length > 0 },
    { label: "PHONE", filled: (p) => p.phone.trim().length > 0 },
    { label: "LOCATION", filled: (p) => p.location.trim().length > 0 },
    { label: "JOB TITLE", filled: (p) => p.currentTitle.trim().length > 0 },
    {
      label: "EXPERIENCE LEVEL",
      filled: (p) => p.experienceLevel.trim().length > 0,
    },
    { label: "SKILLS", filled: (p) => p.skills.length > 0 },
    {
      label: "WORK EXPERIENCE",
      filled: (p) =>
        p.workExperience.some(
          (r) => r.company.trim().length > 0 && r.title.trim().length > 0,
        ),
    },
    {
      label: "EDUCATION",
      filled: (p) =>
        p.education.degree.trim().length > 0 &&
        p.education.institution.trim().length > 0,
    },
    {
      label: "WORK AUTHORIZATION",
      filled: (p) => p.workAuthorization.trim().length > 0,
    },
    {
      label: "REMOTE PREFERENCE",
      filled: (p) => p.remotePreference.trim().length > 0,
    },
  ];

export type Completion = {
  percent: number;
  missingFields: string[];
  isComplete: boolean;
};

/** Pure: computes completion percentage + missing tags from form data. */
export function computeCompletion(profile: ProfileData): Completion {
  const missingFields = REQUIRED_FIELDS.filter(
    (f) => !f.filled(profile),
  ).map((f) => f.label);
  const filledCount = REQUIRED_FIELDS.length - missingFields.length;
  const percent = Math.round((filledCount / REQUIRED_FIELDS.length) * 100);
  return { percent, missingFields, isComplete: missingFields.length === 0 };
}

// ─────────────────────────────────────────────────────────────
// Mapping — DB row <-> form data
// ─────────────────────────────────────────────────────────────

/**
 * DB row (snake_case) -> form data (camelCase). Null-safe: a user may have no
 * profile row yet (the auth trigger's insert is best-effort), so `null` yields
 * an empty form. Seed `email` from auth separately at the call site.
 */
export function rowToProfileData(row: ProfileRow | null): ProfileData {
  return {
    fullName: row?.full_name ?? "",
    email: row?.email ?? "",
    phone: row?.phone ?? "",
    location: row?.location ?? "",
    linkedinUrl: row?.linkedin_url ?? "",
    portfolioUrl: row?.portfolio_url ?? "",
    workAuthorization: row?.work_authorization ?? "",
    currentTitle: row?.current_title ?? "",
    experienceLevel: row?.experience_level ?? "",
    yearsExperience:
      row?.years_experience != null ? String(row.years_experience) : "",
    skills: row?.skills ?? [],
    industries: row?.industries ?? [],
    workExperience: row?.work_experience ?? [],
    education: row?.education ?? { ...EMPTY_EDUCATION },
    jobTitlesSeeking: (row?.job_titles_seeking ?? []).join(", "),
    remotePreference: row?.remote_preference ?? "",
    salaryExpectation: row?.salary_expectation ?? "",
    preferredLocations: (row?.preferred_locations ?? []).join(", "),
    coverLetterTone: row?.cover_letter_tone ?? "",
    resumePdfUrl: row?.resume_pdf_url ?? null,
    resumePdfName: row?.resume_pdf_name ?? null,
    isComplete: row?.is_complete ?? false,
  };
}

/**
 * Form data (camelCase) -> DB row columns (snake_case) for an UPDATE.
 * Excludes id, email (read-only), and resume_pdf_url/key (written separately).
 */
export function profileDataToRow(form: ProfileData): Record<string, unknown> {
  const years = parseInt(form.yearsExperience, 10);
  return {
    full_name: orNull(form.fullName),
    phone: orNull(form.phone),
    location: orNull(form.location),
    current_title: orNull(form.currentTitle),
    experience_level: orNull(form.experienceLevel),
    years_experience: Number.isNaN(years) ? null : years,
    skills: form.skills,
    industries: form.industries,
    work_experience: form.workExperience,
    education: form.education,
    job_titles_seeking: splitCsv(form.jobTitlesSeeking),
    remote_preference: orNull(form.remotePreference),
    preferred_locations: splitCsv(form.preferredLocations),
    salary_expectation: orNull(form.salaryExpectation),
    cover_letter_tone: orNull(form.coverLetterTone),
    linkedin_url: orNull(form.linkedinUrl),
    portfolio_url: orNull(form.portfolioUrl),
    work_authorization: orNull(form.workAuthorization),
    is_complete: computeCompletion(form).isComplete,
  };
}
