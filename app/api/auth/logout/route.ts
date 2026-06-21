import { NextResponse } from "next/server";
import { clearAuthCookies } from "@insforge/sdk/ssr";

export async function POST(): Promise<NextResponse> {
  try {
    const response = NextResponse.json({ success: true });
    clearAuthCookies(response.cookies);
    return response;
  } catch (error) {
    console.error("[auth/logout]", error);
    const response = NextResponse.json(
      { success: false, error: "Failed to log out" },
      { status: 500 },
    );
    clearAuthCookies(response.cookies);
    return response;
  }
}
