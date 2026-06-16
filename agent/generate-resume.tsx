import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import OpenAI from "openai";
import type { ProfileData } from "@/types";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

type AiContent = {
  summary: string;
  workBullets: Record<string, string[]>;
};

// Module-level client — consistent with extract-resume.ts pattern
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

// ─────────────────────────────────────────────────────────────
// Styles — only supported @react-pdf/renderer CSS properties.
// flex/flexGrow are supported via yoga layout.
// Border directions use individual properties (not CSS shorthand).
// ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    padding: 40,
    fontSize: 10,
    color: "#1a1a1a",
  },
  header: {
    marginBottom: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 2,
  },
  currentTitle: {
    fontSize: 12,
    color: "#555555",
    marginBottom: 6,
  },
  contactRow: {
    flexDirection: "row",
    fontSize: 9,
    color: "#555555",
  },
  contactRowLinks: {
    flexDirection: "row",
    fontSize: 9,
    color: "#555555",
    marginTop: 2,
  },
  contactItem: {
    marginRight: 12,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: "bold",
    // Individual border properties — @react-pdf/renderer does not parse
    // CSS shorthand (e.g. "1pt solid #ccc") for directional borders.
    borderBottomWidth: 1,
    borderBottomColor: "#cccccc",
    borderBottomStyle: "solid",
    paddingBottom: 2,
    marginTop: 14,
    marginBottom: 6,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 1,
  },
  entryCompany: {
    fontSize: 10,
    fontWeight: "bold",
  },
  entryDates: {
    fontSize: 9,
    color: "#555555",
  },
  entryTitle: {
    fontSize: 10,
    marginBottom: 4,
  },
  workEntry: {
    marginBottom: 8,
  },
  bullet: {
    flexDirection: "row",
    marginBottom: 2,
  },
  bulletDot: {
    width: 12,
    fontSize: 9,
    color: "#333333",
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.4,
  },
  skillsRow: {
    flexDirection: "row",
    fontSize: 9,
    lineHeight: 1.4,
  },
  summaryText: {
    fontSize: 9,
    lineHeight: 1.5,
  },
});

// ─────────────────────────────────────────────────────────────
// PDF component — @react-pdf/renderer primitives only
// ─────────────────────────────────────────────────────────────

const ResumePdf = ({
  profile,
  ai,
}: {
  profile: ProfileData;
  ai: AiContent;
}) => {
  const contactParts: string[] = [];
  if (profile.email) contactParts.push(profile.email);
  if (profile.phone) contactParts.push(profile.phone);
  if (profile.location) contactParts.push(profile.location);

  const linkParts: string[] = [];
  if (profile.linkedinUrl) linkParts.push(profile.linkedinUrl);
  if (profile.portfolioUrl) linkParts.push(profile.portfolioUrl);

  const hasEducation =
    profile.education.degree.trim().length > 0 ||
    profile.education.institution.trim().length > 0;

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{profile.fullName}</Text>
          {profile.currentTitle ? (
            <Text style={styles.currentTitle}>{profile.currentTitle}</Text>
          ) : null}
          {contactParts.length > 0 ? (
            <View style={styles.contactRow}>
              {contactParts.map((part, i) => (
                <Text key={i} style={styles.contactItem}>
                  {part}
                </Text>
              ))}
            </View>
          ) : null}
          {linkParts.length > 0 ? (
            <View style={styles.contactRowLinks}>
              {linkParts.map((link, i) => (
                <Text key={i} style={styles.contactItem}>
                  {link}
                </Text>
              ))}
            </View>
          ) : null}
        </View>

        {/* Professional Summary */}
        {ai.summary ? (
          <View>
            <Text style={styles.sectionHeading}>Professional Summary</Text>
            <Text style={styles.summaryText}>{ai.summary}</Text>
          </View>
        ) : null}

        {/* Work Experience */}
        {profile.workExperience.length > 0 ? (
          <View>
            <Text style={styles.sectionHeading}>Work Experience</Text>
            {profile.workExperience.map((exp, i) => {
              const bullets: string[] = ai.workBullets[String(i)]?.length
                ? ai.workBullets[String(i)]
                : exp.responsibilities
                  ? [exp.responsibilities]
                  : [];
              const dateRange = exp.currentlyWorking
                ? `${exp.startDate} – Present`
                : exp.startDate && exp.endDate
                  ? `${exp.startDate} – ${exp.endDate}`
                  : exp.startDate || "";
              return (
                <View key={i} style={styles.workEntry}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryCompany}>{exp.company}</Text>
                    <Text style={styles.entryDates}>{dateRange}</Text>
                  </View>
                  <Text style={styles.entryTitle}>{exp.title}</Text>
                  {bullets.map((b, j) => (
                    <View key={j} style={styles.bullet}>
                      <Text style={styles.bulletDot}>•</Text>
                      <Text style={styles.bulletText}>{b}</Text>
                    </View>
                  ))}
                </View>
              );
            })}
          </View>
        ) : null}

        {/* Education */}
        {hasEducation ? (
          <View>
            <Text style={styles.sectionHeading}>Education</Text>
            <View style={styles.entryHeader}>
              <Text style={styles.entryCompany}>
                {profile.education.institution}
              </Text>
              {profile.education.graduationYear ? (
                <Text style={styles.entryDates}>
                  {profile.education.graduationYear}
                </Text>
              ) : null}
            </View>
            <Text style={styles.entryTitle}>
              {[profile.education.degree, profile.education.fieldOfStudy]
                .filter(Boolean)
                .join(", ")}
            </Text>
          </View>
        ) : null}

        {/* Skills */}
        {profile.skills.length > 0 ? (
          <View>
            <Text style={styles.sectionHeading}>Skills</Text>
            <View style={styles.skillsRow}>
              <Text>{profile.skills.join("  •  ")}</Text>
            </View>
          </View>
        ) : null}
      </Page>
    </Document>
  );
};

