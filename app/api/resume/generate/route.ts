import { NextResponse } from "next/server";
import { createInsforgeServer } from "@/lib/insforge-server";
import { rowToProfileData, type ProfileRow } from "@/lib/profile";
import { generateResumePdf } from "@/agent/generate-resume";

export async function POST() {
  try {
    const insforge = await createInsforgeServer();

    const {
      data: { user },
    } = await insforge.auth.getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated." },
        { status: 401 },
      );
    }

    const { data: row } = await insforge.database
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    const typedRow = row as ProfileRow | null; // SDK returns `any` for database queries
    const profile = rowToProfileData(typedRow);
    if (!profile.email && user.email) {
      profile.email = user.email;
    }

    const result = await generateResumePdf(profile);
    if (!result.success || !result.buffer) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 422 },
      );
    }

    // Remove old PDF from storage — best-effort, ignore errors
    if (typedRow?.resume_pdf_key) {
      await insforge.storage
        .from("resumes")
        .remove(typedRow.resume_pdf_key)
        .catch(() => {});
    }

    const pdfBlob = new Blob([new Uint8Array(result.buffer)], { type: "application/pdf" });
    const { data: uploadData, error: uploadError } = await insforge.storage
      .from("resumes")
      .upload(`resumes/${user.id}/resume.pdf`, pdfBlob);

    if (uploadError || !uploadData) {
      console.error("[api/resume/generate] storage upload failed", uploadError);
      return NextResponse.json(
        { success: false, error: "Failed to upload generated resume." },
        { status: 500 },
      );
    }

    const displayName = profile.fullName?.trim()
      ? `${profile.fullName.trim()} Resume.pdf`
      : "Generated Resume.pdf";

    const { error: dbError } = await insforge.database
      .from("profiles")
      .upsert({
        id: user.id,
        email: user.email ?? null,
        resume_pdf_url: uploadData.url,
        resume_pdf_key: uploadData.key,
        resume_pdf_name: displayName,
      });

    if (dbError) {
      console.error("[api/resume/generate] DB upsert failed", dbError);
      return NextResponse.json(
        { success: false, error: "Resume uploaded but could not save metadata." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      url: uploadData.url,
      key: uploadData.key,
      name: displayName,
    });
  } catch (err) {
    console.error("[api/resume/generate]", err);
    return NextResponse.json(
      { success: false, error: "Resume generation failed. Please try again." },
      { status: 500 },
    );
  }
}
