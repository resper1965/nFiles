---
type: doc
name: supabase
description: Uso do Supabase para autenticação e arquivos (Storage) no n.files
category: integrations
generated: 2026-02-04
---

# Supabase — n.files (ness)

O projeto está **conectado ao Supabase**. Utilizar **Supabase Auth** para autenticação e **Supabase Storage** para arquivos (ingestão, file manager).

## Serviços utilizados

| Serviço | Uso no n.files |
|--------|-----------------|
| **Supabase Auth** | Login, sessão e identificação do usuário; proteger rotas e APIs; associar regras e file manager ao usuário. |
| **Supabase Storage** | Armazenar arquivos ingeridos e arquivos renomeados (binários); buckets por usuário ou por projeto; metadados do file manager podem ficar em tabelas (Postgres) ou nos metadados do objeto. |

## Variáveis de ambiente

Configurar no **Vercel** (dashboard → Settings → Environment Variables) e em **.env.local** para desenvolvimento. **Nunca** commitar chaves no repositório.

| Variável | Uso | Onde obter |
|----------|-----|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase | Dashboard Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` ou `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Chave pública para o cliente (anon ou publishable, conforme o dashboard) | Dashboard Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de serviço (só no servidor; nunca no cliente) | Dashboard Supabase → Settings → API. Usar apenas em Serverless/API routes quando precisar bypass de RLS. |

Exemplo de `.env.local` (valores fictícios; **nunca** commitar valores reais):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
# Use ANON_KEY ou PUBLISHABLE_DEFAULT_KEY conforme o dashboard:
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
# ou: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_...
# SUPABASE_SERVICE_ROLE_KEY só em código servidor se necessário
```

## Autenticação (Auth)

- **Fluxo:** sign up / sign in via Supabase Auth (email+senha, OAuth, etc.); sessão gerenciada pelo cliente (Supabase JS client) ou por cookies em server components (Next.js).
- **Proteção:** rotas e APIs que dependem de usuário logado devem validar a sessão (JWT ou session) antes de acessar Storage ou dados.
- **RLS:** no Supabase, usar Row Level Security nas tabelas (ex.: regras, metadados do file manager) para que cada usuário acesse apenas seus dados.

## Arquivos (Storage)

- **Buckets:** definir pelo menos um bucket para arquivos do file manager (ex.: `files` ou por usuário `user-{id}/files`). Configurar políticas (RLS) no Storage para leitura/escrita por usuário autenticado.
- **Ingestão:** upload na tela de ingestão → enviar arquivo(s) ao Supabase Storage (path por usuário/projeto); opcionalmente registrar metadados (nome final, regra usada, data) em tabela no Postgres.
- **File manager:** listar objetos do bucket (e/ou tabela de metadados) para exibir na árvore/lista da aplicação; download via URL assinada ou público conforme política.

### Bucket `files` e políticas (RLS) no Storage

O frontend usa o bucket **`files`**. Cada usuário tem seus arquivos sob o path `{user_id}/...`.

1. **Criar o bucket** (Dashboard Supabase → Storage → New bucket):
   - Nome: `files`
   - Público: **não** (uso de URLs assinadas para download).
   - File size limit e allowed MIME types: conforme necessidade.

2. **Políticas de Storage** (Storage → `files` → Policies):
   - **SELECT (leitura):** permitir para usuário autenticado apenas no próprio prefixo.
     - Policy name: `Users can read own files`
     - Allowed operation: `SELECT`
     - Target roles: `authenticated`
     - USING expression (Postgres): `(bucket_id = 'files' AND (storage.foldername(name))[1] = (auth.jwt() ->> 'sub'))`
   - **INSERT (upload):** permitir para usuário autenticado apenas no próprio prefixo.
     - Policy name: `Users can upload to own folder`
     - Allowed operation: `INSERT`
     - Target roles: `authenticated`
     - WITH CHECK: `(bucket_id = 'files' AND (storage.foldername(name))[1] = (auth.jwt() ->> 'sub'))`
   - **UPDATE / DELETE:** necessárias para o botão "Renomear" (move no Storage = copy + delete). Mesma restrição: primeiro segmento do path igual a `(auth.jwt() ->> 'sub')`.

Se o bucket não existir ou as políticas não permitirem acesso, a listagem retornará vazia ou erro de permissão; a aplicação trata “not found” na listagem como lista vazia.

## Segurança

- **Anon key** é pública (frontend); as permissões reais vêm das **políticas RLS** (Auth + Storage e tabelas). Nunca exponha a **service role key** no cliente.
- Documentação de referência: [Supabase Auth](https://supabase.com/docs/guides/auth), [Supabase Storage](https://supabase.com/docs/guides/storage), [RLS](https://supabase.com/docs/guides/auth/row-level-security).

## Referências no projeto

- Arquitetura e persistência: `architecture.md`, `data-flow.md`
- Autenticação e políticas: `security.md`
- Env e deploy: `tooling.md`
