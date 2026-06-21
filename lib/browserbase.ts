import Browserbase from "@browserbasehq/sdk";

export type BrowserbaseSession = Browserbase.SessionCreateResponse;

type SessionMetadata = Record<string, string>;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required.`);
  }
  return value;
}

function sanitizeMetadataValue(value: string): string {
  const sanitized = value
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);

  return sanitized || "unknown";
}

function sanitizeMetadata(metadata: SessionMetadata): SessionMetadata {
  return Object.fromEntries(
    Object.entries(metadata).map(([key, value]) => [
      key,
      sanitizeMetadataValue(value),
    ]),
  );
}

export async function createCompanyResearchSession(
  metadata: SessionMetadata,
): Promise<BrowserbaseSession> {
  const bb = new Browserbase({
    apiKey: requireEnv("BROWSERBASE_API_KEY"),
  });

  return bb.sessions.create({
    projectId: requireEnv("BROWSERBASE_PROJECT_ID"),
    timeout: 120,
    userMetadata: sanitizeMetadata(metadata),
  });
}
