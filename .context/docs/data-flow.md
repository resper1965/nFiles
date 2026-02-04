---
type: doc
name: data-flow
description: Fluxo de dados do sistema n.files (ness)
category: data-flow
generated: 2026-02-04
status: filled
scaffoldVersion: "2.0.0"
---

# Fluxo de dados — n.files (ness)

## Modelos e fontes de dados

| Dado | Origem | Destino | Observação |
|------|--------|---------|------------|
| **Arquivos ingeridos** | Tela de ingestão (lote ou único) | Core / motor de regras | Entrada do usuário; podem ser lidos (conteúdo/metadados) quando a regra exigir. |
| **Conteúdo/metadados** | Leitor de arquivos (quando regra exige) | Motor de regras | Usado para avaliar o nome (ex.: EXIF, metadados de documento). |
| **Regras** | Frontend (formulário/editor) | Persistência (árvore/config) | Melhores práticas por padrão; ingerência do usuário permitida. |
| **Preview** | Motor de regras (árvore + regras + leitura se necessário) | Frontend | Mapeamento atual → novo; usuário aciona botão de renomeação para aplicar. |
| **Arquivos renomeados** | Motor de regras (após botão de renomeação) | **Supabase Storage** + modelo file manager | Binários no Storage; metadados no file manager (Postgres ou metadados do objeto). |
| **Árvore (estrutura)** | Supabase Storage (listagem) + file manager | Modelo em memória / persistência | Inclui itens renomeados; listagem por usuário (Auth). |
| **Autenticação** | Supabase Auth | Sessão no cliente / cookies | Login, proteção de rotas e acesso ao Storage. |
| **Busca** | Frontend (termo de busca) | Árvore + regras + preview + file manager | Filtragem sobre dados já carregados. |

## Pipelines principais

### 1. Ingestão e renomeação (fluxo principal)

1. Usuário **autenticado** (Supabase Auth) envia arquivos na **tela de ingestão** (lote ou único).
2. Arquivos podem ser enviados ao **Supabase Storage** (bucket por usuário/projeto); sistema recebe e motor de regras aplica **regras** (melhores práticas + ingerência do usuário).
3. Quando a regra exigir, o sistema **lê** conteúdo ou metadados do arquivo para avaliar o nome.
4. Motor gera **preview** (nome atual → nome novo); frontend exibe e usuário pode ajustar regras.
5. Usuário aciona o **botão de renomeação** → sistema gera os arquivos renomeados.
6. Arquivos renomeados são enviados ao **Supabase Storage** e **inseridos no modelo file manager** da aplicação (metadados em Postgres ou no Storage); disponíveis na árvore/lista da app.
7. Regras e vínculo com a árvore são gravados (Supabase Postgres ou Storage); histórico opcional.

### 2. Carregar árvore, regras e file manager

1. Usuário **autenticado** (Supabase Auth) seleciona pasta raiz ou abre projeto salvo.
2. Sistema monta árvore a partir do **Supabase Storage** (listagem do bucket do usuário) e metadados do file manager (Postgres ou Storage).
3. Carrega regras associadas ao usuário; frontend exibe árvore, regras e file manager; busca atua sobre esses dados.

### 3. Busca

1. Usuário digita termo no frontend.
2. Frontend (e/ou backend) filtra árvore, regras, preview e itens do file manager.
3. Resultados exibidos na UI.

## Estado e persistência

- **Em memória:** árvore atual, regras carregadas, preview atual, itens do file manager; sessão do usuário (Supabase Auth).
- **Persistência (Supabase):** **Auth** — usuários e sessão; **Storage** — arquivos (ingestão e renomeados); **Postgres** (ou metadados no Storage) — regras, vínculo com a árvore, metadados do file manager; opcionalmente histórico.

## Integrações externas

- **Supabase:** **Auth** (autenticação) e **Storage** (arquivos); Postgres para regras e metadados do file manager. Ver `supabase.md`.
- **Vercel:** hospedagem do frontend e APIs.
- **Sistema de arquivos Windows:** opcional (leitura/renomeação local no cliente quando aplicável).
