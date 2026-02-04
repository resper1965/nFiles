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

  let body: { type: string; payload?: { currentName?: string; context?: string } };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Body JSON inválido" },
      { status: 400 }
    );
  }

  const { type = "suggest-name", payload = {} } = body;
  const { currentName = "", context = "" } = payload;

  if (!["suggest-name", "suggest-rule"].includes(type)) {
    return NextResponse.json(
      { error: "type deve ser suggest-name ou suggest-rule" },
      { status: 400 }
    );
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const seedPattern =
      "Padrão sugerido (seed): RAZÃO SOCIAL | OPERADORA | TIPO DE DOCUMENTO (CONTRATO, TERMO DE ADITAMENTO, CARTA OU PROPOSTA COMERCIAL) | DESCRIÇÃO DO CONTEÚDO (RENOVAÇÃO, REAJUSTE, etc.) | DATA DIA/MÊS/ANO. Exemplo: INGREDION | UNIMED NACIONAL | CONTRATO | RENOVAÇÃO | 04/02/2026.";

    const systemInstruction =
      type === "suggest-name"
        ? "Você sugere nomes de arquivos válidos para Windows: sem caracteres \\ / : * ? \" < > |. Use no máximo 255 caracteres. Resposta apenas com o nome sugerido, sem explicação."
        : "Você sugere regras ou templates de nomenclatura para renomeação de arquivos. Resposta em uma linha ou lista curta, em português. Mantenha melhores práticas: caracteres válidos no Windows, padrões legíveis.";

    const userPrompt =
      type === "suggest-name"
        ? `Sugira um nome de arquivo apropriado. Nome atual: "${currentName}". ${context ? `Contexto: ${context}` : ""}`
        : `Sugira uma regra ou template de nomenclatura para renomeação de arquivos. ${context ? `Contexto: ${context}` : ""} Referência (opcional): ${seedPattern}`;

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
    const message = err instanceof Error ? err.message : "Erro ao chamar Gemini";
    return NextResponse.json(
      { error: message },
      { status: 502 }
    );
  }
}
