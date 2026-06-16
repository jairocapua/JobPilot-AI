import { NextRequest, NextResponse } from "next/server";
import { createInsforgeServer } from "@/lib/insforge-server";
import { extractProfileFromPdf } from "@/agent/extract-resume";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const resumeKey: string | undefined =
      typeof body?.resumeKey === "string" ? body.resumeKey : undefined;

    if (!resumeKey) {
      return NextResponse.json(
        { success: false, error: "resumeKey is required" },
        { status: 400 },
      );
    }

    const insforge = await createInsforgeServer();
    const { data: blob, error: dlError } = await insforge.storage
      .from("resumes")
      .download(resumeKey);

    if (dlError || !blob) {
      return NextResponse.json(
        { success: false, error: "Could not download resume from storage." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await blob.arrayBuffer());
    const result = await extractProfileFromPdf(buffer);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 422 },
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (err) {
    console.error("[api/resume/extract]", err);
    return NextResponse.json(
      { success: false, error: "Extraction failed. Please try again." },
      { status: 500 },
    );
  }
}
