"use client";

/**
 * @deprecated Use FileTreeSection on the file-manager page instead.
 * This component is kept for reference; the page /dashboard/file-manager
 * uses FileTreeSection with the same "estrutura de arquivos" copy.
 */
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { FileTree } from "@/components/file-tree";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderTree } from "lucide-react";

export function FileManagerContent() {
  const { user } = useAuth();
  const { currentProject, setCurrentProject, projectNames, loading: projectLoading } = useProject();
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">File system</h1>
        <p className="text-muted-foreground">
          Estrutura de arquivos do projeto: árvore de pastas e arquivos. Selecione o projeto e expanda as pastas para ver o conteúdo.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderTree className="size-5" />
            Estrutura de arquivos (árvore)
          </CardTitle>
          <CardDescription>
            {currentProject
              ? `Projeto: ${currentProject}. Expanda pastas para ver a estrutura; marque arquivos para usar no preview de renomeação.`
              : "Selecione um projeto para ver a estrutura de arquivos (árvore)."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {projectLoading ? (
            <p className="text-sm text-muted-foreground">Carregando projetos…</p>
          ) : (
            <>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <label htmlFor="file-manager-project" className="text-sm font-medium text-muted-foreground shrink-0">
                  Projeto:
                </label>
                <select
                  id="file-manager-project"
                  className="flex h-9 max-w-xs rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground"
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
    </div>
  );
}
