# Avaliação do projeto e da funcionalidade — n.files (ness)

Documento de avaliação do estado atual do projeto **Ingridion (n.files)** e das funcionalidades implementadas.

---

## 1. Visão geral do projeto

| Aspecto | Avaliação |
|--------|-----------|
| **Propósito** | Sistema de **gestão de documentos**: ingestão para a nuvem (Supabase Storage), regras de nomenclatura, preview e renomeação em lote. |
| **Stack** | Next.js 16, React 19, TypeScript, Tailwind CSS, Shadcn UI, Supabase (Auth + Storage + Postgres). |
| **Hospedagem** | Vercel; backend Supabase. |
| **Estrutura** | Frontend em `frontend/` (app router, components, contexts, lib); documentação e planos em `.context/`; Supabase em `supabase/`. |

**Conclusão:** Projeto alinhado com o objetivo (gestão de documentos com renomeação), stack moderna e documentação (.context/docs, planos) bem organizada.

---

## 2. Estrutura do frontend

- **Rotas:** `/` (redirect), `/login`, `/dashboard`, `/dashboard/ingestao`, `/dashboard/projetos`, `/dashboard/file-manager`.
- **Layout:** Dashboard com sidebar (ness, Projetos, Ingestão, File system), header (tema, notificações, menu do usuário), conteúdo em `SidebarInset`.
- **Contextos:** `AuthContext` (Supabase Auth), `ProjectContext` (projeto atual, lista de projetos, criar projeto, metadados).
- **Componentes UI:** Shadcn em `components/ui/` (button, card, table, dialog, sidebar, etc.) + componentes de domínio (file-tree, preview-renames, file-upload, file-upload-storage).

**Pontos fortes:** Separação clara entre UI genérica e domínio; uso de contextos para auth e projeto; layout consistente.

---

## 3. Funcionalidades implementadas

### 3.1 Autenticação

- Login por email/senha (Supabase Auth).
- Redirecionamento: não logado → `/login`; logado → `/dashboard`.
- Sessão refletida no header (email, menu do usuário, logout).

**Avaliação:** Funcional e integrado.

---

### 3.2 Projetos (criação e metadados)

- **Criar projeto:** Razão social e operadora obrigatórios; nome da pasta opcional (derivado de razão+operadora).
- **Metadados:** Salvos via API `POST/GET /api/projects`; inferência de tipo/objeto por IA (`POST /api/projects/infer`) opcional.
- **Seletor:** Dropdown de projetos (pastas raiz no Storage) + estado em `localStorage`.
- **Estrutura de pastas:** Pasta principal = nome do projeto; subpasta pode ser razão+operadora.

**Avaliação:** Alinhado com a regra de negócio (razão/operadora no projeto; tipo/objeto por documento). API e contexto bem integrados.

---

### 3.3 Ingestão (`/dashboard/ingestao`)

- **Projeto de destino:** Seleção de projeto antes do upload.
- **Estrutura de arquivos:** Componente **FileUploadStorage** (FileUpload em `components/ui/file-upload.tsx`):
  - Lista/grade dos arquivos do Storage do projeto (via `listAllFilesUnderPrefix`).
  - Drag-and-drop e “Selecionar arquivos” para enviar novos arquivos.
  - Busca, ordenação (nome/tipo/tamanho), seleção múltipla, abrir/baixar (URL assinada sob demanda).
  - Após upload, lista é recarregada e o componente remonta com a nova lista.

**Avaliação:** Boa experiência de “estrutura de arquivos” na ingestão (listagem rica + upload integrado). Atende à expectativa de ver a estrutura no fluxo de ingestão.

---

### 3.4 File system (`/dashboard/file-manager`)

- **Página atual:** `(auth)/file-manager/page.tsx` usa **FileTreeSection** (árvore), **StorageStatusCard**, **SummaryCards**, **FileUploadLink** (link para Ingestão).
- **Árvore:** `FileTree` com listagem lazy por nível, expansão de pastas, seleção de arquivos/pasta para uso no preview de renomeação.
- **Observação:** O componente **FileManagerContent** (`file-manager-content.tsx`), que foi atualizado com textos “estrutura de arquivos”, **não é usado** em nenhuma rota; a rota `/dashboard/file-manager` usa apenas `FileTreeSection`.

**Avaliação:** A **estrutura de arquivos** no File system é a **árvore** (FileTree), o que faz sentido. Há redundância: dois componentes (FileManagerContent e FileTreeSection) com propósito parecido; apenas um está em uso.

---

### 3.5 Projetos — Regras, preview e renomeação (`/dashboard/projetos`)

- **Regras:** Seletor de padrão (Seed simples/completo, Data no início, Slug, custom) + formulário Seed completo (razão/operadora do projeto; tipo/objeto em branco por documento).
- **Preview:** Tabela nome atual → nome novo; “Usar arquivos do Storage”, “Usar seed do repositório”, “Gerar preview”; texto explicando que a renomeação só ocorre ao clicar em **Renomear**.
- **Renomear:** Botão aplica as renomeações no Storage (move).
- **Copiar com nome correto:** Cópia em massa para pasta Renomeados + modal com “Baixar ZIP com índices”.

