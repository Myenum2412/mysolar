import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRightIcon,
  Building2Icon,
  CircleCheckIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getOrganizations } from "@/lib/data";
import { getSession } from "@/lib/session";

export const metadata = {
  title: "Dashboard · MySolar",
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const { user, token } = session;
  const orgs = await getOrganizations(token);
  const isAdmin = user.role === "admin";
  const totalMembers = orgs.reduce((sum, org) => sum + org.member_count, 0);
  const firstName = user.full_name?.split(" ")[0] || user.email.split("@")[0];

  const stats = [
    {
      label: "Organizations",
      value: orgs.length,
      hint: isAdmin ? "Across the whole workspace" : "You belong to",
      icon: <Building2Icon className="size-4" />,
    },
    {
      label: "Members",
      value: totalMembers,
      hint: "Total membership seats",
      icon: <UsersIcon className="size-4" />,
    },
    {
      label: "Access level",
      value: isAdmin ? "Admin" : "Member",
      hint: isAdmin ? "Full organization menu" : "View only",
      icon: <ShieldCheckIcon className="size-4" />,
    },
    {
      label: "Account",
      value: user.is_active ? "Active" : "Disabled",
      hint: "Signed in securely",
      icon: <CircleCheckIcon className="size-4" />,
    },
  ];

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back, {firstName}. Here is the current state of your
          workspace.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>{stat.label}</CardDescription>
                <span className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  {stat.icon}
                </span>
              </div>
              <CardTitle className="text-3xl">{stat.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{stat.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <CardTitle>Your organizations</CardTitle>
            <CardDescription>
              {isAdmin
                ? "Every organization in the workspace. Use the admin menu to create or edit one."
                : "Organizations an administrator has added you to."}
            </CardDescription>
          </div>
          {isAdmin ? (
            <Button asChild size="sm">
              <Link href="/admin/organizations">
                Manage
                <ArrowRightIcon />
              </Link>
            </Button>
          ) : null}
        </CardHeader>
        <CardContent>
          {orgs.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-6 py-12 text-center">
              <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Building2Icon className="size-5" />
              </span>
              <div className="flex flex-col gap-1">
                <p className="font-medium">No organizations yet</p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  {isAdmin
                    ? "Create your first organization to start adding members and assigning roles."
                    : "Ask an administrator to add you to an organization."}
                </p>
              </div>
              {isAdmin ? (
                <Button asChild size="sm" variant="outline">
                  <Link href="/admin/organizations">Create organization</Link>
                </Button>
              ) : null}
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {orgs.map((org) => {
                const href = isAdmin
                  ? `/admin/organizations/${org.id}`
                  : `/dashboard/organizations/${org.id}`;
                return (
                  <Link
                    key={org.id}
                    href={href}
                    className="group flex flex-col gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex size-9 items-center justify-center rounded-md bg-muted text-muted-foreground">
                        <Building2Icon className="size-4" />
                      </div>
                      <Badge variant="secondary">
                        {org.membership_role ?? "member"}
                      </Badge>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <p className="font-medium leading-tight">{org.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {org.member_count} member
                        {org.member_count === 1 ? "" : "s"}
                      </p>
                    </div>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-foreground">
                      Open
                      <ArrowRightIcon className="size-3" />
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {isAdmin ? (
        <Card>
          <CardHeader>
            <CardTitle>Organization menu</CardTitle>
            <CardDescription>
              Administrator tools for organizations, memberships and access.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/admin/organizations">
                <Building2Icon />
                All organizations
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/account">Account settings</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}
