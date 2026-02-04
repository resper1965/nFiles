import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import archiver from "archiver";
import { createSupabaseServiceRoleClient } from "@/lib/supabase-server";
import { getUserIdFromRequest, isValidProjectRelativePath, pathBelongsToUser } from "@/lib/api-auth";

const FILES_BUCKET = "files";

export type ExportZipItem = { fromPath: string; toName: string };
export type ExportZipBody = {
  projectName: string;
  items: ExportZipItem[];
  accessToken?: string;
};

function sanitizeFileName(name: string): string {
  return name.replace(/[<>:"/\\|?*]/g, "_").trim().slice(0, 255) || "arquivo";
}

export async function POST(request: NextRequest) {
  let body: ExportZipBody;
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
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 16).replace("T", "-").replace(":", "");
  const zipFileName = `${projectName}-renomeados-${dateStr}.zip`;

  const csvRows: string[] = ["nome_original,nome_novo,caminho_no_zip,data"];
  const csvDate = date.toISOString().slice(0, 10);

  const archive = archiver("zip", { zlib: { level: 6 } });
  const chunks: Buffer[] = [];
  archive.on("data", (chunk: Buffer) => chunks.push(chunk));

  const archiveFinished = new Promise<void>((resolve, reject) => {
    archive.on("end", resolve);
    archive.on("error", reject);
  });

  for (const item of items) {
    const fullFrom = `${basePath}/${item.fromPath}`;
    const safeToName = sanitizeFileName(item.toName);
    const originalName = item.fromPath.replace(/^.*\//, "");

    try {
      const { data, error } = await serviceClient.storage.from(FILES_BUCKET).download(fullFrom);
      if (error || !data) {
        archive.append(Buffer.from(`Erro: ${error?.message ?? "não encontrado"}\n`), { name: `erro-${safeToName}.txt` });
        csvRows.push(`"${originalName}","${safeToName}","erro-${safeToName}.txt",${csvDate}`);
        continue;
      }
      const buffer = await data.arrayBuffer();
      archive.append(Buffer.from(buffer), { name: safeToName });
      csvRows.push(`"${originalName}","${safeToName}","${safeToName}",${csvDate}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro";
      archive.append(Buffer.from(`Erro: ${msg}\n`), { name: `erro-${safeToName}.txt` });
      csvRows.push(`"${originalName}","${safeToName}","erro-${safeToName}.txt",${csvDate}`);
    }
  }

  archive.append(Buffer.from(csvRows.join("\n"), "utf-8"), { name: "indice.csv" });
  archive.finalize();
  await archiveFinished;

  const zipBuffer = Buffer.concat(chunks);
  return new NextResponse(zipBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${zipFileName}"`,
      "Content-Length": String(zipBuffer.length),
    },
  });
}
