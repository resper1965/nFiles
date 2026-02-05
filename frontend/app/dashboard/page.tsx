"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { NessBrand, NFilesBrand } from "@/components/ness-brand";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban, FolderOpen, Upload } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { listProjectNames } from "@/lib/storage";
import { countAllFilesForUser } from "@/lib/storage";

export default function DashboardPage() {
  const { user } = useAuth();
  const [projectsCount, setProjectsCount] = useState<number | null>(null);
  const [filesCount, setFilesCount] = useState<number | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    listProjectNames(user.id)
      .then((names) => {
        if (!cancelled) setProjectsCount(names.length);
      })
      .catch(() => {
        if (!cancelled) setProjectsCount(0);
      });
    countAllFilesForUser(user.id)
      .then((n) => {
        if (!cancelled) setFilesCount(n);
      })
      .catch(() => {
        if (!cancelled) setFilesCount(0);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  return (
    <div className="space-y-4">
      <div className="flex flex-row items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight lg:text-2xl">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            <NessBrand className="text-sm" /> — gestão de documentos (<NFilesBrand textClassName="text-muted-foreground" className="text-sm" />).
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Projetos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-2xl font-bold lg:text-3xl">{projectsCount ?? "—"}</p>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Arquivos (total)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-2xl font-bold lg:text-3xl">{filesCount ?? "—"}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border shadow-sm transition-colors hover:bg-muted/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderKanban className="size-5" />
              Projetos
            </CardTitle>
            <CardDescription>
              Crie e gerencie projetos e defina as regras de renomeação. A renomeação dos arquivos ocorre na Ingestão.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/projetos">Abrir Projetos</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="border shadow-sm transition-colors hover:bg-muted/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="size-5" />
              Ingestão
            </CardTitle>
            <CardDescription>
              Envie arquivos e renomeie conforme as regras do projeto. O processo de renomeação dos arquivos ocorre aqui.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/ingestao">Abrir Ingestão</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="border shadow-sm transition-colors hover:bg-muted/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="size-5" />
              File system
            </CardTitle>
            <CardDescription>
              Árvore de documentos por projeto.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/file-manager">Abrir File system</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
