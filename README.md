# n.files

**ness** — Sistema de **gestão de documentos** para **Windows**, com **tela de ingestão** (lote ou único), **botão de renomeação**, **regras** (melhores práticas + ingerência do usuário), leitura de arquivos quando necessário para o nome, e **inserção dos renomeados no modelo file manager** da aplicação.

**Repositório:** [github.com/resper1965/nFiles](https://github.com/resper1965/nFiles)

## Objetivo

- **Tela de ingestão:** ingestão de arquivos em **lote** ou **unitária**; ao aplicar renomeação, o sistema gera os arquivos renomeados e **insere-os no modelo file manager** da app.
- **Botão de renomeação:** disparo explícito da aplicação das regras (preview e execução).
- **Regras:** baseadas em **melhores práticas** por padrão, com **ingerência do usuário** permitida; em alguns casos o sistema **lê** o arquivo (conteúdo/metadados) para avaliar o nome.
- **Árvore de arquivos e file manager:** regras e resultados associados à árvore; itens renomeados inseridos no file manager da aplicação.
- **Frontend com busca:** interface para buscar na árvore, nas regras e nos resultados (preview/histórico/file manager).

## Estrutura do projeto

| Pasta / item | Função |
|--------------|--------|
| `frontend/` | UI: tela de ingestão (lote/único), botão de renomeação, regras, árvore, file manager, busca e preview. |
| `core/` | Motor de regras (melhores práticas + ingerência do usuário), leitor de arquivos quando necessário, modelo file manager, persistência. |
| **Arquivos na raiz** | **Seed do sistema** — dados iniciais (ex.: zip e anexos) para demonstração, testes ou bootstrap; o n.files usa como referência. |

**Hospedagem:** **Vercel** (projeto **n-files**, ID `prj_FF8Anquga9QmD9WF5SnVYdpaFbH2`). **Backend:** **Supabase** — **autenticação** (Auth) e **arquivos** (Storage); regras e metadados do file manager podem usar Postgres do Supabase. Configurar `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` (ver `.env.example` e `.context/docs/supabase.md`).

## Documentação

- Visão geral e glossário: `.context/docs/project-overview.md`, `.context/docs/glossary.md`
- Arquitetura e fluxo de dados: `.context/docs/architecture.md`, `.context/docs/data-flow.md`

## Próximos passos

1. Definir stack (desktop vs web local; linguagem/framework).
2. Implementar em `core/`: leitura da árvore Windows, modelo de regras, preview.
3. Implementar em `frontend/`: UI + busca na árvore e nas regras.
