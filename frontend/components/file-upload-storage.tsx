"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import FileUpload, {
  type FileMetadata,
  type FileWithPreview,
} from "@/components/ui/file-upload";
import { IngestionRenameSection } from "@/components/ingestion-rename-section";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload } from "lucide-react";
import {
  listAllFilesUnderPrefix,
  uploadFile,
  createSignedUrl,
  type StorageFile,
} from "@/lib/storage";

function storageFileToMetadata(f: StorageFile): FileMetadata {
  const ext = f.name.includes(".") ? f.name.split(".").pop()?.toLowerCase() ?? "" : "";
  const mimeMap: Record<string, string> = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
    txt: "text/plain",
    csv: "text/csv",
  };
  return {
    name: f.name,
    size: 0,
    type: mimeMap[ext] ?? "application/octet-stream",
    url: "",
    id: f.path,
  };
}

export function FileUploadStorage() {
  const { user } = useAuth();
  const { currentProject } = useProject();
  const [initialFiles, setInitialFiles] = useState<FileMetadata[]>([]);
  const [uploadKey, setUploadKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFiles = useCallback(async () => {
    if (!user?.id || !currentProject?.trim()) {
      setInitialFiles([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const list = await listAllFilesUnderPrefix(user.id, currentProject, "");
      setInitialFiles(list.map(storageFileToMetadata));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao listar arquivos.");
      setInitialFiles([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, currentProject]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleFilesAdded = useCallback(
    async (added: FileWithPreview[]) => {
      if (!user?.id) return;
      setError(null);
      for (const item of added) {
        if (item.file instanceof File) {
          const { error: err } = await uploadFile(
            user.id,
            item.file,
            currentProject ?? undefined,
          );
          if (err) {
            setError(err.message);
            return;
          }
        }
      }
      await loadFiles();
      setUploadKey((k) => k + 1);
    },
    [user?.id, currentProject, loadFiles],
  );

  const handleGetFileUrl = useCallback(
    async (entry: FileWithPreview): Promise<string | undefined> => {
      if (entry.file instanceof File) return undefined;
      const path = entry.file.id;
      const { url, error: err } = await createSignedUrl(path, 60);
      if (err || !url) return undefined;
      return url;
    },
    [],
  );

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="size-5" />
            Estrutura de arquivos
          </CardTitle>
          <CardDescription>
            Faça login para ver e enviar arquivos no Storage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Use o menu para entrar e selecione um projeto.
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
          Estrutura de arquivos
        </CardTitle>
        <CardDescription>
          Lista e grade dos arquivos no Storage do projeto. Arraste ou adicione arquivos para enviar; a renomeação dos arquivos (conforme as regras de Projetos) é feita aqui. Abra ou baixe com os botões na linha.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!currentProject?.trim() ? (
          <p className="text-sm text-muted-foreground">
            Selecione um projeto acima para ver e enviar arquivos.
          </p>
        ) : loading && initialFiles.length === 0 ? (
          <p className="text-sm text-muted-foreground">Carregando lista…</p>
        ) : (
          <>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <FileUpload
              key={uploadKey}
              maxFiles={100}
              maxSize={50 * 1024 * 1024}
              initialFiles={initialFiles}
              onFilesAdded={handleFilesAdded}
              onGetFileUrl={handleGetFileUrl}
            />
            <IngestionRenameSection
              files={initialFiles}
              onRenamed={() => {
                loadFiles();
                setUploadKey((k) => k + 1);
              }}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
