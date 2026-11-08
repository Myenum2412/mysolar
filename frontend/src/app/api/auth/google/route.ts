import { NextRequest, NextResponse } from "next/server";

import { OAUTH_STATE_COOKIE } from "@/lib/session";

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const appUrl = process.env.APP_URL ?? request.nextUrl.origin;

  if (!clientId) {
    return NextResponse.redirect(
      new URL("/login?error=google_not_configured", request.nextUrl.origin),
    );
  }

  const state = crypto.randomUUID();
  const authorizationUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authorizationUrl.searchParams.set("client_id", clientId);
  authorizationUrl.searchParams.set(
    "redirect_uri",
    `${appUrl}/api/auth/google/callback`,
  );
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("scope", "openid email profile");
  authorizationUrl.searchParams.set("state", state);
  authorizationUrl.searchParams.set("prompt", "select_account");

  const response = NextResponse.redirect(authorizationUrl);
  response.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: (process.env.APP_URL ?? "").startsWith("https://"),
    path: "/",
    maxAge: 60 * 10,
  });
  return response;
}
