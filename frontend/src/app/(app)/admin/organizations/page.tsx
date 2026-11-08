import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRightIcon, Building2Icon, UsersIcon } from "lucide-react";

import { CreateOrganizationForm } from "@/components/create-organization-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getOrganizations } from "@/lib/data";
import { getSession } from "@/lib/session";

export const metadata = {
  title: "Organizations · MySolar",
};

export default async function AdminOrganizationsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  const orgs = await getOrganizations(session.token);
  const totalMembers = orgs.reduce((sum, org) => sum + org.member_count, 0);

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Organizations
        </h1>
        <p className="text-sm text-muted-foreground">
          The admin organization menu. Create organizations and manage their
          memberships.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Organizations</CardDescription>
            <CardTitle className="text-3xl">{orgs.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Memberships</CardDescription>
            <CardTitle className="text-3xl">{totalMembers}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Access</CardDescription>
            <CardTitle className="flex items-center gap-2 text-3xl">
              <UsersIcon className="size-6 text-muted-foreground" />
              Admin
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create organization</CardTitle>
          <CardDescription>
            You become the owner of any organization you create.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateOrganizationForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All organizations</CardTitle>
          <CardDescription>
            Select an organization to edit it, add members or assign roles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orgs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-12 text-center text-sm text-muted-foreground"
                  >
                    No organizations yet. Use the form above to create the
                    first one.
                  </TableCell>
                </TableRow>
              ) : (
                orgs.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell>
                      <Link
                        href={`/admin/organizations/${org.id}`}
                        className="flex items-center gap-3 font-medium hover:underline"
                      >
                        <span className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                          <Building2Icon className="size-4" />
                        </span>
                        {org.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{org.slug}</Badge>
                    </TableCell>
                    <TableCell>{org.member_count}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Intl.DateTimeFormat("en-US", {
                        dateStyle: "medium",
                      }).format(new Date(org.created_at))}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/organizations/${org.id}`}>
                          Manage
                          <ArrowRightIcon />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
