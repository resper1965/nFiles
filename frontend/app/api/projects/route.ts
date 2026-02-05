import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getUserIdFromRequest } from "@/lib/api-auth";

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
