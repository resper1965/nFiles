"use client";

import { FileIngestion } from "@/components/file-ingestion";

export default function IngestaoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ingestão</h1>
        <p className="text-muted-foreground">
          Envie arquivos em lote ou um por vez para o Storage. Use o File system para aplicar regras e renomear.
        </p>
      </div>
      <FileIngestion />
    </div>
  );
}
