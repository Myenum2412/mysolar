"use client";

import { useActionState } from "react";
import { Loader2Icon } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  updateOrganizationAction,
  type OrgState,
} from "@/lib/actions/organizations";

export function OrganizationSettingsForm({
  organizationId,
  name,
}: {
  organizationId: string;
  name: string;
}) {
  const [state, formAction, pending] = useActionState<OrgState, FormData>(
    updateOrganizationAction,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="organization_id" value={organizationId} />
      {state.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      {state.message ? (
        <Alert>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}
      <Field>
        <FieldLabel htmlFor="organization-name">Name</FieldLabel>
        <Input
          id="organization-name"
          name="name"
          defaultValue={name}
          minLength={2}
          maxLength={80}
          required
        />
      </Field>
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2Icon className="animate-spin" /> : null}
          {pending ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
