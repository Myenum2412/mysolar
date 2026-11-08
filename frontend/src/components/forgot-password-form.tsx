"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowLeftIcon, Loader2Icon, MailCheckIcon } from "lucide-react";

import { cn } from "cn";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { forgotPasswordAction, type AuthState } from "@/lib/actions/auth";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    forgotPasswordAction,
    {},
  );

  return (
    <form
      action={formAction}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Forgot your password?</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter the email for your account and we&apos;ll send you a link to
            reset your password.
          </p>
        </div>

        {state.error ? (
          <Alert variant="destructive">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        ) : null}

        {state.message ? (
          <Alert>
            <MailCheckIcon />
            <AlertTitle>Check your email</AlertTitle>
            <AlertDescription>
              {state.message} The link expires in 30 minutes.
            </AlertDescription>
          </Alert>
        ) : null}

        {state.resetUrl ? (
          <div className="rounded-lg border border-dashed bg-muted/40 p-3 text-sm">
            <p className="mb-1 font-medium">Development mode</p>
            <p className="mb-2 text-muted-foreground">
              SMTP is not configured, so use this link directly:
            </p>
            <Link
              href={state.resetUrl}
              className="break-all underline underline-offset-4"
            >
              {state.resetUrl}
            </Link>
          </div>
        ) : null}

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="m@example.com"
            required
            className="bg-background"
          />
        </Field>
        <Field>
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2Icon className="animate-spin" /> : null}
            {pending ? "Sending..." : "Send reset link"}
          </Button>
          <FieldDescription className="text-center">
            Remember your password?{" "}
            <Link href="/login" className="underline underline-offset-4">
              Back to login
            </Link>
          </FieldDescription>
        </Field>
        <Button variant="ghost" asChild className="w-full">
          <Link href="/login">
            <ArrowLeftIcon />
            Back to login
          </Link>
        </Button>
      </FieldGroup>
    </form>
  );
}
