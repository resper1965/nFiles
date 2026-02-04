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

## Como gravar as chaves na Vercel

As variáveis já existem no projeto (valores criptografados). Para **colocar os valores reais** (Supabase e Gemini), use uma das opções abaixo.

### Opção A — Dashboard (recomendado)

1. Acesse [Vercel Dashboard](https://vercel.com) → time **nessbr-projects** → projeto **n-files**.
2. **Settings** → **Environment Variables**.
3. Para cada variável (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`, `GEMINI_API_KEY`):
   - Clique nos três pontos → **Edit** (ou edite direto).
   - Cole o **valor real** (URL do Supabase, chave publishable do Supabase, chave da API Gemini).
   - Marque os ambientes: **Production**, **Preview**, **Development**.
   - Salve.

**Onde obter os valores:**

- **Supabase:** [Dashboard do projeto](https://supabase.com/dashboard) → seu projeto → **Settings** → **API** → Project URL e Publishable (anon) key.
- **Gemini:** [Google AI Studio](https://aistudio.google.com/) → Get API key / API Keys.

### Opção B — CLI (na raiz do projeto)

Na pasta do projeto (`Ingridion`), com a Vercel CLI instalada e logada:

```bash
# Remover o valor antigo (placeholder) e adicionar o real para cada variável.
# A CLI vai pedir o valor ao rodar cada comando.

vercel env rm NEXT_PUBLIC_SUPABASE_URL development
vercel env add NEXT_PUBLIC_SUPABASE_URL development
# Repetir para preview e production se quiser:
vercel env rm NEXT_PUBLIC_SUPABASE_URL preview
vercel env add NEXT_PUBLIC_SUPABASE_URL preview
vercel env rm NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_URL production

vercel env rm NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY development
vercel env add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY development
# (idem para preview e production)

vercel env rm GEMINI_API_KEY development
vercel env add GEMINI_API_KEY development
# (idem para preview e production)
```

Ao rodar `vercel env add`, a CLI pede o valor; cole a URL ou a chave e confirme. Para **atualizar** sem remover: no Dashboard, Edit na variável e salvar com o novo valor.

Após gravar as chaves reais, os próximos deploys usarão esses valores. Para desenvolvimento local: `vercel env pull` (na raiz) atualiza o `.env.local` com os valores de Development.

## Local (.env.local)

- O comando `vercel link` já criou `.env.local` e baixou as variáveis de **development** (com os placeholders).
- Para desenvolvimento local com valores reais: **edite `.env.local`** e substitua os placeholders pela URL do Supabase, chave publishable e chave Gemini. Não commite `.env.local`.
- Para baixar de novo da Vercel (ex.: após alterar no dashboard): `vercel env pull` na raiz do projeto.

## Root Directory (obrigatório)

O app Next.js está em **`frontend/`**. No [Vercel Dashboard](https://vercel.com) → projeto **n-files** → **Settings** → **General** → **Root Directory**, defina **`frontend`**. Assim o build e o deploy usam o `package.json` e o Next.js de `frontend/`.

**Se não estiver definido**, o build roda na raiz do repositório (onde não há Next.js), falha com *"No Next.js version detected"*, o deployment fica em **ERROR** e as URLs do projeto podem retornar **404: DEPLOYMENT_NOT_FOUND** (porque não há deployment bem-sucedido).

## Comandos úteis (CLI)

Na **raiz do repositório** (`Ingridion`), com o projeto linkado (`.vercel/project.json` apontando para **n-files**):

- `vercel env ls` — listar variáveis do projeto.
- `vercel env pull` — baixar variáveis de development para `.env.local` (na pasta onde rodar; use `vercel env pull ./frontend` para baixar em `frontend/.env.local` se o link estiver na raiz).
- `vercel` — deploy de **preview**.
- `vercel --prod` — deploy de **produção** (usa Root Directory = `frontend` definido no projeto).

**Importante:** o deploy deve ser feito **na raiz** (`Ingridion`), não dentro de `frontend/`. O projeto **n-files** tem Root Directory = `frontend`; se rodar `vercel` de dentro de `frontend/`, a Vercel interpreta o path como `frontend/frontend` e falha.

## Referências

- [Vercel CLI - Environment Variables](https://vercel.com/docs/cli/env)
- `tooling.md`, `supabase.md`, `.env.example`
