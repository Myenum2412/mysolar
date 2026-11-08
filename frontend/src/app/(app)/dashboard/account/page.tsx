import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2Icon, LogOutIcon, ShieldCheckIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { logoutAction } from "@/lib/actions/auth";
import { initials } from "@/lib/initials";
import { getSession } from "@/lib/session";

export const metadata = {
  title: "Account · MySolar",
};

export default async function AccountPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const { user } = session;
  const isAdmin = user.role === "admin";
  const name = user.full_name?.trim() || user.email.split("@")[0];
  const joined = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(new Date(user.created_at));

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
        <p className="text-sm text-muted-foreground">
          Your profile and access details.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              This information comes from your account and Google profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <Avatar className="size-14 rounded-xl">
                <AvatarImage src={user.avatar_url ?? undefined} alt={name} />
                <AvatarFallback className="rounded-xl text-lg">
                  {initials(user.full_name, user.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <span className="text-lg font-medium">{name}</span>
                <span className="text-sm text-muted-foreground">
                  {user.email}
                </span>
              </div>
              <Badge variant={isAdmin ? "default" : "secondary"} className="ml-auto">
                {isAdmin ? "Administrator" : "Member"}
              </Badge>
            </div>

            <dl className="grid gap-4 border-t pt-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                  Full name
                </dt>
                <dd className="text-sm">{user.full_name || "Not set"}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                  Email
                </dt>
                <dd className="text-sm">{user.email}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                  Member since
                </dt>
                <dd className="text-sm">{joined}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                  Status
                </dt>
                <dd className="text-sm">
                  {user.is_active ? "Active" : "Disabled"}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheckIcon className="size-4" />
                Access
              </CardTitle>
              <CardDescription>
                {isAdmin
                  ? "You can manage every organization and its members."
                  : "You can view the organizations you belong to."}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {isAdmin ? (
                <Button asChild variant="outline">
                  <Link href="/admin/organizations">
                    <Building2Icon />
                    Organization menu
                  </Link>
                </Button>
              ) : null}
              <form action={logoutAction}>
                <Button type="submit" variant="outline" className="w-full">
                  <LogOutIcon />
                  Log out
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sign-in methods</CardTitle>
              <CardDescription>
                Email and password are always available. Google sign-in appears
                when it is configured.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </>
  );
}
