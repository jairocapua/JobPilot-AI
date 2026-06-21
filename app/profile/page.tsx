import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { CompletionIndicator } from "@/components/profile/CompletionIndicator";
import { ProfileBody } from "@/components/profile/ProfileBody";
import { createInsforgeServer } from "@/lib/insforge-server";
import {
  rowToProfileData,
  computeCompletion,
  type ProfileRow,
} from "@/lib/profile";

export default async function ProfilePage() {
  const insforge = await createInsforgeServer();

  const {
    data: { user },
  } = await insforge.auth.getCurrentUser();
  if (!user) redirect("/login");

  const { data: row } = await insforge.database
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  // SDK's .maybeSingle() returns `any`; cast is the only path to type safety here.
  const typedRow = (row as ProfileRow | null) ?? null;
  const profile = rowToProfileData(typedRow);
  // A user may have no row yet — keep the authoritative email visible.
  if (!profile.email) profile.email = user.email ?? "";
  const { percent, missingFields } = computeCompletion(profile);

  return (
    <>
      <Navbar showCta={false} showLogout />
      <main className="min-h-screen bg-background">
        <div className="max-w-[1440px] mx-auto px-8 py-8">
          <div className="max-w-[800px] mx-auto flex flex-col gap-6">
            <CompletionIndicator percent={percent} missingFields={missingFields} />
            <ProfileBody
              initialData={profile}
              userId={user.id}
              resumePdfKey={typedRow?.resume_pdf_key ?? null}
            />
          </div>
        </div>
      </main>
    </>
  );
}
