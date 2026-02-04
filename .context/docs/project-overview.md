---
type: doc
name: project-overview
description: Visão geral do projeto n.files (ness)
category: overview
generated: 2026-02-04
status: filled
scaffoldVersion: "2.0.0"
---

# n.files — Visão geral

**ness** é a marca; **n.files** é o sistema.

## Propósito

O **n.files** é um sistema de **gestão de documentos** para **Windows** que:

1. **Tela de ingestão** — Ingestão de arquivos em **lote** ou **unitária**; ao final da ingestão o sistema gera os arquivos renomeados e **insere-os no modelo file manager** da aplicação.
2. **Botão de renomeação** — Disparo explícito da aplicação das regras (preview e/ou execução).
3. **Regras de renomeação** — Baseadas em **melhores práticas** por padrão, com **ingerência do usuário** permitida (override, ajustes).
4. **Leitura de arquivos** — Em alguns casos o sistema precisa **ler o conteúdo ou metadados** do arquivo para avaliar o nome (ex.: metadados de mídia, conteúdo para regras baseadas em conteúdo).
5. **Árvore de arquivos** — As regras e o resultado são gravados/visualizados no contexto de uma árvore (pasta raiz e subpastas); os itens renomeados entram no **modelo file manager** da app.
6. **Frontend com busca** — Interface para buscar na árvore, nas regras e nos resultados (preview/ histórico).

## Objetivos

- Permitir renomear em lote com regras reutilizáveis e claras.
- Manter vínculo entre regras e a árvore de arquivos onde foram aplicadas.
- Oferecer busca no frontend (arquivos, pastas, regras, resultados).

## Público-alvo

- Usuários Windows que organizam muitos arquivos (fotos, documentos, mídia).
- Quem precisa de padrões de nome consistentes e repetíveis.

## Componentes principais

| Componente | Função |
|------------|--------|
| **Tela de ingestão** | Entrada de arquivos em lote ou único; disparo do fluxo que gera nomes e insere no file manager. |
| **Motor de regras** | Interpreta regras (melhores práticas + ingerência do usuário); gera mapeamento nome atual → nome novo; pode usar leitura de arquivos quando a regra exigir. |
| **Leitor de arquivos** | Lê conteúdo ou metadados do arquivo quando a regra precisar para definir o nome. |
| **Modelo file manager** | Estrutura de dados da aplicação onde os arquivos renomeados são inseridos após a ingestão. |
| **Árvore de arquivos** | Modelo da pasta raiz + subpastas; persistência das regras; integração com o file manager. |
| **Frontend** | Tela de ingestão; botão de renomeação; configuração de regras; árvore; preview; busca. |

## Seed do sistema

Os **arquivos existentes na raiz do repositório** (ex.: `Ingridion - Contrato e Aditivos.zip` e anexos) são **seed** do n.files: dados iniciais para o sistema. Servem para demonstração, testes ou bootstrap da árvore de arquivos e das regras. O sistema pode referenciar ou expandir essa árvore de seed; não devem ser tratados como artefatos descartáveis.

## Repositório

- **GitHub:** [github.com/resper1965/nFiles](https://github.com/resper1965/nFiles)

## Dependências e integrações

- **Hospedagem:** **Vercel** — aplicação hospedada na Vercel (frontend Next.js; APIs via Serverless Functions se necessário). Ver `architecture.md` e `tooling.md`.
- **Supabase (conectado):** **Autenticação** (Supabase Auth) e **arquivos** (Supabase Storage). Regras e metadados do file manager podem usar Postgres do Supabase. Ver `supabase.md` e `security.md`.
- **Plataforma:** Windows (acesso ao sistema de arquivos no cliente ou em contexto local, quando aplicável).
- **Stack:** Next.js para frontend; Supabase para Auth e Storage; ver `architecture.md`.

## Estado atual (implementado)

- **Ingestão:** upload em lote ou único para Supabase Storage; listagem e download (URL assinada).
- **Padrões:** catálogo built-in (Seed, Seed completo, Data no início, Slug) + **Nova regra** (padrões custom com template `{nome}`, `{data}`, `{indice}`; persistência em `localStorage`).
- **Preview e Renomear:** mapeamento nome atual → nome novo; botão "Renomear" aplica no Storage (move); extensão preservada; **resolução de conflitos** (sufixo _1, _2 quando o nome novo repete).
- **Busca:** filtro na lista do Storage e na tabela do preview.
- **Auth:** login (Supabase Auth); sidebar com estado de sessão e link para login.
- Ver `motor-escolha-padroes.md` e `glossary.md` para detalhes.

## Começando

1. Definir stack (desktop vs web local) e linguagem.
2. Implementar leitura/gravação da árvore de arquivos e persistência das regras.
3. Implementar motor de regras e preview.
4. Implementar frontend com busca.

Ver `docs/architecture.md` e `docs/data-flow.md` para detalhes.
