---
type: doc
name: architecture
description: Arquitetura do sistema n.files (ness)
category: architecture
generated: 2026-02-04
status: filled
scaffoldVersion: "2.0.0"
---

# Arquitetura — n.files (ness)

## Visão de alto nível

Sistema em camadas: **Frontend** (UI + busca) ↔ **API/Core** (regras + árvore) ↔ **Supabase** (Auth + Storage) e, opcionalmente, sistema de arquivos local (Windows).

```
┌─────────────────────────────────────────────────────────┐
│  Frontend (UI + busca, ingestão, regras, file manager)  │
├─────────────────────────────────────────────────────────┤
│  Core: motor de regras + modelo da árvore + persistência │
├─────────────────────────────────────────────────────────┤
│  Supabase Auth (autenticação) + Storage (arquivos)      │
├─────────────────────────────────────────────────────────┤
│  Opcional: sistema de arquivos (Windows)                 │
└─────────────────────────────────────────────────────────┘
```

## Componentes e responsabilidades

| Componente | Responsabilidade |
|------------|------------------|
| **Tela de ingestão** | Ingestão em lote ou unitária; acionar geração de nomes e inserção no modelo file manager; botão de renomeação (aplicar regras). |
| **Frontend** | Tela de ingestão; seleção de pasta raiz; criação/edição de regras (com ingerência do usuário); busca (árvore, regras, preview); visualização da árvore e do file manager; aplicação (preview e execução). |
| **Motor de regras** | Interpretar regras (melhores práticas por padrão, com override do usuário); gerar mapeamento (atual → novo); quando a regra exigir, solicitar leitura de arquivo; validar conflitos (duplicados, caracteres inválidos). |
| **Leitor de arquivos** | Ler conteúdo ou metadados do arquivo quando a regra precisar para avaliar o nome (ex.: EXIF, metadados de documento). |
| **Modelo file manager** | Estrutura da aplicação que recebe os arquivos renomeados após a ingestão; exibir e buscar itens ingeridos. |
| **Árvore de arquivos** | Modelo da pasta raiz e filhos; metadados (regras, histórico); persistência; integração com o file manager (inserção dos renomeados). |
| **Persistência** | Salvar/carregar regras e vínculo com a árvore; estado do file manager; opcionalmente histórico. |
| **Supabase Auth** | Autenticação de usuários; sessão; proteger acesso a Storage e dados. |
| **Supabase Storage** | Armazenar arquivos ingeridos e arquivos renomeados (file manager); buckets com RLS por usuário. |

## Fluxo de dados (resumido)

1. **Ingestão:** usuário envia arquivos (lote ou único) na **tela de ingestão**.
2. **Regras:** motor aplica regras (melhores práticas + ingerência do usuário); quando necessário, **lê** conteúdo/metadados do arquivo para avaliar o nome.
3. **Preview / Renomeação:** usuário vê preview e aciona o **botão de renomeação**; sistema gera os arquivos renomeados.
4. **Inserção no file manager:** os arquivos renomeados são **inseridos no modelo file manager** da aplicação (disponíveis na árvore/lista da app).
5. Regras e vínculo com a árvore são gravados; busca filtra árvore, regras e resultados.

Ver `data-flow.md` para detalhes.

## Decisões de design

- **Regras descritas:** armazenadas como dados (ex.: JSON), não só UI; permitem reutilização e versionamento.
- **Árvore lógica:** representação da estrutura de pastas + metadados (regras, histórico) independente do disco para busca e preview.
- **Frontend com busca:** busca sobre árvore, regras e resultados para localizar rapidamente itens e regras.

## Stack (a definir)

- **Desktop:** ex. Electron (Node + frontend web) ou Tauri (Rust + frontend).
- **Web local:** ex. React/Vue + Node/Express servindo API local; acesso a pastas via seleção de diretório ou backend com permissão no Windows.

A escolha impacta: onde roda o acesso ao sistema de arquivos (processo principal vs backend) e como a “árvore” e as regras são persistidas. Não introduzir novas tecnologias sem consentimento do usuário.

## Supabase (Auth + Storage)

O projeto está **conectado ao Supabase**. Utilizar:

- **Supabase Auth** — autenticação de usuários (login, sessão); proteger rotas e acesso a Storage; associar regras e file manager ao usuário.
- **Supabase Storage** — armazenar **arquivos** (ingestão e arquivos renomeados do file manager); buckets com políticas (RLS) por usuário.

Regras e metadados do file manager podem ser persistidos em **tabelas no Supabase (Postgres)** ou em metadados dos objetos no Storage. Ver `.context/docs/supabase.md` para variáveis de ambiente, RLS e fluxos.

## Persistência e banco de dados

Com **Supabase** conectado:

- **Arquivos:** Supabase **Storage** (binários).
- **Autenticação:** Supabase **Auth** (usuários, sessão).
- **Metadados (regras, file manager, histórico):** Supabase **Postgres** (tabelas com RLS) ou metadados no Storage; antes era opcional “DB”, agora o backend é o Supabase.

## Hospedagem e integrações

- **Vercel:** aplicação **hospedada na Vercel** (frontend Next.js; APIs via Serverless Functions se necessário). Build, env e domínio via dashboard ou `vercel.json`.
- **Supabase:** **autenticação** (Auth) e **arquivos** (Storage); opcionalmente Postgres para regras e metadados do file manager. Configurar `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` (e `SUPABASE_SERVICE_ROLE_KEY` só no servidor se necessário). Ver `supabase.md`.
