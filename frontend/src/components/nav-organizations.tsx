"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2Icon, PlusIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import type { Organization } from "@/lib/types";

export function NavOrganizations({
  orgs,
  isAdmin,
}: {
  orgs: Organization[];
  isAdmin: boolean;
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Your organizations</SidebarGroupLabel>
      <SidebarMenu>
        {orgs.slice(0, 6).map((org) => {
          const href = isAdmin
            ? `/admin/organizations/${org.id}`
            : `/dashboard/organizations/${org.id}`;
          return (
            <SidebarMenuItem key={org.id}>
              <SidebarMenuButton
                asChild
                isActive={pathname === href}
                tooltip={org.name}
              >
                <Link href={href}>
                  <Building2Icon />
                  <span>{org.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
        {orgs.length === 0 ? (
          <SidebarMenuItem>
            <div className="px-2 py-1.5 text-xs leading-relaxed text-muted-foreground">
              {isAdmin
                ? "No organizations yet. Create one from the admin menu."
                : "You are not a member of an organization yet."}
            </div>
          </SidebarMenuItem>
        ) : null}
        {isAdmin ? (
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/admin/organizations"}
              tooltip="Manage organizations"
            >
              <Link href="/admin/organizations">
                <PlusIcon />
                <span className="text-muted-foreground">
                  Manage organizations
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ) : null}
      </SidebarMenu>
    </SidebarGroup>
  );
}
