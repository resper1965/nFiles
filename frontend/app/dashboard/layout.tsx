"use client";

import Link from "next/link";
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
import { Button } from "@/components/ui/button";
import { FolderOpen, LayoutDashboard, LogIn, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, signOut } = useAuth();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
          <Link href="/dashboard" className="font-semibold text-sidebar-foreground">
            n.files
          </Link>
          <span className="text-muted-foreground text-xs block">ness</span>
          {!loading && (
            <div className="mt-2 flex flex-col gap-1">
              {user ? (
                <>
                  <span className="text-xs text-muted-foreground truncate" title={user.email}>
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
                </>
              ) : (
                <Button variant="outline" size="sm" className="justify-start gap-2 h-8 text-xs" asChild>
                  <Link href="/login">
                    <LogIn className="size-3" />
                    Entrar
                  </Link>
                </Button>
              )}
            </div>
          )}
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
                    <Link href="/dashboard/file-manager">
                      <FolderOpen className="size-4" />
                      <span>File manager</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
