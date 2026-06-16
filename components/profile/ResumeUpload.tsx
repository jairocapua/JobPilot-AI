"use client";

import { useRef, useState } from "react";
import { CloudUpload, Sparkles, FileText, Loader2 } from "lucide-react";
import { insforge } from "@/lib/insforge-client";
import { saveResumeUrl } from "@/actions/profile";
import type { ProfileData } from "@/types";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB

type Props = {
  userId: string;
  resumePdfUrl: string | null;
  resumePdfKey: string | null;
  resumePdfName: string | null;
  onExtract?: (data: Partial<ProfileData>) => void;
};

export function ResumeUpload({
  userId,
  resumePdfUrl,
  resumePdfKey,
  resumePdfName,
  onExtract,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState<string | null>(resumePdfUrl);
  const [key, setKey] = useState<string | null>(resumePdfKey);
  const [fileName, setFileName] = useState<string | null>(
    resumePdfName ?? (resumePdfUrl ? "resume.pdf" : null),
  );
  const [uploading, setUploading] = useState(false);
  const [viewing, setViewing] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleViewResume() {
    if (!key || viewing) return;
    setViewing(true);
    try {
      const { data: blob, error: dlError } = await insforge.storage
        .from("resumes")
        .download(key);
      if (dlError || !blob) {
        setError("Could not load the resume. Please try again.");
        return;
      }
      const pdfBlob = new Blob([blob], { type: "application/pdf" });
      const objectUrl = URL.createObjectURL(pdfBlob);
      const win = window.open(objectUrl, "_blank");
      // Revoke after the tab has had time to read the blob.
      setTimeout(() => URL.revokeObjectURL(objectUrl), 30_000);
      if (!win) setError("Popup blocked. Please allow popups for this site.");
    } catch (err) {
      console.error("[ResumeUpload] handleViewResume", err);
      setError("Could not load the resume. Please try again.");
    } finally {
      setViewing(false);
    }
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);

    if (file.type !== "application/pdf") {
      setError("Please select a PDF file.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("File is too large. Maximum size is 5MB.");
      return;
    }

    setUploading(true);
    try {
      // Remove the previous resume first — the SDK auto-renames on key
      // collision, so deleting by key keeps a single resume per user.
      if (key) {
        await insforge.storage.from("resumes").remove(key);
      }

      const { data, error: uploadError } = await insforge.storage
        .from("resumes")
        .upload(`resumes/${userId}/resume.pdf`, file);

      if (uploadError || !data) {
        setError(uploadError?.message ?? "Upload failed. Please try again.");
        return;
      }

      const result = await saveResumeUrl(data.url, data.key, file.name);
      if (!result.success) {
        setError(result.error ?? "Could not save the resume.");
        return;
      }

      setUrl(data.url);
      setKey(data.key);
      setFileName(file.name);
    } catch (err) {
      console.error("[ResumeUpload] handleFile", err);
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleGenerate() {
    if (generating) return;
    setError(null);
    setGenerating(true);
    try {
      const res = await fetch("/api/resume/generate", { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error ?? "Generation failed. Please try again.");
        return;
      }
      setUrl(json.url);
      setKey(json.key);
      setFileName(json.name);
    } catch (err) {
      console.error("[ResumeUpload] handleGenerate", err);
      setError("Generation failed. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleExtract() {
    if (!key || extracting) return;
    setError(null);
    setExtracting(true);
    try {
      const res = await fetch("/api/resume/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeKey: key }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error ?? "Extraction failed. Please try again.");
        return;
      }
      onExtract?.(json.data);
    } catch (err) {
      console.error("[ResumeUpload] handleExtract", err);
      setError("Extraction failed. Please try again.");
    } finally {
      setExtracting(false);
    }
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
      <h2 className="text-base font-semibold text-text-primary mb-1">Resume</h2>
      <p className="text-sm text-text-secondary mb-4">
        Upload an existing resume to auto-fill the profile, or generate a new
        tailored one from your details below.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          // Reset so the same file can be re-selected on a subsequent click.
          e.target.value = "";
        }}
      />

      {url && !uploading ? (
        <div className="flex items-center justify-between gap-4 border border-border rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <FileText className="h-5 w-5 text-accent flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">
                {fileName ?? "resume.pdf"}
              </p>
              <button
                type="button"
                onClick={handleViewResume}
                disabled={viewing}
                className="text-xs text-accent hover:opacity-80 transition-opacity disabled:opacity-50"
              >
                {viewing ? "Loading…" : "View resume"}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={handleExtract}
              disabled={extracting}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded-md text-sm font-medium text-text-primary bg-surface hover:bg-surface-secondary transition-colors whitespace-nowrap disabled:opacity-50"
            >
              {extracting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {extracting ? "Extracting…" : "Extract Profile"}
            </button>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-4 py-2 border border-border rounded-md text-sm font-medium text-text-primary bg-surface hover:bg-surface-secondary transition-colors whitespace-nowrap"
            >
              Replace
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (!uploading) handleFile(e.dataTransfer.files?.[0]);
          }}
          className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center gap-2 mb-4 cursor-pointer hover:border-accent transition-colors"
        >
          {uploading ? (
            <>
              <Loader2 className="h-8 w-8 text-accent animate-spin" />
              <p className="text-sm font-medium text-text-primary">Uploading…</p>
            </>
          ) : (
            <>
              <CloudUpload className="h-8 w-8 text-text-muted" />
              <p className="text-sm font-medium text-text-primary">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-text-muted">
                PDF formatting only. Maximum file size 5MB.
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current?.click();
                }}
                className="mt-2 px-4 py-2 border border-border rounded-md text-sm font-medium text-text-primary bg-surface hover:bg-surface-secondary transition-colors"
              >
                Select Resume
              </button>
            </>
          )}
        </div>
      )}

      {error && <p className="text-sm text-error mb-4">{error}</p>}

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-text-secondary">
          Need a fresh document based on the fields below?
        </p>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground text-sm font-medium rounded-md hover:opacity-90 transition-opacity whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {generating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {generating ? "Generating…" : "Generate Resume from Profile"}
        </button>
      </div>
    </div>
  );
}
