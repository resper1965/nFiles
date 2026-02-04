---
status: filled
generated: 2026-02-04
agents:
  - type: "architect-specialist"
    role: "Definir estrutura de rotas e separação de responsabilidades por tela"
  - type: "frontend-specialist"
    role: "Implementar telas, layout e componentes"
  - type: "feature-developer"
    role: "Implementar indicadores, ingestão, regras e árvore"
  - type: "refactoring-specialist"
    role: "Extrair lógica do file-manager para Projetos e File system"
  - type: "documentation-writer"
    role: "Atualizar docs e glossário com nova estrutura"
docs:
  - "project-overview.md"
  - "architecture.md"
  - "dinamica-da-aplicacao.md"
  - "motor-escolha-padroes.md"
  - "regras-sugeridas-seed.md"
phases:
  - id: "phase-1"
    name: "Discovery & Alignment"
    prevc: "P"
  - id: "phase-2"
    name: "Implementation & Iteration"
    prevc: "E"
  - id: "phase-3"
    name: "Validation & Handoff"
    prevc: "V"
---

# Reestruturação de telas n.files — Login, Dashboard, Ingestão, Projetos, File system

> Reorganizar a aplicação n.files em 5 telas: (1) Login; (2) Dashboard principal com indicadores (projetos e arquivos); (3) Ingestão por lote/unitário; (4) Página Projetos com regras de renomeação, preview e aplicação no Storage (sem IA, sem busca, sem árvore); (5) File system com árvore (raiz = projeto). Remover criação de projeto do sidebar; variáveis de regras predeterminadas.

## Task Snapshot

- **Primary goal:** Reorganizar o n.files em cinco telas bem definidas: Login, Dashboard (com KPIs), Ingestão, Projetos (regras + preview + aplicação) e File system (só árvore). Sidebar sem criação de projeto; regras com variáveis predeterminadas; sem sugestão com IA e sem busca na tela de Projetos.
- **Success signal:** Usuário consegue (1) fazer login; (2) ver no dashboard quantidade de projetos e de arquivos; (3) ingerir arquivos em lote ou unitário; (4) na página Projetos definir regras, ver preview e aplicar no Storage (sem IA, sem busca, sem árvore); (5) na página File system ver apenas a árvore de pastas/arquivos por projeto.
- **Key references:**
  - [Documentation Index](../docs/README.md)
  - [Motor de escolha de padrões](../docs/motor-escolha-padroes.md)
  - [Regras sugeridas seed](../docs/regras-sugeridas-seed.md)
  - [Plans Index](./README.md)

## Especificação das 5 telas

### 1. Tela de Login

- **Rota:** `/login` (existente).
- **Conteúdo:** Formulário de email/senha; autenticação Supabase; redirecionamento para `/dashboard` após sucesso.
- **Alterações:** Ajustes visuais se necessário; manter lógica atual.

### 2. Tela principal — Dashboard

- **Rota:** `/dashboard` (existente; conteúdo a alterar).
- **Conteúdo:**
  - **Indicadores (KPIs):**
    - Quantidade de **projetos** do usuário (pastas raiz sob `userId/` no Storage).
    - Quantidade total de **arquivos** (contagem recursiva em todos os projetos do usuário).
  - Links/cards para: Ingestão, Projetos, File system.
- **Sem:** Seletor de projeto nem criação de projeto (isso sai do sidebar e vai para a página Projetos).
- **Fonte dos dados:** APIs ou funções que listem projetos e contem arquivos (ex.: `listProjectNames` + nova função ou API para contagem de arquivos por projeto).

### 3. Ingestão

- **Rota:** `/dashboard/ingestao` (existente).
- **Conteúdo:**
  - Ingestão de arquivos **por lote** (múltiplos arquivos de uma vez).
  - Ingestão **unitária** (um arquivo por vez).
  - Destino: projeto escolhido (projeto deve ser selecionável nesta tela, ex.: dropdown “Projeto” ou escolher antes de enviar).
- **Alterações:** Garantir que haja seleção de projeto para upload; manter/ajustar componente de ingestão atual.

### 4. Página Projetos (nova estrutura)

- **Rota:** `/dashboard/projetos` (nova rota).
- **Conteúdo:**
  - **Criação e gestão de projetos:** Criar novo projeto; listar projetos; selecionar projeto ativo para regras/preview (substitui o que hoje está no sidebar).
  - **Regras de renomeação:** Seletor de padrão (Seed completo, Seed simples, Data no início, Slug, customizados); formulário de overrides do Seed completo (Razão social do cliente, Nome da operadora, Tipo de documento, Objeto do documento); **variáveis predeterminadas** (ver abaixo).
  - **Preview:** Lista nome atual → nome novo; botão “Gerar preview” a partir da regra e da lista de nomes (ex.: nomes do Storage do projeto selecionado ou lista manual).
  - **Aplicação no Storage:** Botão aplicar renomeações (move/cópia no Storage); opção de cópia em massa para pasta “Renomeados”; download ZIP com índice.
