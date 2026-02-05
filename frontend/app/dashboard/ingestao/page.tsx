"use client";

import Link from "next/link";
import { FileUploadStorage } from "@/components/file-upload-storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { FolderKanban } from "lucide-react";
import { useProject } from "@/contexts/project-context";

export default function IngestaoPage() {
  const { currentProject, setCurrentProject, projectNames, loading: projectLoading } = useProject();

  return (
    <div className="space-y-4">
      <div className="flex flex-row items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight lg:text-2xl">Ingestão</h1>
          <p className="text-muted-foreground text-sm">
            Envie arquivos em lote ou um por vez para o Storage. O processo de renomeação dos arquivos ocorre aqui na Ingestão (aplique o padrão definido em Projetos).
          </p>
        </div>
      </div>

      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FolderKanban className="size-4" />
            Projeto de destino
          </CardTitle>
          <CardDescription>
            Selecione o projeto para onde os arquivos serão enviados. Para criar um projeto, use a página Projetos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {projectLoading ? (
            <p className="text-sm text-muted-foreground">Carregando…</p>
          ) : (
            <>
              <Label htmlFor="ingestao-projeto" className="text-xs">Projeto</Label>
              <select
                id="ingestao-projeto"
                className="flex h-9 w-full max-w-xs rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground"
                value={currentProject ?? ""}
                onChange={(e) => setCurrentProject(e.target.value || null)}
              >
                <option value="">— Selecione —</option>
                {projectNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              {projectNames.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Nenhum projeto. <Button variant="link" className="h-auto p-0 text-xs" asChild><Link href="/dashboard/projetos">Criar na página Projetos</Link></Button>
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <FileUploadStorage />
    </div>
  );
}
