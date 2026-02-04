"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/layout/header";
import { NessBrand, NFilesBrand } from "@/components/ness-brand";
import { Button } from "@/components/ui/button";
import { FolderKanban, FolderOpen, LayoutDashboard, LogOut, Upload } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { ProjectProvider } from "@/contexts/project-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Carregando…</p>
      </div>
    );
  }

  return (
    <ProjectProvider>
      <DashboardSidebar user={user} signOut={signOut}>
        {children}
      </DashboardSidebar>
    </ProjectProvider>
  );
}

const sidebarStyle = {
  "--header-height": "3.5rem",
} as React.CSSProperties;

function DashboardSidebar({
  user,
  signOut,
  children,
}: {
  user: { email?: string | null };
  signOut: () => Promise<void>;
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider style={sidebarStyle}>
      <Sidebar>
        <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
          <Link href="/dashboard" className="block">
            <NessBrand textClassName="text-sidebar-foreground" className="text-2xl" />
          </Link>
          <span className="text-muted-foreground block mt-1 text-base">
            <NFilesBrand textClassName="text-muted-foreground" className="text-base" />
          </span>
          <div className="mt-3 flex flex-col gap-1">
            <span className="text-xs text-muted-foreground truncate" title={user.email ?? ""}>
              {user.email}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start gap-2 h-8 text-xs"
              onClick={() => signOut()}
            >
              <LogOut className="size-3" />
              Sair
            </Button>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/dashboard">
                      <LayoutDashboard className="size-4" />
                      <span>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/dashboard/projetos">
                      <FolderKanban className="size-4" />
                      <span>Projetos</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/dashboard/ingestao">
                      <Upload className="size-4" />
                      <span>Ingestão</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/dashboard/file-manager">
                      <FolderOpen className="size-4" />
                      <span>File system</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="p-4 md:p-6">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
