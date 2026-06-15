import { NextResponse, type NextRequest } from "next/server";
import { updateSession, type CookieOptions } from "@insforge/sdk/ssr";

const PROTECTED_ROUTES = ["/dashboard", "/profile", "/find-jobs"];

function isProtected(pathname: string): boolean {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const response = NextResponse.next({ request });

  type CookieArg = { name: string; value: string } & CookieOptions;

  const requestCookies = {
    get: (name: string): string | undefined => request.cookies.get(name)?.value,
    set: (nameOrCookie: string | CookieArg, value?: string): void => {
      if (typeof nameOrCookie === "string") {
        request.cookies.set(nameOrCookie, value ?? "");
      } else {
        request.cookies.set(nameOrCookie);
      }
    },
  };

  const responseCookies = {
    get: (name: string): string | undefined =>
      response.cookies.get(name)?.value,
    set: (
      nameOrCookie: string | CookieArg,
      value?: string,
      options?: CookieOptions,
    ): void => {
      if (typeof nameOrCookie === "string") {
        response.cookies.set(nameOrCookie, value ?? "", options);
      } else {
        response.cookies.set(nameOrCookie);
      }
    },
  };

  const { accessToken } = await updateSession({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
    requestCookies,
    responseCookies,
  });

  if (isProtected(request.nextUrl.pathname) && !accessToken) {
    const redirect = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)$).*)",
  ],
};
