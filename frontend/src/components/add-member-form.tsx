"use client";

import { useActionState } from "react";
import { Loader2Icon } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  addMemberAction,
  type OrgState,
} from "@/lib/actions/organizations";

export function AddMemberForm({ organizationId }: { organizationId: string }) {
  const [state, formAction, pending] = useActionState<OrgState, FormData>(
    addMemberAction,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <Field className="flex-1">
          <FieldLabel htmlFor="member-email">Existing user email</FieldLabel>
          <Input
            id="member-email"
            name="email"
            type="email"
            placeholder="member@example.com"
            required
          />
        </Field>
        <Field className="w-full sm:w-40">
          <FieldLabel htmlFor="member-role">Role</FieldLabel>
          <Select name="role" defaultValue="member">
            <SelectTrigger id="member-role" className="w-full">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="member">Member</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="owner">Owner</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2Icon className="animate-spin" /> : null}
          {pending ? "Adding..." : "Add member"}
        </Button>
      </div>
    </form>
  );
}