**Avaliação:** Fluxo completo (regras → preview → renomear/copiar) concentrado na página Projetos. Documentação (dinâmica-da-aplicacao.md) e textos na UI estão alinhados (padrão da nomenclatura, quando os arquivos são renomeados).

---

### 3.6 APIs e backend

- **Auth:** Supabase Auth (cookies/SSR).
- **Storage:** listFiles, listAllFilesUnderPrefix, uploadFile, renameFile, createSignedUrl, copy-batch (API), export zip (API).
- **Projetos:** POST/GET `/api/projects`, POST `/api/projects/infer` (IA).
- **Conteúdo/IA:** `POST /api/content/extract`, `POST /api/ai/suggest`.

**Avaliação:** APIs coerentes com o fluxo; autenticação e validação de paths centralizadas onde aplicável.

---

## 4. Pontos fortes

1. **Documentação:** `.context/docs` (dinâmica, arquitetura, glossário, data-flow) e planos deixam claro o fluxo e as decisões.
2. **Separação de responsabilidades:** Projeto = razão/operadora (e pasta); tipo/objeto por documento; regras = padrão da nomenclatura.
3. **UX de ingestão:** FileUpload + Storage (lista/grade, drag-drop, abrir/baixar com signed URL) oferece uma “estrutura de arquivos” clara.
4. **File system:** Árvore lazy e seleção para preview atendem ao conceito de estrutura (árvore de pastas/arquivos).
5. **Preview e renomeação:** Preview explícito e ação de renomear apenas no clique; cópia em massa e ZIP com índice implementados.
6. **Stack e componentes:** Next.js, TypeScript, Shadcn, Tailwind e componentes reutilizáveis (Table, FileUpload) bem integrados.

---

## 5. Gaps e inconsistências (atualizado após recomendações)

1. **FileManagerContent:** Resolvido. As alterações de texto (“estrutura de arquivos”) estão em `file-manager-content.tsx`, que não é referenciado em nenhuma página. A rota File system usa `FileTreeSection`. Ou se passa a usar `FileManagerContent` na rota, ou se unifica/copia os textos para o card de `FileTreeSection` para evitar componente órfão.
2. **Duas entradas para “file structure”:** Ingestão = lista/grade (FileUploadStorage); File system = árvore (FileTreeSection). Isso é intencional (duas visões), mas pode gerar dúvida se “File system” deveria também ter lista/grade; a documentação já deixa claro que a estrutura no File system é a árvore.
3. **Projetos vs File system na documentação:** O doc fala em “File system” para regras, preview e renomear; na app, isso está em **Projetos** (`/dashboard/projetos`). Vale alinhar a documentação à rota real (Projetos = regras + preview + renomear; File system = árvore).
4. **Tamanho/tipo de arquivos do Storage:** `listFiles` / Storage não retornam tamanho/tipo; na lista da Ingestão (FileUploadStorage) esses campos vêm como 0 e tipo inferido por extensão. Para exibir tamanho real seria necessário metadata no Storage ou API que retorne isso.

---

## 6. Recomendações (aplicadas em 2026-02-05)

1. **Unificar FileManagerContent/FileTreeSection:** Aplicado. Decidir entre (a) usar `FileManagerContent` na página `/dashboard/file-manager` no lugar (ou junto) de `FileTreeSection`, ou (b) remover/deprecar `FileManagerContent` e manter apenas `FileTreeSection`, copiando os textos de “estrutura de arquivos” para o card da árvore.
2. **Documentação:** Ajustar dinâmica-da-aplicacao.md (e referências) para indicar que **Regras, Preview e Renomear** ficam na página **Projetos** (`/dashboard/projetos`), e que **File system** (`/dashboard/file-manager`) é a **estrutura em árvore** e o link para ingestão.
3. **Metadados de arquivo (opcional):** Se for importante mostrar tamanho/tipo reais na Ingestão, avaliar uso de metadados do Storage ou uma API que enriqueça a listagem.
4. **Testes:** Manter e ampliar testes em `lib/` (patterns, custom-patterns-storage) e considerar testes de integração para fluxos críticos (upload → listagem, preview → renomear).

---

## 7. Resumo

| Critério | Nota | Comentário |
|----------|------|------------|
| Alinhamento ao objetivo | Alta | Gestão de documentos com ingestão, regras, preview e renomeação implementados. |
| Clareza do fluxo | Alta | Projeto → Ingestão → File system (árvore) e Projetos (regras/preview/renomear) compreensíveis; doc e UI alinhados. |
| Estrutura de arquivos | Alta | Ingestão: lista/grade (FileUploadStorage); File system: árvore (FileTreeSection). |
| Código e stack | Alta | Next.js, TypeScript, Shadcn, contextos e APIs coerentes. |
| Consistência de rotas/componentes | Média | FileManagerContent não usado; doc vs rotas (File system vs Projetos) precisam de pequeno alinhamento. |

**Conclusão geral:** O projeto está **bem encaminhado** e a funcionalidade atende ao propósito. Os principais ajustes são de consistência (uso de FileManagerContent ou unificação de textos) e de documentação (onde ficam regras/preview/renomear vs árvore).
