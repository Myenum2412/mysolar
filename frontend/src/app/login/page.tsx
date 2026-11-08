import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth-shell";
import { LoginForm } from "@/components/login-form";
import { getSession } from "@/lib/session";

export const metadata = {
  title: "Login · MySolar",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await getSession()) {
    redirect("/dashboard");
  }

  const { error } = await searchParams;

  return (
    <AuthShell>
      <LoginForm initialError={error} />
    </AuthShell>
  );
}
