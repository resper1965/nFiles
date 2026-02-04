"use client";

import { CUSTOM_PATTERN_PREFIX, type CustomPatternStored } from "./patterns";

const STORAGE_KEY = "nfiles-custom-patterns";

export function loadCustomPatterns(): CustomPatternStored[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (p): p is CustomPatternStored =>
        p &&
        typeof p === "object" &&
        typeof (p as CustomPatternStored).id === "string" &&
        (p as CustomPatternStored).id.startsWith(CUSTOM_PATTERN_PREFIX) &&
        typeof (p as CustomPatternStored).label === "string" &&
        typeof (p as CustomPatternStored).template === "string"
    );
  } catch {
    return [];
  }
}

export function saveCustomPatterns(items: CustomPatternStored[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export function generateCustomPatternId(): string {
  return `${CUSTOM_PATTERN_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
