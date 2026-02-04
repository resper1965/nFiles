---
type: doc
name: glossary
description: Terminologia e entidades do domínio n.files (ness)
category: glossary
generated: 2026-02-04
status: filled
scaffoldVersion: "2.0.0"
---

# Glossário — n.files (ness)

O **n.files** é um sistema de **gestão de documentos** (ingestão, regras de renomeação, preview e file manager).

## Entidades de domínio

| Termo | Descrição |
|-------|-----------|
| **Ingestão** | Entrada de arquivos no sistema em **lote** ou **unitária**; dispara o fluxo de renomeação e inserção no file manager. |
| **Tela de ingestão** | Interface onde o usuário envia arquivos (lote ou único) e aciona o fluxo; inclui o **botão de renomeação** para aplicar as regras. |
| **Botão de renomeação** | Ação explícita do usuário que dispara a geração dos arquivos renomeados e a inserção no modelo file manager. |
| **Regra de renomeação** | Descrição de como renomear arquivos; segue **melhores práticas** por padrão e permite **ingerência do usuário** (override, ajustes). |
| **Leitura de arquivos** | Em alguns casos o sistema **lê** conteúdo ou metadados do arquivo para avaliar o nome (ex.: EXIF, metadados de documento); usada quando a regra exige. |
| **Modelo file manager** | Estrutura de dados da aplicação onde os **arquivos renomeados** são **inseridos** após a ingestão; exibidos na árvore/lista da app. |
| **Árvore de arquivos** | Estrutura de diretórios e arquivos a partir de uma pasta raiz; inclui metadados (regras, histórico) e integração com o file manager. |
| **Pasta raiz** | Diretório Windows escolhido como base para aplicar regras e montar a árvore. |
| **Preview** | Mapeamento nome/caminho atual → nome/caminho novo antes de aplicar; usuário aciona o botão de renomeação para gerar e inserir no file manager. |
| **Motor de regras** | Interpreta regras (melhores práticas + ingerência do usuário); gera mapeamento de renomeação; pode solicitar leitura de arquivo quando a regra exigir. |
| **Motor de escolha de padrões** | Permite ao usuário **escolher** um padrão de nomenclatura (seed, genérico ou customizado) na UI; **sem perder** a conexão com as melhores práticas — toda escolha passa pela mesma validação (Windows, conflitos, legibilidade). Ver `motor-escolha-padroes.md`. |
| **Nova regra** | Padrão de nomenclatura **customizado** criado pelo usuário: nome do padrão + template com placeholders `{nome}`, `{data}`, `{indice}`. Persistido em `localStorage`; pode ser removido. A extensão do arquivo é sempre preservada. |
| **Resolução de conflitos** | Garantia de que dois arquivos não recebam o mesmo "nome novo" no mesmo diretório: quando o padrão gera nomes repetidos, o sistema insere sufixo numérico (`_1`, `_2`, …) antes da extensão. |
| **Seed** | Arquivos existentes no repositório usados como dados iniciais do n.files (demonstração, testes, bootstrap). Não remover. |

## Regras de renomeação

- **Regras** seguem **melhores práticas** por padrão (ex.: caracteres válidos no Windows, sem conflitos, padrões legíveis).
- **Ingerência do usuário** é permitida: o usuário pode sobrescrever, ajustar ou criar regras customizadas.
- Podem ser salvas e reutilizadas; vinculadas à árvore ou a um perfil.
- Quando a regra depender do **conteúdo ou metadados** do arquivo, o sistema fará **leitura do arquivo** para avaliar o nome.

## Frontend e busca

- **Busca:** filtro no frontend sobre a árvore (nomes de arquivos/pastas), sobre as regras (nome/descrição) e sobre resultados/preview.
- Objetivo: localizar rapidamente itens e regras sem navegar manualmente.

## Persistência e Supabase

- **Supabase (conectado):** o projeto usa **Supabase Auth** para autenticação e **Supabase Storage** para arquivos (ingestão e file manager). Regras e metadados do file manager podem ficar em **Supabase Postgres** (tabelas com RLS) ou em metadados no Storage.
- **Supabase Auth:** login, sessão e proteção de rotas; associar dados ao usuário.
- **Supabase Storage:** buckets para arquivos; políticas (RLS) por usuário. Ver `supabase.md` e `security.md`.

## Plataforma

- **Windows:** sistema de arquivos NTFS; nomes com restrições (caracteres proibidos, tamanho, etc.). O motor deve validar nomes gerados para Windows.
