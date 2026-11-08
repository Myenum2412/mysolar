"use client";

import { Building2Icon, LayoutDashboardIcon, UserRoundIcon } from "lucide-react";

import { NavMain, type NavItem } from "@/components/nav-main";
import { NavOrganizations } from "@/components/nav-organizations";
import { NavUser } from "@/components/nav-user";
import { OrgSwitcher } from "@/components/org-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

import type { Organization, User } from "@/lib/types";

const baseItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: <LayoutDashboardIcon />,
  },
  {
    title: "Account",
    url: "/dashboard/account",
    icon: <UserRoundIcon />,
  },
];

const adminItems: NavItem[] = [
  {
    title: "Organizations",
    url: "/admin/organizations",
    icon: <Building2Icon />,
  },
];

export function AppSidebar({
  user,
  orgs,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: User;
  orgs: Organization[];
}) {
  const isAdmin = user.role === "admin";

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <OrgSwitcher orgs={orgs} isAdmin={isAdmin} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain label="Platform" items={baseItems} />
        {isAdmin ? (
          <NavMain label="Administration" items={adminItems} />
        ) : null}
        <NavOrganizations orgs={orgs} isAdmin={isAdmin} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} isAdmin={isAdmin} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
