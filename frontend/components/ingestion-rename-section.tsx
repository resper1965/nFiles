"use client";

import { useCallback, useMemo, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { useRules } from "@/contexts/rules-context";
import { useCustomPatterns } from "@/hooks/use-custom-patterns";
import {
  createSeedFullApply,
  resolveNameConflicts,
  type SeedFullOverrides,
} from "@/lib/patterns";
import { renameFile } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, RefreshCw, Swords } from "lucide-react";

const SEED_FULL_ID = "seed-full";

type FileEntry = { relativePath: string; baseName: string; dir: string };

function getRelativePath(fullPath: string, basePrefix: string): string {
  if (!fullPath.startsWith(basePrefix + "/")) return fullPath;
  return fullPath.slice(basePrefix.length + 1);
}

function dirname(rel: string): string {
  const i = rel.lastIndexOf("/");
  return i <= 0 ? "" : rel.slice(0, i);
}

function basename(rel: string): string {
  const i = rel.lastIndexOf("/");
  return i < 0 ? rel : rel.slice(i + 1);
}

type ApplyTemplateFn = (fileName: string, index: number) => string;

export function IngestionRenameSection({
  files,
  onRenamed,
}: {
  /** Lista de arquivos: id = path completo (userId/projectName/rel). */
  files: { id: string }[];
  onRenamed?: () => void;
}) {
  const { user } = useAuth();
  const { currentProject } = useProject();
  const { activeRule } = useRules();
  const { patterns } = useCustomPatterns();
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const basePrefix = useMemo(() => {
    if (!user?.id || !currentProject?.trim()) return "";
    return `${user.id}/${currentProject}`;
  }, [user?.id, currentProject]);

  const entries = useMemo((): FileEntry[] => {
    return files
      .map((f) => {
        const relativePath = getRelativePath(f.id, basePrefix);
        return {
          relativePath,
          baseName: basename(relativePath),
          dir: dirname(relativePath),
        };
      })
      .filter((e) => e.baseName && e.baseName !== ".keep");
  }, [files, basePrefix]);

  const applyTemplate = useMemo((): ApplyTemplateFn | null => {
    if (!activeRule) return null;
    if (activeRule.patternId === SEED_FULL_ID) {
      return createSeedFullApply(activeRule.overrides as SeedFullOverrides);
    }
    const p = patterns.find((x) => x.id === activeRule.patternId);
    return p?.apply ?? null;
  }, [activeRule, patterns]);

  const preview = useMemo(() => {
    if (!applyTemplate || entries.length === 0) return [];
    const rawNewNames = entries.map((e, i) => applyTemplate(e.baseName, i));
    const byDir = new Map<string, { idx: number; newName: string }[]>();
    entries.forEach((e, i) => {
      const list = byDir.get(e.dir) ?? [];
      list.push({ idx: i, newName: rawNewNames[i] });
      byDir.set(e.dir, list);
    });
    const resolved: string[] = Array.from({ length: entries.length });
    byDir.forEach((list) => {
      const names = resolveNameConflicts(list.map((x) => x.newName));
      list.forEach(({ idx }, j) => {
        resolved[idx] = names[j];
      });
    });
    return entries.map((e, i) => ({
      from: e.relativePath,
      to: e.dir ? `${e.dir}/${resolved[i]}` : resolved[i],
    }));
  }, [entries, applyTemplate]);

  const handleApply = useCallback(async () => {
    if (!user?.id || !currentProject?.trim() || preview.length === 0) return;
    setError(null);
    setApplying(true);
    try {
      for (const item of preview) {
        const { error: err } = await renameFile(
          user.id,
          item.from,
          item.to,
          currentProject
        );
        if (err) {
          setError(`${item.from}: ${err.message}`);
          return;
        }
      }
      onRenamed?.();
    } finally {
      setApplying(false);
    }
  }, [user?.id, currentProject, preview, onRenamed]);

  if (!currentProject?.trim() || entries.length === 0) return null;
  if (!activeRule || !applyTemplate) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Swords className="size-4" />
            Renomear arquivos
          </CardTitle>
          <CardDescription>
            Defina o padrão de nomenclatura na página <strong>Projetos</strong> (card Regras). Depois volte aqui para aplicar a renomeação.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Swords className="size-4" />
          Renomear arquivos
        </CardTitle>
        <CardDescription>
          Preview nome atual → nome novo (regra definida em Projetos). Nenhum arquivo é alterado até você clicar em &quot;Aplicar renomeação&quot;.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="max-h-48 overflow-auto rounded-md border border-border bg-muted/20 p-2 text-sm">
          <table className="w-full table-fixed border-collapse">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="w-1/2 py-1.5 pr-2 font-medium">Nome atual</th>
                <th className="py-1.5 font-medium">Nome novo</th>
              </tr>
            </thead>
            <tbody>
              {preview.map((row, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="truncate py-1 pr-2" title={row.from}>
                    {row.from}
                  </td>
                  <td className="truncate py-1" title={row.to}>
                    {row.to}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            onClick={handleApply}
            disabled={applying}
            aria-busy={applying}
          >
            {applying ? (
              <Loader2 className="mr-1.5 size-3.5 animate-spin" aria-hidden />
            ) : (
              <RefreshCw className="mr-1.5 size-3.5" aria-hidden />
            )}
            {applying ? "Aplicando…" : "Aplicar renomeação"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
