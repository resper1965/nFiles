import type { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

/**
 * Verifica se o path completo (userId/...) pertence ao usuário e não contém path traversal.
 */
export function pathBelongsToUser(path: string, userId: string): boolean {
  const normalized = path.replace(/\/+/g, "/").trim();
  const prefix = `${userId}/`;
  if (!normalized.startsWith(prefix)) return false;
  if (normalized.includes("..")) return false;
  return true;
}

/**
 * Valida path relativo ao projeto: sem "..", sem barras no início.
 */
export function isValidProjectRelativePath(relativePath: string): boolean {
  const t = relativePath.trim();
  if (t.startsWith("/") || t.includes("..")) return false;
  return true;
}

export type GetUserIdResult = { userId: string } | { error: string; status: number };

async function getUserIdFromAccessToken(accessToken: string): Promise<string | null> {
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anon) return null;
    const client = createClient(url, anon);
    const { data: { session }, error } = await client.auth.setSession({
      access_token: accessToken,
      refresh_token: "",
    });
    if (!error && session?.user?.id) return session.user.id;
  } catch {
    // ignore
  }
  return null;
}

/**
 * Obtém userId a partir de: cookies (createSupabaseServerClient), header Authorization: Bearer, ou body.accessToken.
 * Usar em API routes que precisam de usuário autenticado.
 */
export async function getUserIdFromRequest(request: NextRequest, body: { accessToken?: string }): Promise<GetUserIdResult> {
  let userId: string | null = null;
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) userId = user.id;
  } catch {
    // cookies/session não disponíveis
  }

  if (!userId) {
    const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
    if (bearer) userId = await getUserIdFromAccessToken(bearer);
  }
  if (!userId && body?.accessToken && typeof body.accessToken === "string") {
    userId = await getUserIdFromAccessToken(body.accessToken);
  }

  if (!userId) {
    return { error: "Não autenticado. Faça login ou envie accessToken no body.", status: 401 };
  }
  return { userId };
}
