"use client";

import { useCallback, useEffect, useState } from "react";
import {
  customToNamingPattern,
  NAMING_PATTERNS,
  type CustomPatternStored,
  type NamingPattern,
} from "@/lib/patterns";
import {
  loadCustomPatterns,
  saveCustomPatterns,
  generateCustomPatternId,
} from "@/lib/custom-patterns-storage";

export function useCustomPatterns(): {
  patterns: NamingPattern[];
  customPatterns: CustomPatternStored[];
  addPattern: (label: string, template: string) => CustomPatternStored;
  removePattern: (id: string) => void;
  isCustomId: (id: string) => boolean;
  refresh: () => void;
} {
  const [customPatterns, setCustomPatterns] = useState<CustomPatternStored[]>([]);

  const refresh = useCallback(() => {
    setCustomPatterns(loadCustomPatterns());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addPattern = useCallback((label: string, template: string): CustomPatternStored => {
    const next: CustomPatternStored = {
      id: generateCustomPatternId(),
      label: label.trim() || "Nova regra",
      template: template.trim(),
    };
    const list = [...loadCustomPatterns(), next];
    saveCustomPatterns(list);
    setCustomPatterns(list);
    return next;
  }, []);

  const removePattern = useCallback((id: string) => {
    const list = loadCustomPatterns().filter((p) => p.id !== id);
    saveCustomPatterns(list);
    setCustomPatterns(list);
  }, []);

  const isCustomId = useCallback((id: string) => id.startsWith("custom-"), []);

  const patterns: NamingPattern[] = [
    ...NAMING_PATTERNS,
    ...customPatterns.map(customToNamingPattern),
  ];

  return {
    patterns,
    customPatterns,
    addPattern,
    removePattern,
    isCustomId,
    refresh,
  };
}
