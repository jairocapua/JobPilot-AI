import Image from "next/image";
import { redirect } from "next/navigation";
import { createInsforgeServer } from "@/lib/insforge-server";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

const ERROR_MESSAGES: Record<string, string> = {
  oauth_denied: "Sign-in was cancelled. Please try again.",
  oauth_init: "Could not start sign-in. Please try again.",
  oauth_callback: "Sign-in could not be completed. Please try again.",
  oauth_exchange: "Sign-in could not be completed. Please try again.",
  invalid_provider: "Unknown sign-in method.",
};

export default async function LoginPage({ searchParams }: Props) {
  const insforge = await createInsforgeServer();
  const {
    data: { user },
  } = await insforge.auth.getCurrentUser();
  if (user) redirect("/dashboard");

  const { error } = await searchParams;
  const errorMessage = error
    ? (ERROR_MESSAGES[error] ?? "Something went wrong. Please try again.")
    : null;

  return (
    <main className="flex-1 flex items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-sm bg-surface border border-border rounded-2xl p-8 shadow-sm text-center">
        <Image
          src="/logo.png"
          alt="JobPilot"
          width={120}
          height={30}
          className="h-7 w-auto mx-auto mb-6"
        />

        <h1 className="text-2xl font-bold text-text-primary mb-2 tracking-tight">
          Welcome to JobPilot
        </h1>
        <p className="text-sm text-text-secondary mb-8 leading-relaxed">
          Sign in to discover, score, and research your next role.
        </p>

        {errorMessage && (
          <p className="mb-6 text-sm text-error bg-surface-secondary border border-border rounded-md px-3 py-2">
            {errorMessage}
          </p>
        )}

        <div className="flex flex-col gap-3">
          <form action="/api/auth/oauth/google" method="GET">
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-3 bg-surface border border-border text-text-primary text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-surface-secondary transition-colors"
            >
              <GoogleIcon />
              Continue with Google
            </button>
          </form>
          <form action="/api/auth/oauth/github" method="GET">
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-3 bg-overlay-dark text-overlay-foreground text-sm font-medium px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
            >
              <GitHubIcon />
              Continue with GitHub
            </button>
          </form>
        </div>

        <p className="text-xs text-text-muted mt-8 leading-relaxed">
          By continuing you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </main>
  );
}

// Brand logos use each provider's official fixed colors — exempt from the
// project theme-token rule, which governs app UI colors, not third-party marks.
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}
