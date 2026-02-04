import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase-server";
import { getUserIdFromRequest, isValidProjectRelativePath, pathBelongsToUser } from "@/lib/api-auth";

const FILES_BUCKET = "files";
const RENOMEADOS_FOLDER = "Renomeados";

export type CopyBatchItem = { fromPath: string; toName: string };
export type CopyBatchBody = {
  projectName: string;
  items: CopyBatchItem[];
  accessToken?: string;
};
export type CopyBatchResponse = {
  copied: number;
  failed: { fromPath: string; error: string }[];
};

function sanitizeFileName(name: string): string {
  return name.replace(/[<>:"/\\|?*]/g, "_").trim().slice(0, 255) || "arquivo";
}

export async function POST(request: NextRequest) {
  let body: CopyBatchBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body JSON inválido" }, { status: 400 });
  }

  const projectName = typeof body.projectName === "string" ? body.projectName.trim() : "";
  if (!projectName) {
    return NextResponse.json({ error: "projectName é obrigatório" }, { status: 400 });
  }

  const items = Array.isArray(body.items) ? body.items : [];
  if (items.length === 0) {
    return NextResponse.json({ error: "items não pode ser vazio" }, { status: 400 });
  }

  const userIdResult = await getUserIdFromRequest(request, body);
  if ("error" in userIdResult) {
    return NextResponse.json({ error: userIdResult.error }, { status: userIdResult.status });
  }
  const userId = userIdResult.userId;

  const basePath = `${userId}/${projectName}`;
  for (const item of items) {
    const fromPath = typeof item.fromPath === "string" ? item.fromPath.trim() : "";
    const toName = typeof item.toName === "string" ? item.toName.trim() : "";
    if (!fromPath || !toName) {
      return NextResponse.json(
        { error: "Cada item deve ter fromPath e toName não vazios." },
        { status: 400 }
      );
    }
    if (!isValidProjectRelativePath(fromPath)) {
      return NextResponse.json({ error: `Path inválido: ${fromPath}` }, { status: 403 });
    }
    const fullFrom = `${basePath}/${fromPath}`;
    if (!pathBelongsToUser(fullFrom, userId)) {
      return NextResponse.json(
        { error: `Path não pertence ao usuário: ${fromPath}` },
        { status: 403 }
      );
    }
  }

  const serviceClient = createSupabaseServiceRoleClient();
  const destPrefix = `${basePath}/${RENOMEADOS_FOLDER}`;
  const failed: { fromPath: string; error: string }[] = [];
  let copied = 0;

  for (const item of items) {
    const fullFrom = `${basePath}/${item.fromPath}`;
    const safeToName = sanitizeFileName(item.toName);
    const destPath = `${destPrefix}/${safeToName}`;

    try {
      const { data, error: downloadError } = await serviceClient.storage
        .from(FILES_BUCKET)
        .download(fullFrom);
      if (downloadError || !data) {
        failed.push({ fromPath: item.fromPath, error: downloadError?.message ?? "Arquivo não encontrado" });
        continue;
      }
      const buffer = await data.arrayBuffer();
      const { error: uploadError } = await serviceClient.storage
        .from(FILES_BUCKET)
        .upload(destPath, buffer, { upsert: true, contentType: data.type || undefined });
      if (uploadError) {
        failed.push({ fromPath: item.fromPath, error: uploadError.message });
        continue;
      }
      copied++;
    } catch (e) {
      failed.push({
        fromPath: item.fromPath,
        error: e instanceof Error ? e.message : "Erro ao copiar",
      });
    }
  }

  const response: CopyBatchResponse = { copied, failed };
  return NextResponse.json(response);
}
