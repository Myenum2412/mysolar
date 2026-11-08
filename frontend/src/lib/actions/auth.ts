"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ApiError, apiFetch } from "@/lib/api";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";
import type { TokenResponse } from "@/lib/types";

export type AuthState = {
  error?: string;
  message?: string;
  resetUrl?: string;
};

function field(formData: FormData, name: string) {
  return (formData.get(name) ?? "").toString().trim();
}

function errorMessage(error: unknown) {
  return error instanceof ApiError
    ? error.message
    : "Unable to reach the authentication server. Is the API running?";
}

export async function loginAction(
  _previous: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = field(formData, "email").toLowerCase();
  const password = (formData.get("password") ?? "").toString();

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  let data: TokenResponse;
  try {
    data = await apiFetch<TokenResponse>("/api/auth/login", {
      method: "POST",
      body: { email, password },
    });
  } catch (error) {
    return { error: errorMessage(error) };
  }

  (await cookies()).set(SESSION_COOKIE, data.access_token, sessionCookieOptions);
  redirect("/dashboard");
}

export async function signupAction(
  _previous: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const fullName = field(formData, "full_name");
  const email = field(formData, "email").toLowerCase();
  const password = (formData.get("password") ?? "").toString();
  const confirmPassword = (formData.get("confirm_password") ?? "").toString();

  if (!email || !password) {
    return { error: "Email and password are required." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  let data: TokenResponse;
  try {
    data = await apiFetch<TokenResponse>("/api/auth/register", {
      method: "POST",
      body: { email, password, full_name: fullName || null },
    });
  } catch (error) {
    return { error: errorMessage(error) };
  }

  (await cookies()).set(SESSION_COOKIE, data.access_token, sessionCookieOptions);
  redirect("/dashboard");
}

export async function forgotPasswordAction(
  _previous: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = field(formData, "email").toLowerCase();
  if (!email) {
    return { error: "Enter the email address for your account." };
  }

  try {
    const data = await apiFetch<{ detail: string; reset_url: string | null }>(
      "/api/auth/forgot-password",
      { method: "POST", body: { email } },
    );
    return { message: data.detail, resetUrl: data.reset_url ?? undefined };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}

export async function resetPasswordAction(
  _previous: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const token = field(formData, "token");
  const password = (formData.get("password") ?? "").toString();
  const confirmPassword = (formData.get("confirm_password") ?? "").toString();

  if (!token) {
    return { error: "This reset link is missing its token." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  try {
    const data = await apiFetch<{ detail: string }>("/api/auth/reset-password", {
      method: "POST",
      body: { token, new_password: password },
    });
    return { message: data.detail };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}

export async function logoutAction() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}
