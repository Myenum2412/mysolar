"use client";

import { useActionState } from "react";
import { Loader2Icon, PlusIcon } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  createOrganizationAction,
  type OrgState,
} from "@/lib/actions/organizations";

export function CreateOrganizationForm() {
  const [state, formAction, pending] = useActionState<OrgState, FormData>(
    createOrganizationAction,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="organization-name">Name</FieldLabel>
          <Input
            id="organization-name"
            name="name"
            placeholder="Northwind Solar"
            minLength={2}
            maxLength={80}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="organization-slug">Slug (optional)</FieldLabel>
          <Input
            id="organization-slug"
            name="slug"
            placeholder="northwind-solar"
            maxLength={100}
          />
          <FieldDescription>
            Generated from the name when left blank.
          </FieldDescription>
        </Field>
      </div>
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2Icon className="animate-spin" /> : <PlusIcon />}
          {pending ? "Creating..." : "Create organization"}
        </Button>
      </div>
    </form>
  );
}
