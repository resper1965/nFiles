"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SeedFullOverrides } from "@/lib/patterns";
import { cn } from "@/lib/utils";

const SEED_FULL_ID = "seed-full";

export function SeedFullOverridesForm({
  value,
  onChange,
  patternId,
  className,
  projectRazao,
  projectOperadora,
}: {
  value: SeedFullOverrides;
  onChange: (v: SeedFullOverrides) => void;
  patternId: string;
  className?: string;
  /** Razão social do projeto (definida na criação). Quando preenchida com projectOperadora, exibida como somente leitura. */
  projectRazao?: string;
  /** Operadora do projeto (definida na criação). Quando preenchida com projectRazao, exibida como somente leitura. */
  projectOperadora?: string;
}) {
  if (patternId !== SEED_FULL_ID) return null;

  const update = (key: keyof SeedFullOverrides, text: string) => {
    onChange({ ...value, [key]: text });
  };

  const fromProject = Boolean(projectRazao?.trim() && projectOperadora?.trim());

  return (
    <div className={cn("space-y-3 rounded-md border border-border bg-muted/20 p-3", className)}>
      <p className="text-xs font-medium text-muted-foreground">
        <strong>Padrão da nomenclatura:</strong> Razão | Operadora | Tipo | Objeto | Data. Razão e operadora vêm do <strong>projeto</strong> (definidos na criação). Tipo e objeto: <strong>em branco</strong> = inferir por documento (IA ou metadado); <strong>preencha</strong> para usar o mesmo valor em todos os arquivos. Data é preenchida automaticamente.
      </p>
      {fromProject ? (
        <div className="rounded-md border border-border/60 bg-muted/30 px-3 py-2">
          <p className="text-xs font-medium text-muted-foreground">Do projeto</p>
          <p className="text-sm font-medium text-foreground">
            {projectRazao} | {projectOperadora}
          </p>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Selecione um projeto para que razão e operadora sejam usadas nas regras (definidas na criação do projeto).
        </p>
      )}
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="override-tipo" className="text-xs">Tipo de documento</Label>
          <Input
            id="override-tipo"
            placeholder="Em branco = inferir por documento (IA/metadado)"
            value={value.tipoDoc ?? ""}
            onChange={(e) => update("tipoDoc", e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="override-descricao" className="text-xs">Objeto do documento</Label>
          <Input
            id="override-descricao"
            placeholder="Em branco = inferir por documento (IA/metadado)"
            value={value.descricao ?? ""}
            onChange={(e) => update("descricao", e.target.value)}
            className="h-8 text-sm"
          />
        </div>
      </div>
    </div>
  );
}
