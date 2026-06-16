"use server";

import { revalidatePath } from "next/cache";
import { createInsforgeServer } from "@/lib/insforge-server";
import { createPostHogServer } from "@/lib/posthog-server";
import { profileDataToRow } from "@/lib/profile";
import type { ProfileData } from "@/types";

export type SaveResult = { success: boolean; error: string | null };

/**
 * Persist all profile form fields to the user's `profiles` row. Uses upsert
 * (conflict on the `id` primary key): the row normally exists from the
 * `on_auth_user_created` trigger, but that insert is best-effort, so upsert
 * guarantees a write instead of a silent 0-row UPDATE. Sets is_complete via the
 * shared completion logic. The resume PDF is handled by saveResumeUrl.
 */
export async function saveProfile(form: ProfileData): Promise<SaveResult> {
  try {
    const insforge = await createInsforgeServer();

    const {
      data: { user },
    } = await insforge.auth.getCurrentUser();
    if (!user) return { success: false, error: "Not authenticated." };

    // Read the current is_complete before writing so we can detect the
    // first-time completion transition and fire the profile_completed event.
    const { data: existing } = await insforge.database
      .from("profiles")
      .select("is_complete")
      .eq("id", user.id)
      .maybeSingle();
    const wasComplete = (existing as { is_complete: boolean | null } | null)
      ?.is_complete ?? false;

    const row = profileDataToRow(form);

    const { error } = await insforge.database.from("profiles").upsert({
      id: user.id,
      email: user.email ?? null,
      ...row,
    });

    if (error) return { success: false, error: error.message };

    // Fire profile_completed exactly once — when is_complete flips to true.
    if (!wasComplete && (row.is_complete as boolean)) {
      const posthog = createPostHogServer();
      posthog.capture({ distinctId: user.id, event: "profile_completed" });
      await posthog.shutdown();
    }

    revalidatePath("/profile");
    return { success: true, error: null };
  } catch (error) {
    console.error("[actions/profile] saveProfile", error);
    return { success: false, error: "Failed to save profile." };
  }
}

/**
 * Persist the uploaded resume's storage URL + key after a client-side upload.
 * Both are stored so re-uploads can remove the prior object by its key.
 */
export async function saveResumeUrl(
  url: string,
  key: string,
  name: string,
): Promise<SaveResult> {
  try {
    const insforge = await createInsforgeServer();

    const {
      data: { user },
    } = await insforge.auth.getCurrentUser();
    if (!user) return { success: false, error: "Not authenticated." };

    const { error } = await insforge.database.from("profiles").upsert({
      id: user.id,
      email: user.email ?? null,
      resume_pdf_url: url,
      resume_pdf_key: key,
      resume_pdf_name: name,
    });

    if (error) return { success: false, error: error.message };

    revalidatePath("/profile");
    return { success: true, error: null };
  } catch (error) {
    console.error("[actions/profile] saveResumeUrl", error);
    return { success: false, error: "Failed to save resume." };
  }
}
