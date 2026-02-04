"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Loader2, Download, AlertCircle } from "lucide-react";
import {
  listFiles,
  uploadFile,
  createSignedUrl,
  type StorageFile,
} from "@/lib/storage";

export function FileIngestion({
  refreshTrigger,
  onFilesLoaded,
  searchQuery = "",
}: {
  /** Incrementar para forçar nova listagem (ex.: após renomear no Storage). */
  refreshTrigger?: number;
  /** Chamado quando a lista de arquivos do Storage é carregada ou atualizada. */
  onFilesLoaded?: (files: StorageFile[]) => void;
  /** Filtra a lista exibida por nome (busca). */
  searchQuery?: string;
} = {}) {
  const { user } = useAuth();
  const { currentProject } = useProject();
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputBatchRef = useRef<HTMLInputElement>(null);
  const inputSingleRef = useRef<HTMLInputElement>(null);

  const loadFiles = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const list = await listFiles(user.id, currentProject ?? "");
      setFiles(list);
      onFilesLoaded?.(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao listar arquivos.");
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, currentProject, onFilesLoaded]);

  useEffect(() => {
    if (user?.id) {
      loadFiles();
    } else {
      setFiles([]);
      setError(null);
    }
  }, [user?.id, loadFiles, refreshTrigger]);

  const handleFileInput = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files;
      if (!selected?.length || !user?.id) return;
      setUploading(true);
      setError(null);
      let hasError = false;
      for (let i = 0; i < selected.length; i++) {
        const file = selected[i];
        const { error: err } = await uploadFile(user.id, file, currentProject ?? undefined);
        if (err) {
          setError(err.message);
          hasError = true;
        }
      }
      if (!hasError) await loadFiles();
      setUploading(false);
      e.target.value = "";
    },
    [user?.id, currentProject, loadFiles]
  );

  const handleDownload = useCallback(async (path: string) => {
    const { url, error: err } = await createSignedUrl(path, 60);
    if (err || !url) return;
    window.open(url, "_blank");
  }, []);

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="size-5" />
            Ingestão
          </CardTitle>
          <CardDescription>
            Envie arquivos em lote ou um a um. Após renomear, os arquivos entram no file manager.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            <Link href="/login" className="underline hover:text-foreground">
              Faça login
            </Link>{" "}
            para enviar e listar arquivos no Storage.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="size-5" />
          Ingestão
        </CardTitle>
        <CardDescription>
          Envie arquivos em lote ou um a um. Após renomear, os arquivos entram no file manager.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          ref={inputBatchRef}
          type="file"
          multiple
          className="hidden"
          accept="*/*"
          onChange={handleFileInput}
        />
        <input
          ref={inputSingleRef}
          type="file"
          className="hidden"
          accept="*/*"
          onChange={handleFileInput}
        />
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            disabled={uploading}
            onClick={() => inputBatchRef.current?.click()}
          >
            {uploading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Enviando…
              </>
            ) : (
              <>
                <Upload className="size-4" />
                Selecionar arquivos (lote)
              </>
            )}
          </Button>
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            disabled={uploading}
            onClick={() => inputSingleRef.current?.click()}
          >
            {uploading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Enviando…
              </>
            ) : (
              "Adicionar arquivo único"
            )}
          </Button>
        </div>
        {error && (
          <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </div>
        )}
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Carregando lista…
          </div>
        ) : files.length > 0 ? (
          (() => {
            const q = searchQuery.trim().toLowerCase();
            const filtered = q ? files.filter((f) => f.name.toLowerCase().includes(q)) : files;
            return (
          <div className="rounded-md border">
            <div className="border-b bg-muted/30 px-3 py-2 text-sm font-medium text-muted-foreground">
              {q && filtered.length !== files.length
                ? `Arquivos no Storage (${filtered.length} de ${files.length})`
                : `Arquivos no Storage (${files.length})`}
            </div>
            <ul className="max-h-48 overflow-y-auto">
              {filtered.map((f) => (
                <li
                  key={f.path}
                  className="flex items-center justify-between gap-2 border-b px-3 py-2 last:border-b-0"
                >
                  <span className="flex items-center gap-2 truncate text-sm">
                    <FileText className="size-4 shrink-0 text-muted-foreground" />
                    {f.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0"
                    onClick={() => handleDownload(f.path)}
                  >
                    <Download className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
            );
          })()
        ) : (
          <p className="text-sm text-muted-foreground">
            Nenhum arquivo ainda. Use os botões acima para enviar.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
