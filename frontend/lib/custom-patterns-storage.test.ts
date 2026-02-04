import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  loadCustomPatterns,
  saveCustomPatterns,
  generateCustomPatternId,
} from "./custom-patterns-storage";
import { CUSTOM_PATTERN_PREFIX } from "./patterns";

describe("custom-patterns-storage", () => {
  const STORAGE_KEY = "nfiles-custom-patterns";
  let mockStorage: Record<string, string>;

  beforeEach(() => {
    mockStorage = {};
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) => mockStorage[key] ?? null,
        setItem: (key: string, value: string) => {
          mockStorage[key] = value;
        },
        removeItem: (key: string) => {
          delete mockStorage[key];
        },
        clear: () => {
          mockStorage = {};
        },
        length: 0,
        key: () => null,
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("loadCustomPatterns", () => {
    it("retorna [] quando localStorage vazio", () => {
      expect(loadCustomPatterns()).toEqual([]);
    });

    it("retorna [] quando chave não existe", () => {
      expect(loadCustomPatterns()).toEqual([]);
    });

    it("carrega array válido de padrões custom", () => {
      const items = [
        {
          id: `${CUSTOM_PATTERN_PREFIX}1`,
          label: "Meu padrão",
          template: "{nome}_{data}",
        },
      ];
      (window as unknown as { localStorage: Storage }).localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(items)
      );
      expect(loadCustomPatterns()).toHaveLength(1);
      expect(loadCustomPatterns()[0].label).toBe("Meu padrão");
      expect(loadCustomPatterns()[0].template).toBe("{nome}_{data}");
    });

    it("filtra itens com id que não começa com custom-", () => {
      const items = [
        { id: "custom-1", label: "A", template: "{nome}" },
        { id: "other-1", label: "B", template: "{data}" },
      ];
      (window as unknown as { localStorage: Storage }).localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(items)
      );
      const loaded = loadCustomPatterns();
      expect(loaded).toHaveLength(1);
      expect(loaded[0].id).toBe("custom-1");
    });
  });

  describe("saveCustomPatterns", () => {
    it("persiste array no localStorage", () => {
      const items = [
        {
          id: `${CUSTOM_PATTERN_PREFIX}123`,
          label: "Teste",
          template: "{indice}",
        },
      ];
      saveCustomPatterns(items);
      const raw = (window as unknown as { localStorage: Storage }).localStorage.getItem(
        STORAGE_KEY
      );
      expect(raw).toBeTruthy();
      const parsed = JSON.parse(raw!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].label).toBe("Teste");
    });
  });

  describe("generateCustomPatternId", () => {
    it("retorna string que começa com custom-", () => {
      expect(generateCustomPatternId().startsWith(CUSTOM_PATTERN_PREFIX)).toBe(true);
    });

    it("retorna ids únicos", () => {
      const ids = new Set<string>();
      for (let i = 0; i < 10; i++) {
        ids.add(generateCustomPatternId());
      }
      expect(ids.size).toBe(10);
    });
  });
});
