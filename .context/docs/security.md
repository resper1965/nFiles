---
type: doc
name: security
description: Autenticação (Supabase Auth), políticas de Storage e gestão de segredos
category: security
generated: 2026-02-04
status: filled
scaffoldVersion: "2.0.0"
---

# Segurança — n.files (ness)

## Autenticação

- **Supabase Auth:** o projeto utiliza **Supabase Auth** para autenticação. Login, sign up e sessão são gerenciados pelo cliente Supabase (ou por cookies em server components no Next.js). Rotas e APIs que dependem de usuário logado devem validar a sessão antes de acessar Storage ou dados.
- **Proteção de rotas:** no frontend, proteger páginas do file manager e da ingestão com verificação de sessão (redirect para login se não autenticado). No servidor (API routes / Serverless), validar JWT ou session antes de operações no Storage/Postgres.
- **Nunca** expor a **service role key** no cliente; usar apenas em código que roda no servidor (ex.: API route) quando for estritamente necessário bypass de RLS.

## Arquivos (Storage)

- **Supabase Storage:** arquivos são armazenados no **Supabase Storage**. Configurar **políticas (RLS)** nos buckets para que cada usuário acesse apenas seus próprios arquivos (ex.: `auth.uid() = (user_id na path ou em metadados)`). Evitar buckets públicos de escrita; leitura pode ser por URL assinada ou política por usuário.
- **Upload/Download:** garantir que o cliente use a **anon key** (pública) e que as políticas do Storage restrinjam acesso por `auth.uid()`. Não confiar apenas no frontend para “esconder” paths; a autorização real é no Supabase (RLS).

## Segredos e variáveis de ambiente

- **Variáveis:** `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` podem ser expostas no cliente (são públicas; a segurança vem das políticas RLS). `SUPABASE_SERVICE_ROLE_KEY` **nunca** no cliente; apenas em variáveis de ambiente do servidor (Vercel → Environment Variables).
- **.env.local:** usar para desenvolvimento; não commitar. Adicionar `.env*.local` ao `.gitignore`. Ver `tooling.md` e `supabase.md`.

## Referências

- Configuração Supabase (Auth + Storage + env): `supabase.md`
- Fluxo de dados e persistência: `data-flow.md`, `architecture.md`
