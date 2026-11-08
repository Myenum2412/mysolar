import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth-shell";
import { SignupForm } from "@/components/signup-form";
import { getSession } from "@/lib/session";

export const metadata = {
  title: "Create account · MySolar",
};

export default async function SignupPage({
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
      <SignupForm initialError={error} />
    </AuthShell>
  );
}
