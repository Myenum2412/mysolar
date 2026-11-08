"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Building2Icon,
  ChevronsUpDownIcon,
  PlusIcon,
  Settings2Icon,
} from "lucide-react";

import type { Organization } from "@/lib/types";

export function OrgSwitcher({
  orgs,
  isAdmin,
}: {
  orgs: Organization[];
  isAdmin: boolean;
}) {
  const { isMobile } = useSidebar();
  const pathname = usePathname();

  const activeOrg =
    orgs.find((org) => pathname.includes(org.id)) ?? orgs[0] ?? null;

  const orgHref = (org: Organization) =>
    isAdmin
      ? `/admin/organizations/${org.id}`
      : `/dashboard/organizations/${org.id}`;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Building2Icon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {activeOrg?.name ?? "No organization"}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {activeOrg
                    ? `${activeOrg.member_count} member${activeOrg.member_count === 1 ? "" : "s"}`
                    : isAdmin
                      ? "Create your first organization"
                      : "Ask an admin for access"}
                </span>
              </div>
              <ChevronsUpDownIcon className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-fit min-w-56"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Organizations
            </DropdownMenuLabel>
            {orgs.length === 0 ? (
              <DropdownMenuItem disabled className="gap-2 p-2">
                No organizations yet
              </DropdownMenuItem>
            ) : (
              orgs.map((org) => (
                <DropdownMenuItem key={org.id} asChild className="gap-2 p-2">
                  <Link href={orgHref(org)}>
                    <div className="flex size-6 items-center justify-center rounded-md border">
                      <Building2Icon className="size-3.5" />
                    </div>
                    <span className="truncate">{org.name}</span>
                  </Link>
                </DropdownMenuItem>
              ))
            )}
            {isAdmin ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="gap-2 p-2">
                  <Link href="/admin/organizations">
                    <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                      <PlusIcon className="size-4" />
                    </div>
                    <div className="font-medium text-muted-foreground">
                      Manage organizations
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="gap-2 p-2">
                  <Link href="/dashboard/account">
                    <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                      <Settings2Icon className="size-4" />
                    </div>
                    <div className="font-medium text-muted-foreground">
                      Account settings
                    </div>
                  </Link>
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
