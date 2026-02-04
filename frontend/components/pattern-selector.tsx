"use client";

import { Label } from "@/components/ui/label";
import { NAMING_PATTERNS, type NamingPattern } from "@/lib/patterns";
import { cn } from "@/lib/utils";

export function PatternSelector({
  value,
  onValueChange,
  patterns = NAMING_PATTERNS,
  className,
}: {
  value: string;
  onValueChange: (id: string) => void;
  patterns?: NamingPattern[];
  className?: string;
}) {
  const selected = patterns.find((p) => p.id === value);
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor="pattern-select">Padrão de nomenclatura</Label>
      <select
        id="pattern-select"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_option]:bg-background [&_option]:text-foreground"
      >
        {patterns.map((p) => (
          <option key={p.id} value={p.id}>
            {p.label}
          </option>
        ))}
      </select>
      {selected?.description && (
        <p className="text-xs text-muted-foreground">{selected.description}</p>
      )}
    </div>
  );
}
