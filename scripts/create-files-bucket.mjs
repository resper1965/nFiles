#!/usr/bin/env node
/**
 * Cria o bucket "files" no Supabase (n.files).
 * Requer: NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente ou em frontend/.env.local.
 * Uso: cd frontend && node ../scripts/create-files-bucket.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

// Carrega .env.local (em cwd ou frontend/) se existir
for (const dir of [process.cwd(), join(process.cwd(), "frontend")]) {
  const envPath = join(dir, ".env.local");
  if (existsSync(envPath)) {
    const content = readFileSync(envPath, "utf8");
    for (const line of content.split("\n")) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].replace(/^["']|["']\s*$|\\n$/g, "").trim();
      }
    }
    break;
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(url, key);
const { data, error } = await supabase.storage.createBucket("files", { public: false });

if (error) {
  if (error.message?.includes("already exists") || error.message?.includes("duplicate")) {
    console.log("Bucket 'files' já existe.");
    process.exit(0);
  }
  console.error("Erro ao criar bucket:", error.message);
  process.exit(1);
}

console.log("Bucket 'files' criado.", data);
process.exit(0);
