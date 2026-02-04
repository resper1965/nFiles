---
type: doc
name: env-config-vercel
description: Como configurar variáveis de ambiente na Vercel e localmente (n.files)
category: tooling
generated: 2026-02-04
---

# Configuração de env (Vercel e local)

O projeto está **linkado** à Vercel (projeto **n-files**, ID `prj_FF8Anquga9QmD9WF5SnVYdpaFbH2`). As variáveis abaixo foram criadas via CLI com **valor placeholder**; é preciso **substituir pelos valores reais** no dashboard.

## Variáveis criadas na Vercel (substituir valores)

| Variável | Onde obter | Ambientes |
|----------|------------|-----------|
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/) → API Key | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_URL` | Dashboard Supabase → Settings → API → Project URL | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Dashboard Supabase → Settings → API → Publishable key | Production, Preview, Development |

## Como substituir na Vercel

1. Acesse [Vercel Dashboard](https://vercel.com) → projeto **n-files** (ou **nessbr-projects/n-files**).
2. **Settings** → **Environment Variables**.
3. Para cada variável acima, clique em **Edit** (ou os três pontos) e **substitua o valor** pelo valor real (URL do Supabase, chave publishable, chave Gemini). Salve para cada ambiente (Production, Preview, Development) em que for usar.

Após salvar, os próximos deploys usarão os valores reais. Não é necessário rodar `vercel env pull` de novo só por isso; pull é para baixar as variáveis para `.env.local` em desenvolvimento.

## Local (.env.local)

- O comando `vercel link` já criou `.env.local` e baixou as variáveis de **development** (com os placeholders).
- Para desenvolvimento local com valores reais: **edite `.env.local`** e substitua os placeholders pela URL do Supabase, chave publishable e chave Gemini. Não commite `.env.local`.
- Para baixar de novo da Vercel (ex.: após alterar no dashboard): `vercel env pull` na raiz do projeto.

## Root Directory (obrigatório)

O app Next.js está em **`frontend/`**. No [Vercel Dashboard](https://vercel.com) → projeto **n-files** → **Settings** → **General** → **Root Directory**, defina **`frontend`**. Assim o build e o deploy usam o `package.json` e o Next.js de `frontend/`.

## Comandos úteis

- `vercel env ls` — listar variáveis do projeto.
- `vercel env pull` — baixar variáveis de development para `.env.local`.
- `vercel` — deploy de preview; `vercel --prod` — deploy de produção.

## Referências

- [Vercel CLI - Environment Variables](https://vercel.com/docs/cli/env)
- `tooling.md`, `supabase.md`, `.env.example`
