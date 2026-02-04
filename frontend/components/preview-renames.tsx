"use client";

import { useMemo, useState } from "react";
import { resolveNameConflicts } from "@/lib/patterns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { List, Plus, Trash2, Loader2, CheckCircle, AlertCircle, FolderInput, Package } from "lucide-react";

export type PreviewItem = { from: string; to: string };

const WINDOWS_INVALID = /[<>:"/\\|?*]/g;

function sanitize(name: string): string {
  return name.replace(WINDOWS_INVALID, "_").trim().slice(0, 255) || "arquivo";
}

function applySeedTemplate(name: string, index: number): string {
  const ext = name.match(/\.[^/.]+$/)?.[0] ?? "";
  const base = name.replace(/\.[^/.]+$/, "") || "arquivo";
  const date = new Date();
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  const safe = sanitize(base).toUpperCase().replace(/\s+/g, "_");
  return `${safe} | ${d}/${m}/${y}${index > 0 ? `_${index}` : ""}${ext}`;
}

export type ApplyTemplateFn = (fileName: string, index: number) => string;

export function PreviewRenames({
  items = [],
  onItemsChange,
  onApplyRenames,
  applyTemplate,
  storageFileNames = [],
  searchQuery = "",
}: {
  items?: PreviewItem[];
  onItemsChange?: (items: PreviewItem[]) => void;
  /** Se informado, mostra botão "Renomear" que aplica as renomeações (ex.: no Storage). */
  onApplyRenames?: (items: PreviewItem[]) => Promise<{ error?: string }>;
  /** Função que gera o nome novo a partir do nome atual e do índice. Se não informada, usa o padrão seed simplificado. */
  applyTemplate?: ApplyTemplateFn;
  /** Nomes dos arquivos no Storage (ingestão); se não vazio, mostra botão para usá-los no preview. */
  storageFileNames?: string[];
  /** Filtra as linhas exibidas (nome atual ou nome novo contém o termo). */
  searchQuery?: string;
}) {
  const [list, setList] = useState<PreviewItem[]>(items);
  const [inputValue, setInputValue] = useState("");
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState(false);
  const [seedLoading, setSeedLoading] = useState(false);

  const apply = applyTemplate ?? applySeedTemplate;

  const updateList = (next: PreviewItem[]) => {
    setList(next);
    onItemsChange?.(next);
  };

  const addFile = (name: string) => {
    const n = name.trim();
    if (!n) return;
    const next = [...list, { from: n, to: apply(n, list.length) }];
    const uniqueTos = resolveNameConflicts(next.map((x) => x.to));
    updateList(next.map((item, i) => ({ ...item, to: uniqueTos[i] })));
    setInputValue("");
  };

  const removeAt = (index: number) => {
    updateList(list.filter((_, i) => i !== index));
  };

  const removeByFrom = (from: string) => {
    updateList(list.filter((item) => item.from !== from));
  };

  const q = searchQuery.trim().toLowerCase();
  const filteredList = useMemo(
    () => (q ? list.filter((item) => item.from.toLowerCase().includes(q) || item.to.toLowerCase().includes(q)) : list),
    [list, q]
  );

  const generatePreview = () => {
    const toNames = list.map((item, i) => apply(item.from, i));
    const uniqueToNames = resolveNameConflicts(toNames);
    const next = list.map((item, i) => ({
      from: item.from,
      to: uniqueToNames[i],
    }));
    updateList(next);
  };

  const addNamesToList = (names: string[]) => {
    const currentFrom = new Set(list.map((i) => i.from));
    const toAdd = names.filter((n) => n.trim() && !currentFrom.has(n.trim()));
    if (toAdd.length === 0) return;
    const newItems = toAdd.map((name, i) => {
      const n = name.trim();
      return { from: n, to: apply(n, list.length + i) };
    });
    const allToNames = [...list.map((x) => x.to), ...newItems.map((x) => x.to)];
    const uniqueToNames = resolveNameConflicts(allToNames);
    const next = [
      ...list.map((item, i) => ({ ...item, to: uniqueToNames[i] })),
      ...newItems.map((item, i) => ({ ...item, to: uniqueToNames[list.length + i] })),
    ];
    updateList(next);
  };

  const handleUseStorageFiles = () => {
    addNamesToList(storageFileNames);
  };

  const handleUseSeedRepositorio = async () => {
    setSeedLoading(true);
    try {
      const r = await fetch("/seed-files.json");
      if (!r.ok) return;
      const data = (await r.json()) as { files?: string[] };
      const names = data.files ?? [];
      addNamesToList(names);
    } finally {
      setSeedLoading(false);
    }
  };

  const handleApplyRenames = async () => {
    if (!onApplyRenames || list.length === 0) return;
    setApplying(true);
    setApplyError(null);
    setApplySuccess(false);
    const result = await onApplyRenames(list);
    setApplying(false);
    if (result.error) {
      setApplyError(result.error);
    } else {
      setApplySuccess(true);
      updateList([]);
      setTimeout(() => setApplySuccess(false), 3000);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <List className="size-5" />
          Preview
        </CardTitle>
        <CardDescription>
          Nome atual → nome novo. Adicione arquivos e gere o preview com o padrão escolhido nas Regras.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Nome do arquivo (ex.: contrato_antigo.pdf)"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFile(inputValue))}
            className="flex-1"
          />
          <Button type="button" variant="outline" size="icon" onClick={() => addFile(inputValue)}>
            <Plus className="size-4" />
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleUseSeedRepositorio}
            disabled={seedLoading}
          >
            {seedLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Package className="size-4" />
            )}
            Usar seed do repositório
          </Button>
          {storageFileNames.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleUseStorageFiles}
            >
              <FolderInput className="size-4" />
              Usar arquivos do Storage ({storageFileNames.length})
            </Button>
          )}
          <Button type="button" variant="secondary" size="sm" onClick={generatePreview}>
            Gerar preview
          </Button>
          {onApplyRenames && list.length > 0 && (
            <Button
              type="button"
              size="sm"
              disabled={applying}
              onClick={handleApplyRenames}
            >
              {applying ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Aplicando…
                </>
              ) : (
                "Renomear"
              )}
            </Button>
          )}
        </div>
        {applyError && (
          <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            {applyError}
          </div>
        )}
        {applySuccess && (
          <div className="flex items-center gap-2 rounded-md border border-green-500/50 bg-green-500/10 px-3 py-2 text-sm text-green-700 dark:text-green-400">
            <CheckCircle className="size-4 shrink-0" />
            Renomeações aplicadas. Lista atualizada.
          </div>
        )}
        {list.length > 0 && (
          <div className="rounded-md border">
            <div className="grid grid-cols-[1fr_1fr_2.5rem] gap-2 p-2 text-sm font-medium text-muted-foreground border-b bg-muted/30">
              <span>Nome atual</span>
              <span>Nome novo</span>
              <span />
            </div>
            {filteredList.length === 0 ? (
              <p className="p-3 text-sm text-muted-foreground">
                Nenhuma linha corresponde à busca.
              </p>
            ) : (
              <>
                {q && filteredList.length !== list.length && (
                  <p className="px-2 py-1 text-xs text-muted-foreground border-b">
                    {filteredList.length} de {list.length} linhas
                  </p>
                )}
                {filteredList.map((item, i) => (
                  <div
                    key={item.from}
                    className="grid grid-cols-[1fr_1fr_2.5rem] gap-2 p-2 text-sm items-center border-b last:border-b-0"
                  >
                    <span className="truncate" title={item.from}>{item.from}</span>
                    <span className="truncate font-medium" title={item.to}>{item.to}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => removeByFrom(item.from)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
        {list.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Adicione nomes de arquivos acima e clique em &quot;Gerar preview&quot;.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
