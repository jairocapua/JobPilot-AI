"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";
import { insforge } from "@/lib/insforge-client";
import { resetPostHog } from "@/lib/posthog-client";

export function LogoutButton(): ReactElement {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [failed, setFailed] = useState(false);

  async function handleLogout(): Promise<void> {
    if (loggingOut) return;

    setLoggingOut(true);
    setFailed(false);

    try {
      const { error } = await insforge.auth.signOut();
      if (error) {
        throw error;
      }

      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout route failed");
      }

      resetPostHog();
      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("[LogoutButton]", error);
      setFailed(true);
      setLoggingOut(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => {
          void handleLogout();
        }}
        disabled={loggingOut}
        className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-secondary hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-60"
        aria-label="Log out"
      >
        {loggingOut ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LogOut className="h-4 w-4" />
        )}
        {failed ? "Try again" : loggingOut ? "Logging out" : "Log out"}
      </button>
      {failed ? (
        <span className="text-xs text-error" role="status">
          Could not log out.
        </span>
      ) : null}
    </div>
  );
}
