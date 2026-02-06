import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getUserIdFromRequest } from "@/lib/api-auth";
const FILES_BUCKET = "files";

/** Lista recursivamente todos os paths de arquivos no Storage sob um prefixo. */
async function listAllPathsInPrefix(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  prefix: string
): Promise<string[]> {
  const { data, error } = await supabase.storage.from(FILES_BUCKET).list(prefix, { limit: 1000 });
  if (error || !data?.length) return [];
  const paths: string[] = [];
  for (const item of data) {
    const fullPath = prefix ? `${prefix}/${item.name}` : item.name;
    const child = await supabase.storage.from(FILES_BUCKET).list(fullPath, { limit: 1 });
    const isFolder = child.data && child.data.length > 0;
    if (isFolder) {
      paths.push(...(await listAllPathsInPrefix(supabase, fullPath)));
    } else {
      paths.push(fullPath);
    }
  }
  return paths;
}

/** POST: salvar metadados do projeto (chamado após criar a pasta no Storage). */
export async function POST(request: NextRequest) {
  const auth = await getUserIdFromRequest(request, {});
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const userId = auth.userId;

  let body: {
    name?: string;
    razao_social?: string;
    operadora?: string;
    tipo_documento?: string;
    objeto_documento?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body JSON inválido" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const razao_social = String(body.razao_social ?? "").trim();
  const operadora = String(body.operadora ?? "").trim();
  if (!name || !razao_social || !operadora) {
    return NextResponse.json(
      { error: "name, razao_social e operadora são obrigatórios" },
      { status: 400 }
    );
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("projects")
      .upsert(
        {
          user_id: userId,
          name,
          razao_social,
          operadora,
          tipo_documento: body.tipo_documento?.trim() || null,
          objeto_documento: body.objeto_documento?.trim() || null,
        },
        { onConflict: "user_id,name" }
      )
      .select("id")
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json({ id: data?.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** GET: listar projetos do usuário ou obter um por name. */
export async function GET(request: NextRequest) {
  const auth = await getUserIdFromRequest(request, {});
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const userId = auth.userId;

  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name")?.trim();

  try {
    const supabase = await createSupabaseServerClient();
    if (name) {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name, razao_social, operadora, tipo_documento, objeto_documento, created_at")
        .eq("user_id", userId)
        .eq("name", name)
        .maybeSingle();
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json(data ?? null);
    }
    const { data, error } = await supabase
      .from("projects")
      .select("id, name, razao_social, operadora, tipo_documento, objeto_documento, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(data ?? []);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** PATCH: atualizar metadados do projeto (name identifica o projeto). */
export async function PATCH(request: NextRequest) {
  const auth = await getUserIdFromRequest(request, {});
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const userId = auth.userId;

  let body: {
    name: string;
    razao_social?: string;
    operadora?: string;
    tipo_documento?: string;
    objeto_documento?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body JSON inválido" }, { status: 400 });
  }
  const name = String(body.name ?? "").trim();
  if (!name) {
    return NextResponse.json({ error: "name é obrigatório" }, { status: 400 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const update: Record<string, unknown> = {};
    if (body.razao_social !== undefined) update.razao_social = String(body.razao_social).trim() || null;
    if (body.operadora !== undefined) update.operadora = String(body.operadora).trim() || null;
    if (body.tipo_documento !== undefined) update.tipo_documento = String(body.tipo_documento).trim() || null;
    if (body.objeto_documento !== undefined) update.objeto_documento = String(body.objeto_documento).trim() || null;
    if (Object.keys(update).length === 0) {
      return NextResponse.json({ ok: true });
    }
    const { error } = await supabase
      .from("projects")
      .update(update)
      .eq("user_id", userId)
      .eq("name", name);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** DELETE: excluir um projeto (Storage + tabela projects). Query: name. Body opcional: { accessToken } para auth. */
export async function DELETE(request: NextRequest) {
  let body: { accessToken?: string } = {};
  try {
    const parsed = await request.json();
    if (parsed && typeof parsed === "object" && typeof parsed.accessToken === "string") {
      body = { accessToken: parsed.accessToken };
    }
  } catch {
    // body vazio ou inválido — auth só por cookies ou header
  }
  const auth = await getUserIdFromRequest(request, body);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const userId = auth.userId;

  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name")?.trim();
  if (!name) {
    return NextResponse.json({ error: "name é obrigatório" }, { status: 400 });
  }

  const prefix = `${userId}/${name}`;
  try {
    const supabase = await createSupabaseServerClient();
    const paths = await listAllPathsInPrefix(supabase, prefix);
    if (paths.length > 0) {
      const { error: removeError } = await supabase.storage.from(FILES_BUCKET).remove(paths);
      if (removeError) {
        return NextResponse.json({ error: removeError.message }, { status: 400 });
      }
    }
    const keepPath = `${prefix}/.keep`;
    await supabase.storage.from(FILES_BUCKET).remove([keepPath]);
    const { error: dbError } = await supabase.from("projects").delete().eq("user_id", userId).eq("name", name);
    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
