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
 * Path raiz do usuário no Storage. Com projeto: userId/projectName/; sem: userId/.
 */
export function userStoragePath(userId: string, projectName: string | null): string {
  return projectName ? `${userId}/${projectName}` : userId;
}

function userPath(userId: string, projectName: string | null): string {
  return userStoragePath(userId, projectName);
}

/**
 * Lista nomes dos projetos (pastas raiz) do usuário.
 * Projeto = pasta imediata sob userId/ (ex.: userId/Contrato-2025/).
 */
export async function listProjectNames(userId: string): Promise<string[]> {
  const supabase = getSupabaseBrowser();
  if (!supabase) throw new Error("Supabase não configurado.");
  const { data, error } = await supabase.storage.from(FILES_BUCKET).list(userId, {
    limit: 100,
  });
  if (error) {
    if (error.message?.includes("not found") || error.message?.includes("NotFound") || error.message?.includes("does not exist")) {
      return [];
    }
    throw error;
  }
  return (data ?? []).map((f) => f.name).filter(Boolean);
}

/**
 * Cria um projeto (pasta raiz) fazendo upload de um arquivo .keep.
 * Assim a pasta existe e aparece na listagem.
 */
export async function createProject(userId: string, projectName: string): Promise<{ error: Error | null }> {
  const supabase = getSupabaseBrowser();
  if (!supabase) return { error: new Error("Supabase não configurado.") };
  const path = `${userId}/${projectName}/.keep`;
  const { error } = await supabase.storage.from(FILES_BUCKET).upload(path, new Blob([]), { upsert: true });
  return { error: error ?? null };
}

/**
 * Lista arquivos no bucket sob o path do usuário (e do projeto, se informado).
 * prefix = subpasta opcional dentro do projeto (ex.: "" ou "subpasta").
 * Retorna apenas o nível imediato (um nível por vez, para árvore lazy).
 */
export async function listFiles(
  userId: string,
  prefixOrProject: string,
  prefix = ""
): Promise<StorageFile[]> {
  const supabase = getSupabaseBrowser();
  if (!supabase) throw new Error("Supabase não configurado.");
  const base = userPath(userId, prefixOrProject || null);
  const path = prefix ? `${base}/${prefix}` : base;
  const { data, error } = await supabase.storage.from(FILES_BUCKET).list(path, {
    limit: 500,
  });
  if (error) {
    if (error.message?.includes("not found") || error.message?.includes("NotFound") || error.message?.includes("does not exist")) {
      return [];
    }
    throw error;
  }
  const files: StorageFile[] = (data ?? [])
    .filter((f) => f.name && f.name !== ".keep" && (f.id != null || f.name))
    .map((f) => ({
      name: f.name,
      path: `${path}/${f.name}`,
      id: f.id,
      createdAt: f.created_at ?? undefined,
    }));
  return files;
}

/**
 * Lista recursivamente todos os arquivos (folhas) sob um prefixo no projeto.
 * Usado para "selecionar pasta" na árvore: retorna todos os paths de arquivos.
 */
export async function listAllFilesUnderPrefix(
  userId: string,
  projectName: string,
  prefix: string
): Promise<StorageFile[]> {
  const immediate = await listFiles(userId, projectName, prefix);
  const base = userPath(userId, projectName);
  const result: StorageFile[] = [];

  for (const f of immediate) {
    const childPrefix = prefix ? `${prefix}/${f.name}` : f.name;
    const childPath = `${base}/${childPrefix}`;
    const children = await listFiles(userId, projectName, childPrefix);
    if (children.length > 0) {
      result.push(...(await listAllFilesUnderPrefix(userId, projectName, childPrefix)));
    } else {
      result.push({ name: f.name, path: childPath, id: f.id, createdAt: f.createdAt });
    }
  }
  return result;
}

/**
 * Expande uma seleção (paths relativos ao projeto) para lista plana de paths de arquivos.
 * Paths que forem pastas (têm filhos no Storage) são expandidos com listAllFilesUnderPrefix.
 */
export async function expandSelectionToFiles(
  userId: string,
  projectName: string,
  relativePaths: Set<string> | string[]
): Promise<string[]> {
  const base = userPath(userId, projectName);
  const paths = Array.from(relativePaths);
  const out: string[] = [];

  for (const rel of paths) {
    if (!rel?.trim()) continue;
    const children = await listFiles(userId, projectName, rel);
    if (children.length > 0) {
      const under = await listAllFilesUnderPrefix(userId, projectName, rel);
      for (const f of under) {
        const r = f.path.startsWith(base + "/") ? f.path.slice(base.length + 1) : f.path;
        out.push(r);
      }
    } else {
      out.push(rel);
    }
  }
  return out;
}

/**
 * Faz upload de um arquivo para o bucket no path do usuário (e do projeto, se informado).
 */
export async function uploadFile(
  userId: string,
  file: File,
  projectName?: string | null,
  customPath?: string
): Promise<{ path: string; error: Error | null }> {
  const supabase = getSupabaseBrowser();
  if (!supabase) return { path: "", error: new Error("Supabase não configurado.") };
  const base = projectName ? `${userId}/${projectName}` : userId;
  const path = customPath ?? `${base}/${file.name}`;
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
 * fromName e toName são só os nomes do arquivo; o path é userId/projectName/name (ou userId/name se sem projeto).
 */
export async function renameFile(
  userId: string,
  fromName: string,
  toName: string,
  projectName?: string | null
): Promise<{ error: Error | null }> {
  const supabase = getSupabaseBrowser();
  if (!supabase) return { error: new Error("Supabase não configurado.") };
  const base = projectName ? `${userId}/${projectName}` : userId;
  const fromPath = `${base}/${fromName}`;
  const toPath = `${base}/${toName}`;
  const { error } = await supabase.storage.from(FILES_BUCKET).move(fromPath, toPath);
  return { error: error ?? null };
}
