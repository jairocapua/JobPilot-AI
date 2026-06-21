import { Stagehand } from "@browserbasehq/stagehand";

export type StagehandClient = InstanceType<typeof Stagehand>;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required.`);
  }
  return value;
}

export async function createStagehandClient(
  browserbaseSessionId: string,
): Promise<StagehandClient> {
  const stagehand = new Stagehand({
    env: "BROWSERBASE",
    apiKey: requireEnv("BROWSERBASE_API_KEY"),
    projectId: requireEnv("BROWSERBASE_PROJECT_ID"),
    browserbaseSessionID: browserbaseSessionId,
    model: {
      modelName: "gpt-4o",
      apiKey: requireEnv("OPENAI_API_KEY"),
    },
    disablePino: true,
  });

  await stagehand.init();
  return stagehand;
}
