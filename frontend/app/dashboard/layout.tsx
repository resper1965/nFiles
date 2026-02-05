"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/layout/header";
import { AppSidebar } from "@/components/layout/sidebar/app-sidebar";
import { useAuth } from "@/contexts/auth-context";
import { ProjectProvider } from "@/contexts/project-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const redirecting = useRef(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      if (!redirecting.current) {
        redirecting.current = true;
        router.replace("/login");
      }
      return;
    }
    redirecting.current = false;
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Carregando…</p>
      </div>
    );
  }

  const sidebarStyle = {
    "--header-height": "3.5rem",
  } as React.CSSProperties;

  return (
    <ProjectProvider>
      <SidebarProvider style={sidebarStyle}>
        <AppSidebar user={user} signOut={signOut} />
        <SidebarInset>
          <SiteHeader user={user} signOut={signOut} />
          <div className="flex flex-1 flex-col">
            <div className="p-4 md:p-6">
              {children}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProjectProvider>
  );
}
