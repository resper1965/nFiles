---
type: doc
name: tooling
description: Scripts, deploy Vercel, IDE settings, and developer productivity tips
category: tooling
generated: 2026-02-04
status: filled
scaffoldVersion: "2.0.0"
---

# Ferramentas — n.files (ness)

## Deploy (Vercel)

- **Hospedagem:** aplicação hospedada na **Vercel**.
- **Projeto Vercel:** nome **n-files**; ID **prj_FF8Anquga9QmD9WF5SnVYdpaFbH2** (referência para CLI e dashboard).
- **CLI:** `vercel` para deploy manual, link do projeto e env; `vercel --prod` para produção.
- **Config:** `vercel.json` na raiz do projeto (ou na pasta do frontend, se monorepo) para build command, output directory, env e rewrites/redirects.
- **Preview:** cada branch/PR pode gerar URL de preview; variáveis de ambiente configuráveis por ambiente (Production, Preview, Development) no dashboard.

## Supabase (env e CLI)

- **Variáveis de ambiente (obrigatórias para Auth e Storage):**
  - `NEXT_PUBLIC_SUPABASE_URL` — URL do projeto Supabase (ex.: `https://xxxxx.supabase.co`).
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` ou `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` — Chave pública para o cliente (conforme o dashboard Supabase).
  - `SUPABASE_SERVICE_ROLE_KEY` — Apenas no servidor (Vercel env), nunca no cliente; usar só quando precisar bypass de RLS em API/Serverless.
- **Onde configurar:** Vercel → Settings → Environment Variables; localmente `.env.local` (não commitar). Ver `supabase.md`.
- **CLI Supabase (opcional):** `supabase` para projetos locais, migrations e link com projeto remoto; não obrigatório para usar Auth + Storage.

## Gemini (Google AI)

- **Variável de ambiente:** `GEMINI_API_KEY` — chave da API Gemini (Google AI). Usar **apenas no servidor** (API routes, Serverless); nunca expor no cliente (não usar prefixo `NEXT_PUBLIC_`).
- **Onde configurar:** Vercel → Environment Variables; localmente `.env.local`. **Nunca** commitar a chave no repositório.
- **Uso no projeto:** sugestões de nomes, regras ou assistência na aplicação; chamadas **apenas** via API route no servidor (frontend chama `/api/ai/suggest` ou equivalente). Documentação: [Google AI for Developers](https://ai.google.dev/). Plano de integração: [Use AI in Application](../plans/use-ai-in-application.md).
