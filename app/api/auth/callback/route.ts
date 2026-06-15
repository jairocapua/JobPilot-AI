import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, setAuthCookies } from "@insforge/sdk/ssr";
import { PKCE_COOKIE } from "@/lib/auth-constants";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams, origin } = request.nextUrl;

  if (searchParams.get("error")) {
    return NextResponse.redirect(new URL("/login?error=oauth_denied", origin));
  }

  const code = searchParams.get("insforge_code");
  const verifier = request.cookies.get(PKCE_COOKIE)?.value;

  if (!code || !verifier) {
    return NextResponse.redirect(new URL("/login?error=oauth_callback", origin));
  }

  try {
    const insforge = createServerClient({
      baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
      anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
    });

    const { data, error } = await insforge.auth.exchangeOAuthCode(code, verifier);

    if (error || !data?.accessToken) {
      console.error("[api/auth/callback]", error);
      return NextResponse.redirect(new URL("/login?error=oauth_exchange", origin));
    }

    if (!data.refreshToken) {
      console.warn("[api/auth/callback] no refresh token returned — session will not persist");
    }

    const response = NextResponse.redirect(new URL("/dashboard", origin));
    setAuthCookies(response.cookies, {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
    response.cookies.set(PKCE_COOKIE, "", { path: "/", maxAge: 0 });
    return response;
  } catch (error) {
    console.error("[api/auth/callback]", error);
    return NextResponse.redirect(new URL("/login?error=oauth_exchange", origin));
  }
}
