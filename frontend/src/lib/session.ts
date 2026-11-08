import { cookies } from "next/headers";
import { cache } from "react";

import { apiFetch } from "@/lib/api";
import type { User } from "@/lib/types";

export const SESSION_COOKIE = "mysolar_session";
export const OAUTH_STATE_COOKIE = "mysolar_oauth_state";

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  // Secure only when the public app URL is HTTPS, so local `next start`
  // over http://localhost still receives the cookie.
  secure: (process.env.APP_URL ?? "").startsWith("https://"),
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

export const getSession = cache(async () => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }

  try {
    const user = await apiFetch<User>("/api/auth/me", { token });
    return { token, user };
  } catch {
    return null;
  }
});
