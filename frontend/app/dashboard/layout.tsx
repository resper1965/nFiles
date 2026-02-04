"use client";

import { useEffect, useState } from "react";
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
import { NessBrand, NFilesBrand } from "@/components/ness-brand";
import { Button } from "@/components/ui/button";
import { FolderOpen, FolderPlus, LayoutDashboard, LogOut, Upload } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { ProjectProvider, useProject } from "@/contexts/project-context";

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

function DashboardSidebar({
  user,
  signOut,
  children,
}: {
  user: { email?: string | null };
  signOut: () => Promise<void>;
  children: React.ReactNode;
}) {
  const { currentProject, setCurrentProject, projectNames, createProject, loading: projectLoading } = useProject();
  const [newProjectName, setNewProjectName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const handleCreateProject = async () => {
    const name = newProjectName.trim();
    if (!name) return;
    setCreating(true);
    setCreateError(null);
    const { error } = await createProject(name);
    setCreating(false);
    if (error) setCreateError(error.message);
    else setNewProjectName("");
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
          <Link href="/dashboard" className="block">
            <NessBrand textClassName="text-sidebar-foreground" />
          </Link>
          <span className="text-muted-foreground text-xs block mt-0.5">
            <NFilesBrand textClassName="text-muted-foreground" className="text-xs" />
          </span>
          <div className="mt-3 space-y-2">
            <div className="text-xs font-medium text-muted-foreground">Projeto</div>
            {projectLoading ? (
              <p className="text-xs text-muted-foreground">Carregando…</p>
            ) : (
              <>
                <select
                  className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs"
                  value={currentProject ?? ""}
                  onChange={(e) => setCurrentProject(e.target.value || null)}
                >
                  <option value="">— Sem projeto —</option>
                  {projectNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
                <div className="flex gap-1">
                  <input
                    type="text"
                    placeholder="Novo projeto"
                    className="flex-1 rounded-md border border-input bg-background px-2 py-1 text-xs"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateProject()}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 shrink-0 px-2"
                    onClick={handleCreateProject}
                    disabled={creating || !newProjectName.trim()}
                  >
                    <FolderPlus className="size-3" />
                  </Button>
                </div>
                {createError && <p className="text-xs text-destructive">{createError}</p>}
              </>
            )}
          </div>
          <div className="mt-2 flex flex-col gap-1">
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
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
