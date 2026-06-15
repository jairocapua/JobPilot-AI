import { NextResponse, type NextRequest } from "next/server";
import {
  DEFAULT_ACCESS_TOKEN_COOKIE,
  DEFAULT_REFRESH_TOKEN_COOKIE,
} from "@insforge/sdk/ssr";
import { createInsforgeServer } from "@/lib/insforge-server";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const { origin } = request.nextUrl;

  try {
    const insforge = await createInsforgeServer();
    await insforge.auth.signOut();
  } catch (error) {
    console.error("[api/auth/logout]", error);
  }

  const response = NextResponse.redirect(new URL("/login", origin));
  response.cookies.set(DEFAULT_ACCESS_TOKEN_COOKIE, "", {
    path: "/",
    maxAge: 0,
  });
  response.cookies.set(DEFAULT_REFRESH_TOKEN_COOKIE, "", {
    path: "/",
    maxAge: 0,
  });
  return response;
}
