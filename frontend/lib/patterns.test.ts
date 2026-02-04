import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  sanitize,
  resolveNameConflicts,
  validateCustomTemplate,
  createApplyFromTemplate,
  customToNamingPattern,
  getPatternById,
  NAMING_PATTERNS,
  DEFAULT_PATTERN_ID,
  createSeedFullApply,
  CUSTOM_PATTERN_PREFIX,
  type CustomPatternStored,
  type SeedFullOverrides,
} from "./patterns";

describe("sanitize", () => {
  it("remove caracteres inválidos no Windows", () => {
    expect(sanitize("a<b>c")).toBe("a_b_c");
    expect(sanitize('a:b*c"d')).toBe("a_b_c_d");
    expect(sanitize("a/b\\c|d?e*f")).toBe("a_b_c_d_e_f");
  });

  it("trim e limita a 255 caracteres", () => {
    expect(sanitize("  x  ")).toBe("x");
    expect(sanitize("")).toBe("arquivo");
    expect(sanitize("a".repeat(300)).length).toBe(255);
  });
});

describe("resolveNameConflicts", () => {
  it("mantém nomes únicos inalterados", () => {
    expect(resolveNameConflicts(["a.pdf", "b.pdf"])).toEqual(["a.pdf", "b.pdf"]);
  });

  it("adiciona _1, _2 para duplicatas", () => {
    expect(resolveNameConflicts(["x.pdf", "x.pdf", "x.pdf"])).toEqual([
      "x.pdf",
      "x_1.pdf",
      "x_2.pdf",
    ]);
  });

  it("preserva extensão ao inserir sufixo", () => {
    expect(resolveNameConflicts(["doc.docx", "doc.docx"])).toEqual([
      "doc.docx",
      "doc_1.docx",
    ]);
  });

  it("funciona sem extensão", () => {
    expect(resolveNameConflicts(["nome", "nome"])).toEqual(["nome", "nome_1"]);
  });

  it("retorna array vazio para entrada vazia", () => {
    expect(resolveNameConflicts([])).toEqual([]);
  });
});

describe("validateCustomTemplate", () => {
  it("retorna true quando template tem {nome}", () => {
    expect(validateCustomTemplate("{nome}")).toBe(true);
    expect(validateCustomTemplate("prefixo_{nome}_sufixo")).toBe(true);
  });

  it("retorna true quando template tem {data}", () => {
    expect(validateCustomTemplate("{data}")).toBe(true);
  });

  it("retorna true quando template tem {indice}", () => {
    expect(validateCustomTemplate("{indice}")).toBe(true);
  });

  it("retorna false quando template não tem placeholder", () => {
    expect(validateCustomTemplate("")).toBe(false);
    expect(validateCustomTemplate("   ")).toBe(false);
    expect(validateCustomTemplate("só texto")).toBe(false);
  });
});

describe("createApplyFromTemplate", () => {
  it("substitui {nome}, {data}, {indice} e preserva extensão", () => {
    const apply = createApplyFromTemplate("{nome}_{indice}_{data}");
    const result = apply("meu-arquivo.pdf", 2);
    expect(result).toMatch(/^meu-arquivo_2_\d{2}_\d{2}_\d{4}\.pdf$/);
    expect(result.endsWith(".pdf")).toBe(true);
  });

  it("usa extensão vazia quando não há extensão", () => {
    const apply = createApplyFromTemplate("{nome}");
    expect(apply("semext", 0)).toBe("semext");
  });
});

describe("customToNamingPattern", () => {
  it("converte CustomPatternStored em NamingPattern com apply funcional", () => {
    const stored: CustomPatternStored = {
      id: "custom-1",
      label: "Meu padrão",
      template: "{nome}.{indice}",
    };
    const pattern = customToNamingPattern(stored);
    expect(pattern.id).toBe("custom-1");
    expect(pattern.label).toBe("Meu padrão");
    expect(pattern.description).toContain("Template:");
    const out = pattern.apply("x.pdf", 1);
    expect(out).toBe("x.1.pdf");
  });
});

describe("getPatternById", () => {
  it("retorna padrão existente", () => {
    expect(getPatternById("seed-simple")).toBeDefined();
    expect(getPatternById("seed-simple")?.label).toContain("Seed");
  });

  it("retorna undefined para id inexistente", () => {
    expect(getPatternById("inexistente")).toBeUndefined();
  });
});

describe("NAMING_PATTERNS", () => {
  it("tem pelo menos 4 padrões built-in", () => {
    expect(NAMING_PATTERNS.length).toBeGreaterThanOrEqual(4);
  });

  it("DEFAULT_PATTERN_ID é o primeiro", () => {
    expect(NAMING_PATTERNS[0].id).toBe(DEFAULT_PATTERN_ID);
  });

  it("todos os padrões têm apply que retorna string", () => {
    NAMING_PATTERNS.forEach((p) => {
      const out = p.apply("teste.pdf", 0);
      expect(typeof out).toBe("string");
      expect(out.length).toBeGreaterThan(0);
    });
  });
});

describe("createSeedFullApply", () => {
  it("usa overrides quando preenchidos", () => {
    const overrides: SeedFullOverrides = {
      operadora: "UNIMED",
      tipoDoc: "CONTRATO",
      descricao: "RENOVACAO",
    };
    const apply = createSeedFullApply(overrides);
    const out = apply("qualquer.pdf", 0);
    expect(out).toContain("UNIMED");
    expect(out).toContain("CONTRATO");
    expect(out).toContain("RENOVACAO");
    expect(out).toMatch(/\.pdf$/);
  });

  it("CUSTOM_PATTERN_PREFIX é custom-", () => {
    expect(CUSTOM_PATTERN_PREFIX).toBe("custom-");
  });
});