- **Não incluir nesta tela:**
  - Sugestão com IA (remover componente/opção “Sugerir com IA”).
  - Busca (sem campo de busca).
  - Árvore de documentos (árvore fica só na página File system).

**Variáveis predeterminadas para regras (predetermine as possíveis):**

- **Razão social do cliente** — texto livre ou lista pré-definida (ex.: INGREDION).
- **Nome da operadora** — texto livre ou lista (ex.: UNIMED NACIONAL).
- **Tipo de documento** — valores fixos sugeridos: CONTRATO, ADITAMENTO, CARTA, PROPOSTA COMERCIAL, TERMO DE ADITAMENTO, OUTRO.
- **Objeto do documento** — texto livre ou sugestões: RENOVAÇÃO, REAJUSTE, ALTERAÇÃO DE REEMBOLSO, ELEGIBILIDADE, etc.
- **Data de emissão** — preenchida automaticamente (DD/MM/AAAA) ou campo editável.
- **Separador** — fixo ` | ` no padrão seed.
- **Extensão** — preservada do arquivo original.

Regras customizadas (Nova regra) continuam com placeholders `{nome}`, `{data}`, `{indice}` conforme `patterns.ts`.

### 5. File system — Árvore

- **Rota:** `/dashboard/file-manager` (existente; conteúdo a simplificar).
- **Conteúdo:**
  - **Apenas árvore de documentos:** Raiz = projeto (ou lista de projetos); cada projeto expande para suas pastas e arquivos. Múltiplos projetos visíveis (ex.: seletor “Projeto” no topo da página ou árvore com primeira nível = projetos).
  - Navegação por pastas; seleção de arquivos/pastas conforme necessário para futuras ações (ex.: “Usar seleção no preview” pode abrir modal ou redirecionar para Projetos com os itens selecionados).
- **Não incluir nesta tela:** Cards de “Sugerir nome com IA”, “Busca”, “Regras”, “Preview” (tudo fica na página Projetos). File system = só árvore.

**Estrutura da árvore:**

- Nível 0 (raiz): projetos do usuário (pastas em `userId/`).
- Níveis seguintes: pastas e arquivos dentro do projeto selecionado ou listados por projeto.

## Sidebar — alterações

- **Remover:** Bloco “Projeto” (select de projeto + input “Novo projeto” + botão criar). Criação e seleção de projeto passam para a **página Projetos**.
- **Manter:** Logo ness. / n.files; links Dashboard, Ingestão, Projetos (nova), File system; email do usuário; botão Sair.
- **Opcional:** Na sidebar manter apenas um link “Projetos” e, dentro da página Projetos, o usuário escolhe/cria o projeto. Ou exibir na sidebar apenas o “projeto atual” em modo leitura (somente leitura) quando houver contexto, sem criação — conforme decisão de UX; o essencial é **não criar projeto na sidebar**.

## Navegação e contexto de projeto

- **Dashboard:** Não exige projeto selecionado; mostra totais gerais (projetos e arquivos).
- **Ingestão:** Exige escolher projeto (dropdown na própria tela) antes ou durante o upload.
- **Projetos:** Seleção e criação de projeto nesta página; regras, preview e aplicação referem-se ao projeto selecionado.
- **File system:** Listar todos os projetos na raiz da árvore ou exibir seletor de projeto no topo; árvore mostra apenas pastas/arquivos do projeto (ou de todos, conforme UX).

## Codebase Context

- **Frontend:** Next.js (App Router) em `frontend/`; layout do dashboard em `frontend/app/dashboard/layout.tsx` (sidebar com projeto); file-manager em `frontend/app/dashboard/(auth)/file-manager/page.tsx` (hoje mistura árvore, regras, preview, IA, busca).
- **Componentes relevantes:** `FileManagerContent`, `FileTree`, `PreviewRenames`, `PatternSelector`, `SeedFullOverridesForm`, `SuggestWithAI`, `NewRuleForm`; hooks `useProject`, `useCustomPatterns`; libs `patterns.ts`, `storage.ts`.
- **APIs:** `/api/storage/copy-batch`, `/api/export/zip`, `/api/content/extract`; autenticação Supabase.
- **Refatoração:** Extrair de `file-manager` a parte “Regras + Preview + Aplicação” para a nova página `projetos`; deixar em `file-manager` apenas a árvore (+ seletor de projeto se necessário). Remover ou ocultar `SuggestWithAI` da página Projetos; remover busca da página Projetos.

## Agent Lineup

