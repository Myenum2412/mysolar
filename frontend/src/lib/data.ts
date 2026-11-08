import { cache } from "react";

import { apiFetch } from "@/lib/api";
import type { Member, Organization } from "@/lib/types";

export const getOrganizations = cache(async (token: string) => {
  try {
    return await apiFetch<Organization[]>("/api/organizations", { token });
  } catch {
    return [];
  }
});

export const getOrganization = cache(async (token: string, id: string) => {
  try {
    return await apiFetch<Organization>(`/api/organizations/${id}`, { token });
  } catch {
    return null;
  }
});

export const getMembers = cache(async (token: string, id: string) => {
  try {
    return await apiFetch<Member[]>(`/api/organizations/${id}/members`, {
      token,
    });
  } catch {
    return [];
  }
});
