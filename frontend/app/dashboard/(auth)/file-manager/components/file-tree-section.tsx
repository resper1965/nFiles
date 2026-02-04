"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { FileTree } from "@/components/file-tree";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FolderTree } from "lucide-react";

export function FileTreeSection() {
  const { user } = useAuth();
  const {
    currentProject,
    setCurrentProject,
    projectNames,
    loading: projectLoading,
  } = useProject();
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());

  return (
    <Card className="transition-colors hover:bg-muted/50">
      <CardHeader>
        <CardTitle className="flex gap-2">
          <FolderTree className="size-4 text-yellow-600" />
          <span className="leading-none font-semibold tracking-tight">
            Árvore de documentos
          </span>
        </CardTitle>
        <CardDescription>
          {currentProject
            ? `Projeto: ${currentProject}. Navegue por pastas e selecione arquivos.`
            : "Selecione um projeto para ver a árvore de documentos."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {projectLoading ? (
          <p className="text-sm text-muted-foreground">Carregando projetos…</p>
        ) : (
          <>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label
                htmlFor="file-manager-project"
                className="text-muted-foreground shrink-0 text-sm font-medium"
              >
                Projeto:
              </label>
              <select
                id="file-manager-project"
                className="border-input bg-background flex h-9 max-w-xs rounded-md border px-3 py-1 text-sm text-foreground"
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
            </div>
            {user?.id && currentProject && (
              <FileTree
                userId={user.id}
                projectName={currentProject}
                selectedPaths={selectedPaths}
                onSelectionChange={setSelectedPaths}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
