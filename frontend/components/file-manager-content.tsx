"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { FileTree } from "@/components/file-tree";
import { NewRuleForm } from "@/components/new-rule-form";
import { PatternSelector } from "@/components/pattern-selector";
import { PostBatchModal, type PostBatchData } from "@/components/post-batch-modal";
import { PreviewRenames, type PreviewItem } from "@/components/preview-renames";
import { SeedFullOverridesForm } from "@/components/seed-full-overrides-form";
import { SuggestWithAI } from "@/components/suggest-with-ai";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FileText, FolderTree, Search, Trash2 } from "lucide-react";
import { useCustomPatterns } from "@/hooks/use-custom-patterns";
import {
  createSeedFullApply,
  DEFAULT_PATTERN_ID,
  type SeedFullOverrides,
} from "@/lib/patterns";
import { expandSelectionToFiles, listFiles, renameFile } from "@/lib/storage";

const SEED_FULL_ID = "seed-full";

export function FileManagerContent() {
  const { user, session } = useAuth();
  const { currentProject } = useProject();
  const { patterns, addPattern, removePattern, isCustomId } = useCustomPatterns();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedPatternId, setSelectedPatternId] = useState(DEFAULT_PATTERN_ID);
  const [patternOverrides, setPatternOverrides] = useState<SeedFullOverrides>({});
  const [storageFileNames, setStorageFileNames] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newRuleOpen, setNewRuleOpen] = useState(false);
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());
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

  const applyTemplate = useMemo(() => {
    if (selectedPatternId === SEED_FULL_ID) {
      return createSeedFullApply(patternOverrides);
    }
    return patterns.find((p) => p.id === selectedPatternId)?.apply;
  }, [selectedPatternId, patternOverrides, patterns]);

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
        <h1 className="text-2xl font-bold tracking-tight">File system</h1>
        <p className="text-muted-foreground">
          Regras de renomeação, preview e aplicação no Storage. Use Ingestão no menu para enviar arquivos.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sugerir nome com IA</CardTitle>
          <CardDescription>
            Nome atual (opcional) para sugerir novo nome.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SuggestWithAI type="suggest-name" placeholder="Nome atual (opcional) para sugerir novo nome" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="size-5" />
            Busca
          </CardTitle>
          <CardDescription>
            Buscar na árvore, nas regras e nos resultados (preview).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Buscar na lista do Storage e no preview..."
            className="max-w-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderTree className="size-5" />
            Árvore
          </CardTitle>
          <CardDescription>
            Navegue por pastas e selecione arquivos para o lote. Use &quot;Selecionar pasta&quot; para incluir todos os arquivos de uma pasta. Depois use &quot;Usar seleção no preview&quot; no card Preview.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {user?.id && (
            <FileTree
              userId={user.id}
              projectName={currentProject}
              selectedPaths={selectedPaths}
              onSelectionChange={setSelectedPaths}
            />
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
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
            <SuggestWithAI type="suggest-rule" />
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
          searchQuery={searchQuery}
          selectionCount={selectedPaths.size}
          onUseSelection={
            user?.id && currentProject
              ? () => expandSelectionToFiles(user.id, currentProject, selectedPaths)
              : undefined
          }
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
