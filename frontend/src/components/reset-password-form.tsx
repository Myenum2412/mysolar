"use client";

import Link from "next/link";
import { useActionState } from "react";
import { CheckCircle2Icon, Loader2Icon } from "lucide-react";

import { cn } from "cn";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { resetPasswordAction, type AuthState } from "@/lib/actions/auth";

export function ResetPasswordForm({
  token,
  className,
  ...props
}: React.ComponentProps<"form"> & { token: string }) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    resetPasswordAction,
    {},
  );

  if (state.message) {
    return (
      <div className={cn("flex flex-col gap-6", className)}>
        <Alert>
          <CheckCircle2Icon />
          <AlertTitle>Password updated</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
        <Button asChild>
          <Link href="/login">Back to login</Link>
        </Button>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Choose a new password</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Pick a strong password with at least 8 characters.
          </p>
        </div>

        {state.error ? (
          <Alert variant="destructive">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        ) : null}

        <input type="hidden" name="token" value={token} />
        <Field>
          <FieldLabel htmlFor="password">New password</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            className="bg-background"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="confirm_password">Confirm password</FieldLabel>
          <Input
            id="confirm_password"
            name="confirm_password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            className="bg-background"
          />
          <FieldDescription>
            Remember your password?{" "}
            <Link href="/login" className="underline underline-offset-4">
              Back to login
            </Link>
          </FieldDescription>
        </Field>
        <Field>
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2Icon className="animate-spin" /> : null}
            {pending ? "Updating..." : "Update password"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
