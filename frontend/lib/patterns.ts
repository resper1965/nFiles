/**
 * Motor de escolha de padrões — catálogo e aplicação.
 * Todos os padrões usam melhores práticas: caracteres válidos no Windows, tamanho ≤ 255.
 */

const WINDOWS_INVALID = /[<>:"/\\|?*]/g;

export function sanitize(name: string): string {
  return name.replace(WINDOWS_INVALID, "_").trim().slice(0, 255) || "arquivo";
}

function dateSegment(): string {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/** Extrai a extensão do arquivo (inclui o ponto, ex.: ".pdf"). */
function getExtension(name: string): string {
  const m = name.match(/\.[^/.]+$/);
  return m ? m[0] : "";
}

/**
 * Garante que nenhum nome se repete: para duplicatas, insere _1, _2, … antes da extensão.
 * Primeira ocorrência mantém o nome; as seguintes recebem sufixo numérico.
 */
export function resolveNameConflicts(names: string[]): string[] {
  const used = new Set<string>();
  return names.map((name) => {
    const ext = getExtension(name);
    const base = ext ? name.slice(0, -ext.length) : name;
    let candidate = name;
    let n = 0;
    while (used.has(candidate)) {
      n++;
      candidate = `${base}_${n}${ext}`;
    }
    used.add(candidate);
    return candidate;
  });
}

export type NamingPattern = {
  id: string;
  label: string;
  description: string;
  apply: (fileName: string, index: number) => string;
};

/** Padrão seed simplificado: RAZÃO | DATA (base do nome + data). Preserva extensão. */
function applySeedSimple(name: string, index: number): string {
  const ext = getExtension(name);
  const base = name.replace(/\.[^/.]+$/, "") || "arquivo";
  const safe = sanitize(base).toUpperCase().replace(/\s+/g, "_");
  const date = dateSegment();
  const suffix = index > 0 ? `_${index}` : "";
  return `${safe} | ${date}${suffix}${ext}`;
}

/** Padrão seed completo: RAZÃO | OPERADORA | TIPO DOC | DESCRIÇÃO | DATA. Preserva extensão. */
function applySeedFull(name: string, index: number): string {
  const ext = getExtension(name);
  const base = name.replace(/\.[^/.]+$/, "") || "arquivo";
  const safe = sanitize(base).toUpperCase().replace(/\s+/g, "_");
  const date = dateSegment();
  const suffix = index > 0 ? `_${index}` : "";
  return `${safe} | OPERADORA | TIPO_DOC | DESCRICAO | ${date}${suffix}${ext}`;
}

/** Overrides para o padrão Seed completo (ingerência do usuário). */
export type SeedFullOverrides = {
  razao?: string;
  operadora?: string;
  tipoDoc?: string;
  descricao?: string;
};

function toSegment(value: string | undefined, fallback: string): string {
  if (!value || !value.trim()) return fallback;
  return sanitize(value.trim()).toUpperCase().replace(/\s+/g, "_").slice(0, 80);
}

/**
 * Retorna uma função apply que usa os overrides para o padrão Seed completo.
 * RAZÃO: override ou derivado do nome do arquivo; OPERADORA, TIPO_DOC, DESCRICAO: overrides ou placeholders.
 */
export function createSeedFullApply(overrides: SeedFullOverrides): (fileName: string, index: number) => string {
  return (name: string, index: number) => {
    const ext = getExtension(name);
    const base = name.replace(/\.[^/.]+$/, "") || "arquivo";
    const razao = toSegment(overrides.razao, sanitize(base).toUpperCase().replace(/\s+/g, "_"));
    const operadora = toSegment(overrides.operadora, "OPERADORA");
    const tipoDoc = toSegment(overrides.tipoDoc, "TIPO_DOC");
    const descricao = toSegment(overrides.descricao, "DESCRICAO");
    const date = dateSegment();
    const suffix = index > 0 ? `_${index}` : "";
    return `${razao} | ${operadora} | ${tipoDoc} | ${descricao} | ${date}${suffix}${ext}`;
  };
}

/** Data no início + nome: DATA_NOME. Preserva extensão. */
function applyDateFirst(name: string, index: number): string {
  const ext = getExtension(name);
  const base = name.replace(/\.[^/.]+$/, "") || "arquivo";
  const safe = sanitize(base).replace(/\s+/g, "_");
  const date = dateSegment();
  const suffix = index > 0 ? `_${index}` : "";
  return `${date}_${safe}${suffix}${ext}`;
}

/** Slug: minúsculas, hífens. Preserva extensão. */
function applySlug(name: string, index: number): string {
  const ext = getExtension(name);
  const base = name.replace(/\.[^/.]+$/, "") || "arquivo";
  const safe = sanitize(base).toLowerCase().replace(/\s+/g, "-").replace(/-+/g, "-");
  const suffix = index > 0 ? `-${index}` : "";
  return `${safe}${suffix}${ext}`;
}

export const NAMING_PATTERNS: NamingPattern[] = [
  {
    id: "seed-simple",
    label: "Seed (RAZÃO | DATA)",
    description: "Nome em maiúsculas + data no final. Ex.: CONTRATO_ANTIGO | 04/02/2026",
    apply: applySeedSimple,
  },
  {
    id: "seed-full",
    label: "Seed completo (RAZÃO | OPERADORA | TIPO | DESCRIÇÃO | DATA)",
    description: "Padrão completo do seed; edite manualmente OPERADORA, TIPO_DOC e DESCRICAO após gerar.",
    apply: applySeedFull,
  },
  {
    id: "date-first",
    label: "Data no início (DATA_NOME)",
    description: "Data no início + nome. Ex.: 04/02/2026_contrato_antigo",
    apply: applyDateFirst,
  },
  {
    id: "slug",
    label: "Slug (minúsculas, hífens)",
    description: "Nome em minúsculas com hífens. Ex.: contrato-antigo",
    apply: applySlug,
  },
];

export const DEFAULT_PATTERN_ID = NAMING_PATTERNS[0].id;

export function getPatternById(id: string): NamingPattern | undefined {
  return NAMING_PATTERNS.find((p) => p.id === id);
}

// --- Padrões customizados (Nova regra) ---

export type CustomPatternStored = {
  id: string;
  label: string;
  template: string;
};

const PLACEHOLDERS = ["{nome}", "{data}", "{indice}"] as const;

/** Verifica se o template usa ao menos um placeholder. */
export function validateCustomTemplate(template: string): boolean {
  const t = template.trim();
  return PLACEHOLDERS.some((p) => t.includes(p));
}

/**
 * Cria função apply a partir de um template com placeholders:
 * {nome} = base do arquivo (sem extensão, sanitizado); {data} = DD/MM/YYYY; {indice} = 0, 1, 2...
 * A extensão do arquivo é sempre preservada no final.
 */
export function createApplyFromTemplate(template: string): (fileName: string, index: number) => string {
  return (name: string, index: number) => {
    const ext = getExtension(name);
    const base = name.replace(/\.[^/.]+$/, "") || "arquivo";
    const nome = sanitize(base).replace(/\s+/g, "_");
    const data = dateSegment();
    let out = template
      .replace(/\{nome\}/g, nome)
      .replace(/\{data\}/g, data)
      .replace(/\{indice\}/g, String(index));
    out = sanitize(out) || "arquivo";
    return out + ext;
  };
}

/** Converte padrão customizado armazenado em NamingPattern para uso no seletor. */
export function customToNamingPattern(p: CustomPatternStored): NamingPattern {
  return {
    id: p.id,
    label: p.label,
    description: `Template: ${p.template}`,
    apply: createApplyFromTemplate(p.template),
  };
}

export const CUSTOM_PATTERN_PREFIX = "custom-";
