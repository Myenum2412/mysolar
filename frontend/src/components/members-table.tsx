import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { removeMemberAction } from "@/lib/actions/organizations";
import { initials } from "@/lib/initials";
import type { Member } from "@/lib/types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
    new Date(value),
  );
}

export function MembersTable({
  members,
  organizationId,
  canManage,
}: {
  members: Member[];
  organizationId: string;
  canManage: boolean;
}) {
  const columns = canManage ? 4 : 3;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Member</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Joined</TableHead>
          {canManage ? (
            <TableHead className="text-right">Actions</TableHead>
          ) : null}
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={columns}
              className="py-10 text-center text-sm text-muted-foreground"
            >
              No members in this organization yet.
            </TableCell>
          </TableRow>
        ) : (
          members.map((member) => {
            const name =
              member.full_name?.trim() || member.email.split("@")[0];
            return (
              <TableRow key={member.user_id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8 rounded-lg">
                      <AvatarImage
                        src={member.avatar_url ?? undefined}
                        alt={name}
                      />
                      <AvatarFallback className="rounded-lg">
                        {initials(member.full_name, member.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium leading-tight">{name}</span>
                      <span className="text-xs text-muted-foreground">
                        {member.email}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{member.role}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(member.joined_at)}
                </TableCell>
                {canManage ? (
                  <TableCell className="text-right">
                    <form action={removeMemberAction}>
                      <input
                        type="hidden"
                        name="organization_id"
                        value={organizationId}
                      />
                      <input
                        type="hidden"
                        name="user_id"
                        value={member.user_id}
                      />
                      <Button type="submit" variant="ghost" size="sm">
                        Remove
                      </Button>
                    </form>
                  </TableCell>
                ) : null}
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
