"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { FileIngestion } from "@/components/file-ingestion";
import { NewRuleForm } from "@/components/new-rule-form";
import { PatternSelector } from "@/components/pattern-selector";
import { PreviewRenames, type PreviewItem } from "@/components/preview-renames";
import { SeedFullOverridesForm } from "@/components/seed-full-overrides-form";
import { SuggestWithAI } from "@/components/suggest-with-ai";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FileText, Search, Trash2 } from "lucide-react";
import { useCustomPatterns } from "@/hooks/use-custom-patterns";
import {
  createSeedFullApply,
  DEFAULT_PATTERN_ID,
  type SeedFullOverrides,
} from "@/lib/patterns";
import { renameFile } from "@/lib/storage";

const SEED_FULL_ID = "seed-full";

export function FileManagerContent() {
  const { user } = useAuth();
  const { patterns, addPattern, removePattern, isCustomId } = useCustomPatterns();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedPatternId, setSelectedPatternId] = useState(DEFAULT_PATTERN_ID);
  const [patternOverrides, setPatternOverrides] = useState<SeedFullOverrides>({});
  const [storageFileNames, setStorageFileNames] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newRuleOpen, setNewRuleOpen] = useState(false);

  useEffect(() => {
    if (patterns.length > 0 && !patterns.some((p) => p.id === selectedPatternId)) {
      setSelectedPatternId(DEFAULT_PATTERN_ID);
    }
  }, [patterns, selectedPatternId]);

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
        const { error } = await renameFile(user.id, item.from, item.to);
        if (error) {
          return { error: `${item.from}: ${error.message}` };
        }
      }
      setRefreshTrigger((r) => r + 1);
      return {};
    },
    [user?.id]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">File manager</h1>
        <p className="text-muted-foreground">
          Ingestão de arquivos (lote ou único), regras de renomeação, árvore e preview.
        </p>
      </div>

      <FileIngestion
        refreshTrigger={refreshTrigger}
        onFilesLoaded={(files) => setStorageFileNames(files.map((f) => f.name))}
        searchQuery={searchQuery}
      />

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
          applyTemplate={applyTemplate}
          storageFileNames={storageFileNames}
          searchQuery={searchQuery}
        />
      </div>
    </div>
  );
}
