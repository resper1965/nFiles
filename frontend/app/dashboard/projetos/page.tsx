"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { NewRuleForm } from "@/components/new-rule-form";
import { PatternSelector } from "@/components/pattern-selector";
import { PostBatchModal, type PostBatchData } from "@/components/post-batch-modal";
import { PreviewRenames, type PreviewItem } from "@/components/preview-renames";
import { SeedFullOverridesForm } from "@/components/seed-full-overrides-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, FolderPlus, Trash2 } from "lucide-react";
import { useCustomPatterns } from "@/hooks/use-custom-patterns";
import {
  createSeedFullApply,
  DEFAULT_PATTERN_ID,
  type SeedFullOverrides,
} from "@/lib/patterns";
import { listFiles, renameFile } from "@/lib/storage";

const SEED_FULL_ID = "seed-full";

export default function ProjetosPage() {
  const { user, session } = useAuth();
  const { currentProject, setCurrentProject, projectNames, createProject, getProjectMetadata, loading: projectLoading } = useProject();
  const { patterns, addPattern, removePattern, isCustomId } = useCustomPatterns();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedPatternId, setSelectedPatternId] = useState(DEFAULT_PATTERN_ID);
  const [patternOverrides, setPatternOverrides] = useState<SeedFullOverrides>({});
  const [storageFileNames, setStorageFileNames] = useState<string[]>([]);
  const [newRuleOpen, setNewRuleOpen] = useState(false);
  const [newProjectRazao, setNewProjectRazao] = useState("");
  const [newProjectOperadora, setNewProjectOperadora] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [postBatchOpen, setPostBatchOpen] = useState(false);
  const [postBatchData, setPostBatchData] = useState<PostBatchData | null>(null);
  const [zipLoading, setZipLoading] = useState(false);

  useEffect(() => {
    if (patterns.length > 0 && !patterns.some((p) => p.id === selectedPatternId)) {
      setSelectedPatternId(DEFAULT_PATTERN_ID);
    }
  }, [patterns, selectedPatternId]);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    listFiles(user.id, currentProject ?? "")
      .then((files) => {
        if (!cancelled) setStorageFileNames(files.map((f) => f.name));
      })
      .catch(() => {
        if (!cancelled) setStorageFileNames([]);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id, currentProject, refreshTrigger]);

  useEffect(() => {
    if (!currentProject?.trim()) return;
    let cancelled = false;
    getProjectMetadata(currentProject).then((meta) => {
      if (!cancelled && meta) {
        setPatternOverrides((prev) => ({
          ...prev,
          razao: meta.razao_social || prev.razao,
          operadora: meta.operadora || prev.operadora,
          // tipo e objeto não vêm do projeto: cada documento pode ter valor diferente
        }));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [currentProject, getProjectMetadata]);

  const applyTemplate = useMemo(() => {
    if (selectedPatternId === SEED_FULL_ID) {
      return createSeedFullApply(patternOverrides);
    }
    return patterns.find((p) => p.id === selectedPatternId)?.apply;
  }, [selectedPatternId, patternOverrides, patterns]);

  const handleCreateProject = async () => {
    const razao = newProjectRazao.trim();
    const operadora = newProjectOperadora.trim();
    if (!razao || !operadora) {
      setCreateError("Razão social e operadora são obrigatórios.");
      return;
    }
    setCreating(true);
    setCreateError(null);
    const { error } = await createProject({
      name: newProjectName.trim() || undefined,
      razao_social: razao,
      operadora,
      // tipo e objeto não no projeto: cada documento pode ter valor diferente
    });
    setCreating(false);
    if (error) setCreateError(error.message);
    else {
      setNewProjectRazao("");
      setNewProjectOperadora("");
      setNewProjectName("");
    }
  };

  const onApplyRenames = useCallback(
    async (items: PreviewItem[]): Promise<{ error?: string }> => {
      if (!user?.id) return { error: "Faça login para aplicar renomeações no Storage." };
      for (const item of items) {
        const { error } = await renameFile(user.id, item.from, item.to, currentProject ?? undefined);
        if (error) {
          return { error: `${item.from}: ${error.message}` };
        }
      }
      setRefreshTrigger((r) => r + 1);
      return {};
    },
    [user?.id, currentProject]
  );

  const onCopyBatch = useCallback(
    async (items: PreviewItem[]): Promise<{ copied: number; failed: { fromPath: string; error: string }[] }> => {
      if (!user?.id || !currentProject) {
        throw new Error("Faça login e selecione um projeto para copiar em massa.");
      }
      const res = await fetch("/api/storage/copy-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: currentProject,
          items: items.map((i) => ({ fromPath: i.from, toName: i.to })),
          accessToken: session?.access_token,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "Erro ao copiar em massa.");
      }
      const { copied = 0, failed = [] } = data;
      setPostBatchData({
        copied,
        failed,
        items,
        projectName: currentProject,
      });
      setPostBatchOpen(true);
      setRefreshTrigger((r) => r + 1);
      return { copied, failed };
    },
    [user?.id, currentProject, session?.access_token]
  );

  const onDownloadZip = useCallback(
    async (items: { fromPath: string; toName: string }[]) => {
      if (!currentProject) return;
      setZipLoading(true);
      let objectUrl: string | undefined;
      try {
        const res = await fetch("/api/export/zip", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectName: currentProject,
            items,
            accessToken: session?.access_token,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(typeof data.error === "string" ? data.error : "Erro ao gerar ZIP.");
        }
        const blob = await res.blob();
        objectUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = objectUrl;
        a.download = `${currentProject}-renomeados-${new Date().toISOString().slice(0, 10)}.zip`;
        a.click();
        setTimeout(() => {
          if (objectUrl) URL.revokeObjectURL(objectUrl);
        }, 200);
      } finally {
        setZipLoading(false);
      }
    },
    [currentProject, session?.access_token]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Projetos</h1>
        <p className="text-muted-foreground">
          Crie e gerencie projetos. Regras de renomeação, preview e aplicação no Storage.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Projeto</CardTitle>
          <CardDescription>
            Selecione o projeto para regras e preview, ou crie um novo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {projectLoading ? (
            <p className="text-sm text-muted-foreground">Carregando…</p>
          ) : (
            <>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                <div className="flex-1 space-y-1.5">
                  <Label htmlFor="projeto-select" className="text-xs">Projeto ativo</Label>
                  <select
                    id="projeto-select"
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
                </div>
                <div className="flex flex-col gap-3">
                <p className="text-xs text-muted-foreground">
                  Pasta principal = nome do projeto. Subpasta pode ser razão+operadora (na ingestão).
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="novo-razao" className="text-xs">Razão social do cliente *</Label>
                    <Input
                      id="novo-razao"
                      placeholder="Ex.: INGREDION"
                      className="h-9"
                      value={newProjectRazao}
                      onChange={(e) => setNewProjectRazao(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="novo-operadora" className="text-xs">Operadora *</Label>
                    <Input
                      id="novo-operadora"
                      placeholder="Ex.: UNIMED NACIONAL"
                      className="h-9"
                      value={newProjectOperadora}
                      onChange={(e) => setNewProjectOperadora(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="novo-projeto" className="text-xs">Nome da pasta do projeto (opcional)</Label>
                  <Input
                    id="novo-projeto"
                    placeholder="Deixe em branco = nome derivado de razão + operadora"
                    className="h-9"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleCreateProject())}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCreateProject}
                    disabled={creating || !newProjectRazao.trim() || !newProjectOperadora.trim()}
                  >
                    <FolderPlus className="mr-2 size-4" />
                    {creating ? "Criando…" : "Criar projeto"}
                  </Button>
                </div>
                </div>
              </div>
              {createError && <p className="text-xs text-destructive">{createError}</p>}
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5" />
              Regras
            </CardTitle>
            <CardDescription>
              Padrões de renomeação (melhores práticas + ingerência do usuário).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <PatternSelector
              value={selectedPatternId}
              onValueChange={setSelectedPatternId}
              patterns={patterns}
            />
            <SeedFullOverridesForm
              patternId={selectedPatternId}
              value={patternOverrides}
              onChange={setPatternOverrides}
            />
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setNewRuleOpen(true)}>
                Nova regra
              </Button>
              {isCustomId(selectedPatternId) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => {
                    removePattern(selectedPatternId);
                    setSelectedPatternId(DEFAULT_PATTERN_ID);
                  }}
                >
                  <Trash2 className="size-4" />
                  Remover regra
                </Button>
              )}
            </div>
            <NewRuleForm
              open={newRuleOpen}
              onOpenChange={setNewRuleOpen}
              onSubmit={(label, template) => {
                const added = addPattern(label, template);
                setSelectedPatternId(added.id);
              }}
            />
          </CardContent>
        </Card>
        <PreviewRenames
          onApplyRenames={user ? onApplyRenames : undefined}
          onCopyBatch={user?.id && currentProject ? onCopyBatch : undefined}
          applyTemplate={applyTemplate}
          storageFileNames={storageFileNames}
          searchQuery=""
        />
      </div>

      <PostBatchModal
        open={postBatchOpen}
        onOpenChange={setPostBatchOpen}
        data={postBatchData}
        onDownloadZip={onDownloadZip}
        downloadZipLoading={zipLoading}
      />
    </div>
  );
}
