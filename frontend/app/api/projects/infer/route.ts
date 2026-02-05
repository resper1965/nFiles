import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/api-auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";

/** Vocabulários permitidos (plano: criacao-projetos-razao-operadora-ia) */
const TIPOS_DOCUMENTO = [
  "CONTRATO",
  "ADITAMENTO",
  "CARTA",
  "PROPOSTA COMERCIAL",
  "TERMO DE ADITAMENTO",
  "OUTRO",
] as const;

const OBJETOS_SUGERIDOS = [
  "RENOVAÇÃO",
  "REAJUSTE",
  "ALTERAÇÃO DE REEMBOLSO",
  "ELEGIBILIDADE",
  "OUTRO",
] as const;

type InferResponse = {
  tipo_documento: string;
  objeto_documento: string;
};

function normalizeForMatch(s: string): string {
  return s
    .toUpperCase()
    .normalize("NFD")
    .replace(/\u0300/g, "")
    .trim();
}

function pickClosestOrOther(value: string, allowed: readonly string[]): string {
  const v = normalizeForMatch(value);
  if (!v) return allowed[allowed.length - 1] ?? "OUTRO";
  for (const a of allowed) {
    if (normalizeForMatch(a) === v) return a;
  }
  const lower = v.toLowerCase();
  for (const a of allowed) {
    if (a.toLowerCase().includes(lower) || lower.includes(a.toLowerCase())) return a;
  }
  return allowed[allowed.length - 1] ?? "OUTRO";
}

/** Cache em memória: chave normalizada (razão|operadora) → { tipo, objeto, expires } */
const inferCache = new Map<string, { tipo_documento: string; objeto_documento: string; expires: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1h

function cacheKey(razao: string, operadora: string): string {
  return `${normalizeForMatch(razao)}|${normalizeForMatch(operadora)}`;
}

export async function POST(request: NextRequest) {
  const auth = await getUserIdFromRequest(request, {});
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY não configurada" },
      { status: 503 }
    );
  }

  let body: { razao_social?: string; operadora?: string; file_names?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body JSON inválido" }, { status: 400 });
  }

  const razao_social = String(body.razao_social ?? "").trim();
  const operadora = String(body.operadora ?? "").trim();
  const file_names = Array.isArray(body.file_names) ? body.file_names.filter((n) => typeof n === "string").slice(0, 50) : [];
  if (!razao_social || !operadora) {
    return NextResponse.json(
      { error: "razao_social e operadora são obrigatórios" },
      { status: 400 }
    );
  }

  // 1. Cache: retornar resultado em cache se válido
  const key = cacheKey(razao_social, operadora);
  const cached = inferCache.get(key);
  if (cached && cached.expires > Date.now()) {
    return NextResponse.json({
      tipo_documento: cached.tipo_documento,
      objeto_documento: cached.objeto_documento,
    });
  }

  // 2. Retrieval: buscar projeto existente com mesmo par (razão + operadora) e usar tipo/objeto salvos
  try {
    const supabase = await createSupabaseServerClient();
    const { data: projects } = await supabase
      .from("projects")
      .select("razao_social, operadora, tipo_documento, objeto_documento")
      .eq("user_id", auth.userId)
      .limit(200);
    const normRazao = normalizeForMatch(razao_social);
    const normOperadora = normalizeForMatch(operadora);
    const found = (projects ?? []).find(
      (p) =>
        normalizeForMatch(String(p.razao_social ?? "")) === normRazao &&
        normalizeForMatch(String(p.operadora ?? "")) === normOperadora
    );
    if (found && (found.tipo_documento != null || found.objeto_documento != null)) {
      const tipo_documento = String(found.tipo_documento ?? "").trim() || (TIPOS_DOCUMENTO[TIPOS_DOCUMENTO.length - 1] ?? "OUTRO");
      const objeto_documento = String(found.objeto_documento ?? "").trim() || OBJETOS_SUGERIDOS[0];
      inferCache.set(key, {
        tipo_documento,
        objeto_documento,
        expires: Date.now() + CACHE_TTL_MS,
      });
      return NextResponse.json({ tipo_documento, objeto_documento });
    }
  } catch {
    // segue para IA se retrieval falhar
  }

  const systemInstruction = `Você é um assistente no domínio de gestão de documentos contratuais (saúde, operadoras, contratos e aditamentos).
Sua tarefa: dado a razão social do cliente e o nome da operadora, sugerir tipo de documento e objeto do documento.

Tipos de documento (escolha UM): ${TIPOS_DOCUMENTO.join(", ")}.
Objeto do documento: escolha ou sugira um valor coerente com: ${OBJETOS_SUGERIDOS.join(", ")}. Pode ser um valor da lista ou similar (ex.: RENOVAÇÃO, REAJUSTE, ALTERAÇÃO DE REEMBOLSO, ELEGIBILIDADE).

Responda APENAS com um JSON válido, sem markdown, sem explicação, no formato:
{"tipo_documento":"VALOR","objeto_documento":"VALOR"}`;

  const fewShot = `
Exemplos:
- Razão social: INGREDION, Operadora: UNIMED NACIONAL → {"tipo_documento":"CONTRATO","objeto_documento":"RENOVAÇÃO"}
- Razão social: ACME SA, Operadora: AMIL → {"tipo_documento":"TERMO DE ADITAMENTO","objeto_documento":"REAJUSTE"}
`;

  const fileNamesBlock =
    file_names.length > 0
      ? `\nNomes de arquivos existentes no projeto (use para inferir tipo e objeto de documento):\n${file_names.slice(0, 30).join("\n")}\n`
      : "";

  const userPrompt = `Razão social do cliente: ${razao_social}
Nome da operadora: ${operadora}
${fileNamesBlock}${fewShot}
Responda apenas com o JSON.`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        maxOutputTokens: 128,
      },
    });

    const text = response.text?.trim() ?? "";
    if (!text) {
      return NextResponse.json(
        { error: "Resposta vazia da IA" },
        { status: 502 }
      );
    }

    let parsed: InferResponse;
    try {
      const cleaned = text.replace(/^```json\s*|\s*```$/g, "").trim();
      parsed = JSON.parse(cleaned) as InferResponse;
    } catch {
      return NextResponse.json(
        { error: "Resposta da IA não é JSON válido" },
        { status: 502 }
      );
    }

    const tipo_documento = pickClosestOrOther(
      parsed.tipo_documento ?? "",
      TIPOS_DOCUMENTO
    );
    const objeto_documento =
      typeof parsed.objeto_documento === "string" && parsed.objeto_documento.trim()
        ? parsed.objeto_documento.trim()
        : OBJETOS_SUGERIDOS[0];

    inferCache.set(key, {
      tipo_documento,
      objeto_documento,
      expires: Date.now() + CACHE_TTL_MS,
    });

    return NextResponse.json({
      tipo_documento,
      objeto_documento,
    });
  } catch (err) {
    const raw = err instanceof Error ? err.message : String(err);
    const isInvalidKey =
      raw.includes("API key not valid") ||
      raw.includes("API_KEY_INVALID") ||
      raw.includes("INVALID_ARGUMENT");
    const message = isInvalidKey
      ? "Chave da API Gemini inválida."
      : raw;
    return NextResponse.json(
      { error: message },
      { status: isInvalidKey ? 401 : 502 }
    );
  }
}
