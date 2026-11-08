import { NextRequest, NextResponse } from "next/server";

import { apiFetch } from "@/lib/api";
import {
  OAUTH_STATE_COOKIE,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/session";
import type { TokenResponse } from "@/lib/types";

function failure(request: NextRequest, code: string) {
  const url = new URL("/login", request.nextUrl.origin);
  url.searchParams.set("error", code);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const appUrl = process.env.APP_URL ?? request.nextUrl.origin;

  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const savedState = request.cookies.get(OAUTH_STATE_COOKIE)?.value;

  if (searchParams.get("error") || !code) {
    return failure(request, "google_cancelled");
  }
  if (!clientId || !clientSecret) {
    return failure(request, "google_not_configured");
  }
  if (!state || !savedState || state !== savedState) {
    return failure(request, "google_state_mismatch");
  }

  let idToken: string;
  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${appUrl}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
      cache: "no-store",
    });

    if (!tokenResponse.ok) {
      return failure(request, "google_token_exchange_failed");
    }

    const tokens = (await tokenResponse.json()) as { id_token?: string };
    if (!tokens.id_token) {
      return failure(request, "google_token_exchange_failed");
    }
    idToken = tokens.id_token;
  } catch {
    return failure(request, "google_unreachable");
  }

  let session: TokenResponse;
  try {
    session = await apiFetch<TokenResponse>("/api/auth/google", {
      method: "POST",
      body: { id_token: idToken },
    });
  } catch {
    return failure(request, "google_backend_failed");
  }

  const response = NextResponse.redirect(
    new URL("/dashboard", request.nextUrl.origin),
  );
  response.cookies.set(SESSION_COOKIE, session.access_token, sessionCookieOptions);
  response.cookies.delete(OAUTH_STATE_COOKIE);
  return response;
}
