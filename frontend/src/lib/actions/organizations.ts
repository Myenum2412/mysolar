"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ApiError, apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import type { Organization } from "@/lib/types";

export type OrgState = {
  error?: string;
  message?: string;
};

async function adminSession() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }
  return session;
}

function field(formData: FormData, name: string) {
  return (formData.get(name) ?? "").toString().trim();
}

function errorMessage(error: unknown) {
  return error instanceof ApiError
    ? error.message
    : "Unable to reach the API. Please try again.";
}

export async function createOrganizationAction(
  _previous: OrgState,
  formData: FormData,
): Promise<OrgState> {
  const session = await adminSession();
  const name = field(formData, "name");
  const slug = field(formData, "slug");

  if (name.length < 2) {
    return { error: "Organization name must be at least 2 characters." };
  }

  let organization: Organization;
  try {
    organization = await apiFetch<Organization>("/api/organizations", {
      method: "POST",
      token: session.token,
      body: { name, slug: slug || null },
    });
  } catch (error) {
    return { error: errorMessage(error) };
  }

  revalidatePath("/admin/organizations");
  revalidatePath("/dashboard");
  redirect(`/admin/organizations/${organization.id}`);
}

export async function updateOrganizationAction(
  _previous: OrgState,
  formData: FormData,
): Promise<OrgState> {
  const session = await adminSession();
  const organizationId = field(formData, "organization_id");
  const name = field(formData, "name");

  if (!organizationId) {
    return { error: "Missing organization." };
  }
  if (name.length < 2) {
    return { error: "Organization name must be at least 2 characters." };
  }

  try {
    await apiFetch<Organization>(`/api/organizations/${organizationId}`, {
      method: "PATCH",
      token: session.token,
      body: { name },
    });
  } catch (error) {
    return { error: errorMessage(error) };
  }

  revalidatePath("/admin/organizations");
  revalidatePath(`/admin/organizations/${organizationId}`);
  revalidatePath("/dashboard");
  return { message: "Organization updated." };
}

export async function deleteOrganizationAction(formData: FormData) {
  const session = await adminSession();
  const organizationId = field(formData, "organization_id");
  if (!organizationId) {
    return;
  }

  await apiFetch(`/api/organizations/${organizationId}`, {
    method: "DELETE",
    token: session.token,
  });

  revalidatePath("/admin/organizations");
  revalidatePath("/dashboard");
  redirect("/admin/organizations");
}

export async function addMemberAction(
  _previous: OrgState,
  formData: FormData,
): Promise<OrgState> {
  const session = await adminSession();
  const organizationId = field(formData, "organization_id");
  const email = field(formData, "email").toLowerCase();
  const role = field(formData, "role") || "member";

  if (!organizationId) {
    return { error: "Missing organization." };
  }
  if (!email) {
    return { error: "Enter the email of an existing user." };
  }

  try {
    await apiFetch(`/api/organizations/${organizationId}/members`, {
      method: "POST",
      token: session.token,
      body: { email, role },
    });
  } catch (error) {
    return { error: errorMessage(error) };
  }

  revalidatePath(`/admin/organizations/${organizationId}`);
  revalidatePath("/admin/organizations");
  revalidatePath("/dashboard");
  return { message: `${email} was added to the organization.` };
}

export async function removeMemberAction(formData: FormData) {
  const session = await adminSession();
  const organizationId = field(formData, "organization_id");
  const userId = field(formData, "user_id");
  if (!organizationId || !userId) {
    return;
  }

  await apiFetch(`/api/organizations/${organizationId}/members/${userId}`, {
    method: "DELETE",
    token: session.token,
  });

  revalidatePath(`/admin/organizations/${organizationId}`);
  revalidatePath("/admin/organizations");
  revalidatePath("/dashboard");
}
