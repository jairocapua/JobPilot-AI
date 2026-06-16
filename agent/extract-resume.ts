import OpenAI from "openai";
import { PDFParse } from "pdf-parse";
import type { ProfileData, WorkExperience, ProfileEducation } from "@/types";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const SYSTEM_PROMPT = `You are a resume parser. Extract structured profile data from the resume text.
Return a JSON object. Include only these keys if you can extract them confidently:
- fullName: string
- phone: string
- location: string (city and state, or city and country)
- linkedinUrl: string (full URL)
- portfolioUrl: string (full URL — portfolio or personal site only, not LinkedIn)
- currentTitle: string (most recent job title)
- yearsExperience: string (numeric string e.g. "5")
- experienceLevel: string (one of: "Entry", "Mid", "Senior", "Lead" — infer from title and years)
- skills: string[] (technical skills, tools, languages — max 20)
- industries: string[] (industries the candidate has worked in — max 5)
- workExperience: array of up to 3 most recent positions, each:
  { company: string, title: string, startDate: string (YYYY-MM), endDate: string (YYYY-MM or ""), currentlyWorking: boolean, responsibilities: string (1-2 sentence summary) }
- education: { degree: string, fieldOfStudy: string, institution: string, graduationYear: string (4-digit year as string) }

Omit any key you cannot extract confidently. Return {} if the text has no usable data.`;

type RawExtracted = {
  fullName?: string;
  phone?: string;
  location?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  currentTitle?: string;
  yearsExperience?: string | number;
  experienceLevel?: string;
  skills?: unknown[];
  industries?: unknown[];
  workExperience?: Partial<WorkExperience>[];
  education?: Partial<ProfileEducation>;
};

const VALID_EXPERIENCE_LEVELS = new Set(["Entry", "Mid", "Senior", "Lead"]);

export async function extractProfileFromPdf(
  pdfBuffer: Buffer,
): Promise<{ success: boolean; data?: Partial<ProfileData>; error?: string }> {
  try {
    const parser = new PDFParse({ data: new Uint8Array(pdfBuffer) });
    let text: string;
    try {
      const textResult = await parser.getText();
      text = textResult.text?.trim() ?? "";
    } finally {
      await parser.destroy();
    }

    if (text.length < 50) {
      return {
        success: false,
        error:
          "Could not extract text from this PDF. Please try a different file.",
      };
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 800,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: text },
      ],
    });

    let raw: RawExtracted;
    try {
      raw = JSON.parse(response.choices[0].message.content!) as RawExtracted;
    } catch {
      return { success: true, data: {} };
    }

    const result: Partial<ProfileData> = {};

    if (raw.fullName) result.fullName = raw.fullName;
    if (raw.phone) result.phone = raw.phone;
    if (raw.location) result.location = raw.location;
    if (raw.linkedinUrl) result.linkedinUrl = raw.linkedinUrl;
    if (raw.portfolioUrl) result.portfolioUrl = raw.portfolioUrl;
    if (raw.currentTitle) result.currentTitle = raw.currentTitle;
    if (raw.yearsExperience != null)
      result.yearsExperience = String(raw.yearsExperience);
    if (
      raw.experienceLevel &&
      VALID_EXPERIENCE_LEVELS.has(raw.experienceLevel)
    ) {
      result.experienceLevel = raw.experienceLevel;
    }
    if (Array.isArray(raw.skills) && raw.skills.length > 0) {
      result.skills = raw.skills.map(String).slice(0, 20);
    }
    if (Array.isArray(raw.industries) && raw.industries.length > 0) {
      result.industries = raw.industries.map(String).slice(0, 5);
    }
    if (Array.isArray(raw.workExperience) && raw.workExperience.length > 0) {
      result.workExperience = raw.workExperience.slice(0, 3).map((w) => ({
        company: String(w.company ?? ""),
        title: String(w.title ?? ""),
        startDate: String(w.startDate ?? ""),
        endDate: String(w.endDate ?? ""),
        currentlyWorking: Boolean(w.currentlyWorking),
        responsibilities: String(w.responsibilities ?? ""),
      }));
    }
    if (raw.education && typeof raw.education === "object") {
      result.education = {
        degree: String(raw.education.degree ?? ""),
        fieldOfStudy: String(raw.education.fieldOfStudy ?? ""),
        institution: String(raw.education.institution ?? ""),
        graduationYear: String(raw.education.graduationYear ?? ""),
      };
    }

    return { success: true, data: result };
  } catch (err) {
    console.error("[agent/extract-resume]", err);
    return { success: false, error: "Extraction failed. Please try again." };
  }
}
