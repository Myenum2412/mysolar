import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getOrganizations } from "@/lib/data";
import { getSession } from "@/lib/session";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const orgs = await getOrganizations(session.token);

  return (
    <SidebarProvider>
      <AppSidebar user={session.user} orgs={orgs} />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
