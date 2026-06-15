import { NextResponse, type NextRequest } from "next/server";
import { createInsforgeServer } from "@/lib/insforge-server";
import { PKCE_COOKIE } from "@/lib/auth-constants";

const ALLOWED_PROVIDERS = ["google", "github"] as const;
type Provider = (typeof ALLOWED_PROVIDERS)[number];

function isProvider(value: string): value is Provider {
  return (ALLOWED_PROVIDERS as readonly string[]).includes(value);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
): Promise<NextResponse> {
  const { origin } = request.nextUrl;

  try {
    const { provider } = await params;
    if (!isProvider(provider)) {
      return NextResponse.redirect(new URL("/login?error=invalid_provider", origin));
    }

    const insforge = await createInsforgeServer();
    const { data, error } = await insforge.auth.signInWithOAuth(provider, {
      redirectTo: `${origin}/api/auth/callback`,
      skipBrowserRedirect: true,
      ...(provider === "google"
        ? { additionalParams: { prompt: "select_account" } }
        : {}),
    });

    if (error || !data.url || !data.codeVerifier) {
      console.error("[api/auth/oauth]", error);
      return NextResponse.redirect(new URL("/login?error=oauth_init", origin));
    }

    const response = NextResponse.redirect(data.url);
    response.cookies.set(PKCE_COOKIE, data.codeVerifier, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 600,
    });
    return response;
  } catch (error) {
    console.error("[api/auth/oauth]", error);
    return NextResponse.redirect(new URL("/login?error=oauth_init", origin));
  }
}
