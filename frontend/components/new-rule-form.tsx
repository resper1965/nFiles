"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { validateCustomTemplate } from "@/lib/patterns";

export function NewRuleForm({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (label: string, template: string) => void;
}) {
  const [label, setLabel] = useState("");
  const [template, setTemplate] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const t = template.trim();
    if (!t) {
      setError("Informe o template.");
      return;
    }
    if (!validateCustomTemplate(t)) {
      setError("O template deve usar ao menos um placeholder: {nome}, {data} ou {indice}.");
      return;
    }
    onSubmit(label.trim() || "Nova regra", t);
    setLabel("");
    setTemplate("");
    onOpenChange(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) setError(null);
    onOpenChange(next);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Nova regra</SheetTitle>
          <SheetDescription>
            Crie um padrão de nomenclatura usando os placeholders:{" "}
            <code className="rounded bg-muted px-1 text-xs">{`{nome}`}</code>,{" "}
            <code className="rounded bg-muted px-1 text-xs">{`{data}`}</code>,{" "}
            <code className="rounded bg-muted px-1 text-xs">{`{indice}`}</code>. A extensão do arquivo é preservada.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
          <div className="space-y-2">
            <Label htmlFor="new-rule-label">Nome do padrão</Label>
            <Input
              id="new-rule-label"
              placeholder="Ex.: Meu padrão"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-rule-template">Template</Label>
            <Input
              id="new-rule-template"
              placeholder={"Ex.: {nome} | {data}"}
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
            />
          </div>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <SheetFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar regra</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
