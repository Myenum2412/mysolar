import Link from "next/link";

import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { Logo } from "@/components/logo";

export const metadata = {
  title: "Forgot password · MySolar",
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex justify-center">
          <Logo />
        </div>
        <ForgotPasswordForm />
        <p className="px-6 text-center text-xs text-muted-foreground">
          By continuing you agree to our{" "}
          <Link href="#" className="underline underline-offset-4">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="#" className="underline underline-offset-4">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
