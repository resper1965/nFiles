"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles } from "lucide-react";

type SuggestType = "suggest-name" | "suggest-rule";

export type SuggestPayload = {
  currentName?: string;
  context?: string;
  metadata?: { createdAt?: string; contentType?: string; size?: number };
  contentSnippet?: string;
};

export function SuggestWithAI({
  type = "suggest-name",
  currentName = "",
  onSuggestion,
  placeholder,
  payloadExtras,
  getContentSnippet,
}: {
  type?: SuggestType;
  currentName?: string;
  onSuggestion?: (suggestion: string) => void;
  placeholder?: string;
  /** Metadados e/ou trecho de conteúdo para enriquecer a sugestão (regra + IA). */
  payloadExtras?: SuggestPayload;
  /** Se informado, chama antes da sugestão para obter trecho do documento (ex.: extração de PDF/DOCX). A IA usa o conteúdo para extrair os campos do índice. */
  getContentSnippet?: () => Promise<string | undefined>;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState("");
  const [inputValue, setInputValue] = useState(currentName);

  async function handleSuggest() {
    setLoading(true);
    setError(null);
    setSuggestion("");
    try {
      let contentSnippet = payloadExtras?.contentSnippet;
      if (!contentSnippet && getContentSnippet) {
        contentSnippet = (await getContentSnippet()) ?? undefined;
      }
      const payload: SuggestPayload = {
        currentName: inputValue.trim(),
        context: type === "suggest-rule" ? "Índice: RAZÃO SOCIAL DO CLIENTE | NOME DA OPERADORA | TIPO DE DOCUMENTO | OBJETO DO DOCUMENTO | DATA DE EMISSÃO DO DOCUMENTO" : "",
        ...payloadExtras,
        ...(contentSnippet ? { contentSnippet } : {}),
      };
      const res = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, payload }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao obter sugestão");
        return;
      }
      const text = data.suggestion ?? "";
      setSuggestion(text);
      onSuggestion?.(text);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro de rede");
    } finally {
      setLoading(false);
    }
  }

  const label = type === "suggest-name" ? "Sugerir nome com IA" : "Sugerir regra com IA";

  return (
    <div className="space-y-2">
      {type === "suggest-name" && (
        <Input
          placeholder={placeholder ?? "Nome atual do arquivo (opcional)"}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="max-w-md"
        />
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleSuggest}
        disabled={loading}
      >
        <Sparkles className="mr-2 size-4" />
        {loading ? "Gerando…" : label}
      </Button>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      {suggestion && (
        <div className="rounded-md border bg-muted/50 p-2 text-sm">
          <p className="text-muted-foreground mb-1">Sugestão:</p>
          <p className="font-medium">{suggestion}</p>
          {onSuggestion && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() => onSuggestion(suggestion)}
            >
              Usar sugestão
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
