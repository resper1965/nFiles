"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { SeedFullOverrides } from "@/lib/patterns";

const STORAGE_KEY = "nfiles-active-rule";

export type ActiveRule = {
  patternId: string;
  overrides: SeedFullOverrides;
};

type RulesContextValue = {
  activeRule: ActiveRule | null;
  setActiveRule: (patternId: string, overrides: SeedFullOverrides) => void;
};

const defaultOverrides: SeedFullOverrides = {};

const RulesContext = createContext<RulesContextValue | null>(null);

export function RulesProvider({ children }: { children: ReactNode }) {
  const [activeRule, setActiveRuleState] = useState<ActiveRule | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ActiveRule;
        if (parsed?.patternId && parsed?.overrides && typeof parsed.overrides === "object") {
          setActiveRuleState({
            patternId: parsed.patternId,
            overrides: { ...defaultOverrides, ...parsed.overrides },
          });
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const setActiveRule = useCallback((patternId: string, overrides: SeedFullOverrides) => {
    const rule: ActiveRule = { patternId, overrides: { ...defaultOverrides, ...overrides } };
    setActiveRuleState(rule);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rule));
    }
  }, []);

  const value: RulesContextValue = {
    activeRule,
    setActiveRule,
  };

  return (
    <RulesContext.Provider value={value}>{children}</RulesContext.Provider>
  );
}

export function useRules(): RulesContextValue {
  const ctx = useContext(RulesContext);
  if (!ctx) {
    throw new Error("useRules deve ser usado dentro de RulesProvider.");
  }
  return ctx;
}
