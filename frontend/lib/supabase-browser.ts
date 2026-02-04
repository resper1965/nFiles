"use client";

import { createSupabaseClient } from "./supabase";

type BrowserClient = ReturnType<typeof createSupabaseClient>;
let browserClient: BrowserClient | null = null;

/**
 * Cliente Supabase singleton para uso em Client Components.
 * Evita múltiplas instâncias e reutiliza a mesma conexão/sessão.
 * Retorna null se as variáveis de ambiente do Supabase não estiverem configuradas.
 */
export function getSupabaseBrowser(): BrowserClient | null {
  if (typeof window === "undefined") {
    return null;
  }
  if (browserClient) {
    return browserClient;
  }
  try {
    browserClient = createSupabaseClient();
    return browserClient;
  } catch {
    return null;
  }
}
