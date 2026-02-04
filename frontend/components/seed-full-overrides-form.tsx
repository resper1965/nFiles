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
}: {
  value: SeedFullOverrides;
  onChange: (v: SeedFullOverrides) => void;
  patternId: string;
  className?: string;
}) {
  if (patternId !== SEED_FULL_ID) return null;

  const update = (key: keyof SeedFullOverrides, text: string) => {
    onChange({ ...value, [key]: text });
  };

  return (
    <div className={cn("space-y-3 rounded-md border border-border bg-muted/20 p-3", className)}>
      <p className="text-xs font-medium text-muted-foreground">
        Preencha para usar no padrão Seed completo (opcional)
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="override-razao" className="text-xs">Razão social</Label>
          <Input
            id="override-razao"
            placeholder="Ex.: INGREDION"
            value={value.razao ?? ""}
            onChange={(e) => update("razao", e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="override-operadora" className="text-xs">Operadora</Label>
          <Input
            id="override-operadora"
            placeholder="Ex.: UNIMED NACIONAL"
            value={value.operadora ?? ""}
            onChange={(e) => update("operadora", e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="override-tipo" className="text-xs">Tipo doc</Label>
          <Input
            id="override-tipo"
            placeholder="Ex.: CONTRATO, TERMO DE ADITAMENTO"
            value={value.tipoDoc ?? ""}
            onChange={(e) => update("tipoDoc", e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="override-descricao" className="text-xs">Descrição</Label>
          <Input
            id="override-descricao"
            placeholder="Ex.: RENOVAÇÃO, REAJUSTE"
            value={value.descricao ?? ""}
            onChange={(e) => update("descricao", e.target.value)}
            className="h-8 text-sm"
          />
        </div>
      </div>
    </div>
  );
}