| Agent | Role in this plan |
| --- | --- |
| Architect Specialist | Definir rotas, responsabilidades por tela e fluxo de dados (projeto atual, contagem de arquivos). |
| Frontend Specialist | Implementar layout do Dashboard (KPIs), página Projetos, simplificação do File system (só árvore), sidebar sem criação de projeto. |
| Feature Developer | Indicadores (contagem projetos/arquivos), ingestão lote/unitária com seleção de projeto, variáveis predeterminadas nas regras. |
| Refactoring Specialist | Extrair regras/preview/aplicação para `projetos`; remover IA e busca da tela de regras; manter árvore só em file-manager. |
| Documentation Writer | Atualizar `dinamica-da-aplicacao.md`, `motor-escolha-padroes.md`, README e glossário com as 5 telas e variáveis. |

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
| --- | --- | --- | --- |
| Quebra de fluxo atual (usuários que usam sidebar para projeto) | Medium | Medium | Comunicar mudança; projeto passando a ser escolhido em Projetos e na Ingestão. |
| Contagem de arquivos pesada em contas com muitos arquivos | Low | Medium | Contagem sob demanda ou em background; cache por projeto; limitar profundidade se necessário. |

### Dependencies

- **Internal:** `ProjectProvider` e `useProject` (projeto atual pode ser usado em Projetos e Ingestão; File system pode listar projetos sem “projeto atual” ou com seletor).
- **External:** Supabase Auth e Storage (inalterados).
- **Technical:** Nova rota `/dashboard/projetos`; possível API ou função para contagem de arquivos por projeto.

### Assumptions

- Projeto “atual” pode ser definido na página Projetos e, se desejado, persistido em contexto (ex.: `ProjectProvider`) para uso em Preview/Aplicação e, opcionalmente, na Ingestão.
- Não será necessária sugestão com IA em nenhuma tela após esta reestruturação; o endpoint `/api/ai/suggest` pode permanecer no código mas não será usado na UI da página Projetos.

## Resource Estimation

| Phase | Estimated Effort | Calendar Time |
| --- | --- | --- |
| Phase 1 - Discovery | 0.5–1 person-day | 1 day |
| Phase 2 - Implementation | 3–5 person-days | 1–2 weeks |
| Phase 3 - Validation | 1 person-day | 2–3 days |
| **Total** | **~5–7 person-days** | **~2 weeks** |

### Required Skills

- React/Next.js; Supabase Storage (list/count); refatoração de componentes e rotas.

## Working Phases

### Phase 1 — Discovery & Alignment

**Steps**

1. Confirmar com stakeholder a lista de variáveis predeterminadas (tipo de documento, objeto, etc.) e se há lista pré-definida para razão social/operadora.
2. Definir onde o “projeto atual” é definido (só na página Projetos ou também na Ingestão) e se a sidebar deve mostrar projeto em modo só leitura.
3. Definir se no File system a raiz mostra todos os projetos ou um seletor de projeto no topo.

**Commit Checkpoint**

- `chore(plan): complete phase 1 discovery reestruturacao-telas-nfiles`

### Phase 2 — Implementation & Iteration

**Steps**

1. **Dashboard:** Adicionar indicadores (número de projetos; número total de arquivos). Manter links para Ingestão, Projetos, File system. Remover dependência de “projeto atual” no dashboard.
2. **Sidebar:** Remover bloco de criação/seleção de projeto; adicionar link “Projetos” no menu.
3. **Nova página Projetos (`/dashboard/projetos`):** Criar página com criação/listagem/seleção de projeto; mover para cá Regras (PatternSelector, SeedFullOverridesForm, Nova regra), Preview (PreviewRenames) e Aplicação (aplicar renomeações, cópia em massa, ZIP). Remover SuggestWithAI e campo de Busca. Predeterminar variáveis no formulário (dropdowns ou sugestões para tipo de documento, objeto, etc.).
4. **File system (`/dashboard/file-manager`):** Reduzir a apenas árvore de documentos; raiz = projetos do usuário (ou seletor de projeto + árvore do projeto). Remover cards Sugerir nome, Busca, Regras, Preview desta página.
5. **Ingestão:** Garantir seleção de projeto (dropdown ou passo anterior) antes/durante upload; manter lote e unitário.
6. **Contagem de arquivos:** Implementar função ou API que conte arquivos por projeto (recursivo) para o KPI do dashboard.

**Commit Checkpoint**

- `feat: reestruturacao telas n.files - dashboard KPIs, pagina Projetos, file system so arvore`

### Phase 3 — Validation & Handoff

**Steps**

1. Testar fluxo: Login → Dashboard (ver KPIs) → Ingestão (escolher projeto, enviar) → Projetos (criar/selecionar projeto, definir regra, preview, aplicar) → File system (ver só árvore).
2. Verificar que não há “Sugerir com IA” nem busca na página Projetos.
3. Atualizar documentação (dinâmica da aplicação, motor de padrões, variáveis predeterminadas).

**Commit Checkpoint**

- `chore(plan): complete phase 3 validation reestruturacao-telas-nfiles`

## Rollback Plan

- **Phase 2 Rollback:** Reverter commits da reestruturação; restaurar sidebar com projeto e file-manager com todas as seções. Data: apenas paths e UI; sem migração de dados.
- **Phase 3 Rollback:** Reverter deploy; manter branch de rollback disponível.

## Evidence & Follow-up

- Lista de variáveis predeterminadas aprovada.
- Screenshots ou gravação do fluxo nas 5 telas.
- Atualização de `dinamica-da-aplicacao.md` e referências no `README` e em `motor-escolha-padroes.md`.
