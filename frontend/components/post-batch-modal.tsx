"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CheckCircle, Download, FolderOpen, AlertCircle } from "lucide-react";

export type PostBatchData = {
  copied: number;
  failed: { fromPath: string; error: string }[];
  items: { from: string; to: string }[];
  projectName: string;
};

type PostBatchModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: PostBatchData | null;
  onDownloadZip: (items: { fromPath: string; toName: string }[]) => Promise<void>;
  downloadZipLoading?: boolean;
};

export function PostBatchModal({
  open,
  onOpenChange,
  data,
  onDownloadZip,
  downloadZipLoading = false,
}: PostBatchModalProps) {
  if (!data) return null;

  const hasFailures = data.failed.length > 0;
  const zipItems = data.items.map((i) => ({ fromPath: i.from, toName: i.to }));

  const handleDownloadZip = () => {
    onDownloadZip(zipItems);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <CheckCircle className="size-5 text-green-600 dark:text-green-400" />
            Cópia em massa concluída
          </SheetTitle>
          <SheetDescription>
            {data.copied} arquivo(s) copiado(s) para <strong>Renomeados</strong>
            {hasFailures && (
              <span className="block mt-1 text-destructive">
                {data.failed.length} falha(s). Ver detalhes abaixo.
              </span>
            )}
          </SheetDescription>
        </SheetHeader>
        {hasFailures && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm overflow-auto max-h-32">
            <p className="font-medium text-destructive mb-1 flex items-center gap-1">
              <AlertCircle className="size-4" />
              Falhas
            </p>
            <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
              {data.failed.map((f) => (
                <li key={f.fromPath}>
                  {f.fromPath}: {f.error}
                </li>
              ))}
            </ul>
          </div>
        )}
        <SheetFooter className="flex-row gap-2 sm:gap-2 mt-4">
          <Button
            type="button"
            variant="default"
            onClick={handleDownloadZip}
            disabled={downloadZipLoading}
          >
            {downloadZipLoading ? (
              "Gerando ZIP…"
            ) : (
              <>
                <Download className="size-4 mr-2" />
                Baixar ZIP com índices
              </>
            )}
          </Button>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            <FolderOpen className="size-4 mr-2" />
            Continuar no file manager
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
