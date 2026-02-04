"use client";

import { getSupabaseBrowser } from "./supabase-browser";

/** Nome do bucket de arquivos no Supabase Storage (configurar no dashboard). */
export const FILES_BUCKET = "files";

export type StorageFile = {
  name: string;
  path: string;
  id?: string;
  createdAt?: string;
};

/**
 * Lista arquivos no bucket sob o prefixo do usuário.
 * Requer usuário autenticado; RLS no Storage deve permitir leitura para o usuário.
 * Retorna [] se a pasta não existir ou der erro (ex.: bucket ainda não criado).
 */
export async function listFiles(userId: string, prefix = ""): Promise<StorageFile[]> {
  const supabase = getSupabaseBrowser();
  if (!supabase) throw new Error("Supabase não configurado.");
  const path = prefix ? `${userId}/${prefix}` : userId;
  const { data, error } = await supabase.storage.from(FILES_BUCKET).list(path, {
    limit: 500,
  });
  if (error) {
    // Pasta ainda não existe ou bucket não configurado
    if (error.message?.includes("not found") || error.message?.includes("NotFound") || error.message?.includes("does not exist")) {
      return [];
    }
    throw error;
  }
  const files: StorageFile[] = (data ?? [])
    .filter((f) => f.name && (f.id != null || f.name))
    .map((f) => ({
      name: f.name,
      path: `${path}/${f.name}`,
      id: f.id,
      createdAt: f.created_at ?? undefined,
    }));
  return files;
}

/**
 * Faz upload de um arquivo para o bucket no path do usuário.
 * Requer usuário autenticado; RLS no Storage deve permitir escrita.
 */
export async function uploadFile(
  userId: string,
  file: File,
  customPath?: string
): Promise<{ path: string; error: Error | null }> {
  const supabase = getSupabaseBrowser();
  if (!supabase) return { path: "", error: new Error("Supabase não configurado.") };
  const path = customPath ?? `${userId}/${file.name}`;
  const { error } = await supabase.storage.from(FILES_BUCKET).upload(path, file, {
    upsert: true,
  });
  return { path, error: error ?? null };
}

/**
 * Retorna URL pública do arquivo (se o bucket for público) ou assinada.
 * Para bucket privado, use createSignedUrl em vez de getPublicUrl.
 */
export function getPublicUrl(path: string): string {
  const supabase = getSupabaseBrowser();
  if (!supabase) return "";
  const { data } = supabase.storage.from(FILES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Gera URL assinada para download (bucket privado).
 */
export async function createSignedUrl(
  path: string,
  expiresIn = 3600
): Promise<{ url: string; error: Error | null }> {
  const supabase = getSupabaseBrowser();
  if (!supabase) return { url: "", error: new Error("Supabase não configurado.") };
  const { data, error } = await supabase.storage
    .from(FILES_BUCKET)
    .createSignedUrl(path, expiresIn);
  return { url: data?.signedUrl ?? "", error: error ?? null };
}

/**
 * Renomeia um arquivo no Storage (move do path antigo para o novo).
 * fromName e toName são só os nomes do arquivo; o path é userId/name.
 */
export async function renameFile(
  userId: string,
  fromName: string,
  toName: string
): Promise<{ error: Error | null }> {
  const supabase = getSupabaseBrowser();
  if (!supabase) return { error: new Error("Supabase não configurado.") };
  const fromPath = `${userId}/${fromName}`;
  const toPath = `${userId}/${toName}`;
  const { error } = await supabase.storage.from(FILES_BUCKET).move(fromPath, toPath);
  return { error: error ?? null };
}
