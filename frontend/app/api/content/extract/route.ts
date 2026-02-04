import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  createSupabaseServerClient,
  createSupabaseServiceRoleClient,
} from "@/lib/supabase-server";

const FILES_BUCKET = "files";
const MAX_SNIPPET_CHARS = 4000;

function pathBelongsToUser(path: string, userId: string): boolean {
  const normalized = path.replace(/\/+/g, "/").trim();
  const prefix = `${userId}/`;
  if (!normalized.startsWith(prefix)) return false;
  if (normalized.includes("..")) return false;
  return true;
}

function getMimeFromExtension(name: string): string {
  const ext = name.replace(/^.*\./, "").toLowerCase();
  const map: Record<string, string> = {
    pdf: "application/pdf",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    doc: "application/msword",
  };
  return map[ext] ?? "application/octet-stream";
}

export async function POST(request: NextRequest) {
  let body: { path: string; accessToken?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body JSON inválido" }, { status: 400 });
  }

  const path = typeof body.path === "string" ? body.path.trim() : "";
  if (!path) {
    return NextResponse.json({ error: "path é obrigatório" }, { status: 400 });
  }

  let userId: string | null = null;
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) userId = user.id;
  } catch {
    // cookies/session não disponíveis
  }

  if (!userId && body.accessToken && typeof body.accessToken === "string") {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const anon = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (url && anon) {
        const client = createClient(url, anon);
        const { data: { session }, error } = await client.auth.setSession({
          access_token: body.accessToken,
          refresh_token: "",
        });
        if (!error && session?.user?.id) userId = session.user.id;
      }
    } catch {
      // ignore
    }
  }

  if (!userId) {
    return NextResponse.json(
      { error: "Não autenticado. Faça login ou envie accessToken no body." },
      { status: 401 }
    );
  }

  if (!pathBelongsToUser(path, userId)) {
    return NextResponse.json(
      { error: "Path não pertence ao usuário ou é inválido." },
      { status: 403 }
    );
  }

  let buffer: ArrayBuffer;
  try {
    const serviceClient = createSupabaseServiceRoleClient();
    const { data, error } = await serviceClient.storage.from(FILES_BUCKET).download(path);
    if (error || !data) {
      return NextResponse.json(
        { error: error?.message ?? "Arquivo não encontrado" },
        { status: 404 }
      );
    }
    buffer = await data.arrayBuffer();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao baixar arquivo";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  const name = path.replace(/^.*\//, "");
  const mime = getMimeFromExtension(name);
  let text = "";

  try {
    if (mime === "application/pdf") {
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: Buffer.from(buffer) });
      const result = await parser.getText();
      text = result?.text ?? "";
      await parser.destroy();
    } else if (
      mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      mime === "application/msword"
    ) {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) });
      text = result?.value ?? "";
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao extrair texto";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  const snippet = text.slice(0, MAX_SNIPPET_CHARS).trim();
  return NextResponse.json({ snippet });
}
