import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const WINDOWS_INVALID_CHARS = /[<>:"/\\|?*]/g;

function sanitizeFileName(text: string): string {
  return text
    .replace(WINDOWS_INVALID_CHARS, "_")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 255);
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY não configurada" },
      { status: 503 }
    );
  }

  let body: {
    type: string;
    payload?: {
      currentName?: string;
      context?: string;
      metadata?: { createdAt?: string; contentType?: string; size?: number };
      contentSnippet?: string;
    };
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Body JSON inválido" },
      { status: 400 }
    );
  }

  const { type = "suggest-name", payload = {} } = body;
  const {
    currentName = "",
    context = "",
    metadata,
    contentSnippet = "",
  } = payload;

  if (!["suggest-name", "suggest-rule"].includes(type)) {
    return NextResponse.json(
      { error: "type deve ser suggest-name ou suggest-rule" },
      { status: 400 }
    );
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const indexRule =
      "Índice: RAZÃO SOCIAL DO CLIENTE | NOME DA OPERADORA | TIPO DE DOCUMENTO (ex.: CONTRATO, ADITAMENTO, CARTA, PROPOSTA COMERCIAL) | OBJETO DO DOCUMENTO (ex.: RENOVAÇÃO, REAJUSTE) | DATA DE EMISSÃO DO DOCUMENTO (DIA/MÊS/ANO). Exemplo: INGREDION | UNIMED NACIONAL | CONTRATO | RENOVAÇÃO | 04/02/2026.";

    const systemInstruction =
      type === "suggest-name"
        ? "Você sugere nomes de arquivos válidos para Windows: sem caracteres \\ / : * ? \" < > |. Use no máximo 255 caracteres. Resposta apenas com o nome sugerido, sem explicação."
        : "Você sugere regras ou templates de nomenclatura para renomeação de arquivos. Resposta em uma linha ou lista curta, em português. Mantenha melhores práticas: caracteres válidos no Windows, padrões legíveis.";

    const metaStr =
      metadata &&
      (metadata.createdAt || metadata.contentType != null || metadata.size != null)
        ? ` Metadados: ${metadata.createdAt ? `criado em ${metadata.createdAt}` : ""}${metadata.contentType ? `, tipo ${metadata.contentType}` : ""}${metadata.size != null ? `, tamanho ${metadata.size}` : ""}.`
        : "";
    const snippetStr = contentSnippet
      ? `\n\nConteúdo do documento (leia e extraia as informações abaixo para montar o nome):\n"${contentSnippet.slice(0, 4000).trim()}"`
      : "";
    const nameInstruction =
      contentSnippet
        ? `Os campos do índice (razão social do cliente, nome da operadora, tipo de documento, objeto do documento, data de emissão) podem ou não estar no título atual. LEIA o conteúdo do documento acima e extraia/infira esses campos. Gere o nome no formato: RAZÃO | OPERADORA | TIPO | OBJETO | DATA (DD/MM/ANO). Use maiúsculas e separador " | ".`
        : "Sugira um nome de arquivo no formato do índice quando possível.";
    const userPrompt =
      type === "suggest-name"
        ? `${nameInstruction} Nome atual do arquivo: "${currentName}".${metaStr}${snippetStr}${context ? `\nContexto: ${context}` : ""}`
        : `Sugira uma regra ou template de nomenclatura para renomeação de arquivos. ${context ? `Contexto: ${context}` : ""} Referência (opcional): ${indexRule}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        maxOutputTokens: 256,
      },
    });

    const text = response.text ?? "";

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: "Resposta vazia da IA" },
        { status: 502 }
      );
    }

    const suggestion = type === "suggest-name" ? sanitizeFileName(text.trim()) : text.trim();

    return NextResponse.json({ suggestion });
  } catch (err) {
    const raw = err instanceof Error ? err.message : String(err);
    const isInvalidKey =
      raw.includes("API key not valid") ||
      raw.includes("API_KEY_INVALID") ||
      raw.includes("INVALID_ARGUMENT");
    const message = isInvalidKey
      ? "Chave da API Gemini inválida. Obtenha uma chave em Google AI Studio (aistudio.google.com) e configure GEMINI_API_KEY nas variáveis de ambiente (Vercel ou .env.local)."
      : raw;
    return NextResponse.json(
      { error: message },
      { status: isInvalidKey ? 401 : 502 }
    );
  }
}
