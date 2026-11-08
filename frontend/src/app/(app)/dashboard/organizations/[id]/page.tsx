import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeftIcon, Building2Icon } from "lucide-react";

import { MembersTable } from "@/components/members-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getMembers, getOrganization } from "@/lib/data";
import { getSession } from "@/lib/session";

export default async function OrganizationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const { id } = await params;
  const [org, members] = await Promise.all([
    getOrganization(session.token, id),
    getMembers(session.token, id),
  ]);

  if (!org) {
    notFound();
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
          <Link href="/dashboard">
            <ArrowLeftIcon />
            Dashboard
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Building2Icon className="size-5" />
          </span>
          <div className="flex flex-col gap-0.5">
            <h1 className="text-2xl font-semibold tracking-tight">{org.name}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline">{org.slug}</Badge>
              <span>
                {org.member_count} member{org.member_count === 1 ? "" : "s"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>
            Everyone with access to this organization. Contact an administrator
            to change membership.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MembersTable
            members={members}
            organizationId={org.id}
            canManage={false}
          />
        </CardContent>
      </Card>
    </>
  );
}
