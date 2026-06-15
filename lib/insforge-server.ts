import { createServerClient } from "@insforge/sdk/ssr";
import type { InsForgeClient } from "@insforge/sdk";
import { cookies } from "next/headers";

export const createInsforgeServer = async (): Promise<InsForgeClient> => {
  return createServerClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
    cookies: await cookies(),
  });
};