// ─────────────────────────────────────────────────────────────
// GPT-4o content generation
// ─────────────────────────────────────────────────────────────

async function generateAiContent(profile: ProfileData): Promise<AiContent> {
  const workLines = profile.workExperience
    .map(
      (exp, i) =>
        `[${i}] ${exp.title} at ${exp.company} (${exp.startDate}–${exp.currentlyWorking ? "Present" : exp.endDate}): ${exp.responsibilities}`,
    )
    .join("\n");

  const userContent = [
    `Name: ${profile.fullName}`,
    profile.currentTitle ? `Current title: ${profile.currentTitle}` : "",
    profile.experienceLevel
      ? `Experience level: ${profile.experienceLevel}`
      : "",
    profile.yearsExperience
      ? `Years of experience: ${profile.yearsExperience}`
      : "",
    profile.skills.length ? `Skills: ${profile.skills.join(", ")}` : "",
    profile.industries.length
      ? `Industries: ${profile.industries.join(", ")}`
      : "",
    workLines ? `Work experience:\n${workLines}` : "",
    profile.education.degree || profile.education.institution
      ? `Education: ${[profile.education.degree, profile.education.fieldOfStudy, profile.education.institution, profile.education.graduationYear].filter(Boolean).join(", ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.7,
    max_tokens: 1000,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a professional resume writer. Given a candidate's profile, produce:
1. A 2-3 sentence professional summary highlighting their experience level, key skills, and career focus.
2. For each work experience entry (identified by its [index]), 2-3 polished bullet points starting with strong action verbs.

Return ONLY valid JSON in this exact shape:
{
  "summary": "<2-3 sentence summary>",
  "workBullets": {
    "0": ["bullet 1", "bullet 2"],
    "1": ["bullet 1", "bullet 2"]
  }
}
Only include keys in workBullets that correspond to provided work entries. Return {} for workBullets if there are none.`,
      },
      { role: "user", content: userContent },
    ],
  });

  const raw = response.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw) as {
    summary?: unknown;
    workBullets?: unknown;
  };

  return {
    summary: typeof parsed.summary === "string" ? parsed.summary : "",
    workBullets:
      parsed.workBullets &&
      typeof parsed.workBullets === "object" &&
      !Array.isArray(parsed.workBullets)
        ? (parsed.workBullets as Record<string, string[]>)
        : {},
  };
}

// ─────────────────────────────────────────────────────────────
// Public agent function
// ─────────────────────────────────────────────────────────────

export async function generateResumePdf(
  profile: ProfileData,
): Promise<{ success: boolean; buffer?: Buffer; error?: string }> {
  try {
    const hasName = profile.fullName.trim().length > 0;
    const hasWork = profile.workExperience.some(
      (exp) => exp.company.trim().length > 0 && exp.title.trim().length > 0,
    );

    if (!hasName || !hasWork) {
      return {
        success: false,
        error:
          "Please add your name and at least one work experience entry before generating a resume.",
      };
    }

    let ai: AiContent = { summary: "", workBullets: {} };
    try {
      ai = await generateAiContent(profile);
    } catch (aiErr) {
      console.error(
        "[agent/generate-resume] GPT-4o call failed, using fallback",
        aiErr,
      );
    }

    const buffer = await renderToBuffer(<ResumePdf profile={profile} ai={ai} />);
    return { success: true, buffer: Buffer.from(buffer) };
  } catch (err) {
    console.error("[agent/generate-resume]", err);
    return {
      success: false,
      error: "Resume generation failed. Please try again.",
    };
  }
}
