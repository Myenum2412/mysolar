import Link from "next/link";
import { AlertTriangleIcon } from "lucide-react";

import { Logo } from "@/components/logo";
import { ResetPasswordForm } from "@/components/reset-password-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Reset password · MySolar",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex justify-center">
          <Logo />
        </div>
        {token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <div className="flex flex-col gap-4">
            <Alert variant="destructive">
              <AlertTriangleIcon />
              <AlertTitle>Invalid reset link</AlertTitle>
              <AlertDescription>
                This page needs a reset token. Request a new link from the
                forgot password page.
              </AlertDescription>
            </Alert>
            <Button asChild>
              <Link href="/forgot-password">Request a new link</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/login">Back to login</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
