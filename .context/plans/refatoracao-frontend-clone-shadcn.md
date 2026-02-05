---
status: filled
generated: 2026-02-04
agents:
  - type: "architect-specialist"
    role: "Definir mapeamento clone → n.files e estrutura de layout"
  - type: "frontend-specialist"
    role: "Adaptar layout, componentes e posições do clone ao n.files"
  - type: "refactoring-specialist"
    role: "Integrar file manager e dashboard mantendo funcionalidade"
  - type: "documentation-writer"
    role: "Atualizar docs com nova estrutura de UI"
docs:
  - "project-overview.md"
  - "architecture.md"
  - "dinamica-da-aplicacao.md"
  - "reestruturacao-telas-nfiles.md"
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

# Refatoração do frontend n.files usando resper1965/clone (Shadcn UI Kit)

> Refatorar o frontend do n.files (Ingridion) usando o repositório [resper1965/clone](https://github.com/resper1965/clone) como base de UI: adotar layout (header, sidebar), componentes e posições do clone; adaptar todas as telas (login, dashboard, ingestão, projetos, file manager) e integrar o file manager ao dashboard do clone.

## Task Snapshot

- **Primary goal:** O frontend do n.files passa a usar a estrutura e os componentes do clone (Shadcn UI Kit — Next.js 15, React 19): layout (header, sidebar do clone), temas (themes.css, theme-customizer se desejado), componentes UI do clone onde fizer sentido; todas as telas (login, dashboard com KPIs, ingestão, projetos, file system) são adaptadas às posições e ao visual do clone; o file manager (árvore de documentos) é integrado ao dashboard do clone.
- **Success signal:** Aplicação roda com o layout/componentes do clone; login, dashboard, ingestão, projetos e file system funcionam com a nova UI; branding ness./n.files e gestão de documentos preservados; APIs e Supabase inalterados.
- **Key references:**
  - [Clone repo](https://github.com/resper1965/clone) — Shadcn UI Kit, Next.js 15, React 19
  - [Reestruturação de telas](./reestruturacao-telas-nfiles.md) — definição das 5 telas atuais
  - [Documentation Index](../docs/README.md)
  - [Plans Index](./README.md)

## Repositório clone — estrutura de referência

Fonte: [resper1965/clone](https://github.com/resper1965/clone).

- **app/** — `layout.tsx`, `globals.css`, `themes.css`, `not-found.tsx`; **dashboard/** com `(auth)` e `(guest)` (grupos de rotas).
- **components/layout/** — `header/`, `sidebar/`, `logo.tsx`.
- **components/ui/** — Shadcn: `sidebar.tsx`, `button`, `card`, `input`, `label`, `sheet`, `select`, `dialog`, `dropdown-menu`, `breadcrumb`, `table`, `tabs`, `resizable`, `scroll-area`, `empty`, `field`, `badge`, `avatar`, `tooltip`, etc.; também `chart`, `calendar`, `kanban`, `timeline`.
- **components/** — `CardActionMenus.tsx`, `active-theme.tsx`, `theme-customizer/`, `custom-date-range-picker.tsx`, `date-time-picker.tsx`, `icon.tsx`.
- **hooks/**, **lib/** — utilitários e hooks do clone.
- **middleware.ts** — possível proteção de rotas (comparar com auth do n.files).

- **components/layout/** no clone: [`header/`](https://github.com/resper1965/clone/tree/main/components/layout/header) (index, search, notifications, theme-switch, user-menu, data), [`sidebar/`](https://github.com/resper1965/clone/tree/main/components/layout/sidebar) (app-sidebar, nav-main, nav-user), `logo.tsx`.

O clone **inclui um file manager** em [`app/dashboard/(auth)/file-manager`](https://github.com/resper1965/clone/tree/main/app/dashboard/(auth)/file-manager): página com título "File Manager", `FileUploadDialog` no header, `SummaryCards`, grid com `FolderListCards` (2 col) + `StorageStatusCard` (1 col), e abaixo `ChartFileTransfer` + `TableRecentFiles`. Componentes em `file-manager/components/`: `chart-file-transfer.tsx`, `file-upload-dialog.tsx`, `folder-list-cards.tsx`, `storage status-card.tsx`, `summary-cards.tsx`, `table-recent-files.tsx`, `index.ts`. O n.files mantém suas APIs, auth Supabase e storage; a refatoração adota do clone **layout, estrutura da página e componentes do file-manager**, adaptando-os aos dados reais (projetos, FileTree, Supabase).

## Status do layout (components/layout do clone)

**O que já está aplicado no n.files:**

- **Header:** Versão **simplificada** em `frontend/components/layout/header/index.tsx` — apenas botão de toggle da sidebar + título opcional. O clone tem header completo com Search, Notifications, ThemeSwitch, ThemeCustomizerPanel, UserMenu; esses **não** foram trazidos.
- **Sidebar:** O n.files usa a **sidebar própria** (inline no `app/dashboard/layout.tsx`): `Sidebar`, `SidebarHeader` (NessBrand, NFilesBrand, email, Sair), `SidebarContent` (menu: Dashboard, Projetos, Ingestão, File system), `SidebarInset` (SiteHeader + conteúdo). O clone tem `components/layout/sidebar/` com AppSidebar, NavMain, NavUser, Logo, dropdown de projetos; esses **não** foram trazidos.
- **Logo:** O n.files usa `NessBrand`/`NFilesBrand` em `ness-brand.tsx`; o clone tem `components/layout/logo.tsx` — **não** integrado.

**O que falta para “toda aplicação” header/sidebar do clone:**

- Trazer [`components/layout/sidebar/`](https://github.com/resper1965/clone/tree/main/components/layout) (app-sidebar, nav-main, nav-user) e adaptar: logo → NessBrand/NFilesBrand, menu → Dashboard/Projetos/Ingestão/File system, usuário/Sair; sem seletor de projeto na sidebar.
- Trazer [`components/layout/header/`](https://github.com/resper1965/clone/tree/main/components/layout/header) completo (search, notifications, theme-switch, user-menu) e adaptar: user-menu com auth Supabase; opcional: theme-customizer, search.
- Opcional: `components/layout/logo.tsx` do clone adaptado para ness./n.files.

**Implementado (2026-02-04) — layout completo:** Sidebar com AppSidebar, NavMain (n.files), NavUser (Supabase); Logo (NessBrand/NFilesBrand); Header com ThemeSwitch (next-themes), Notifications, UserMenu (Supabase). Search e ThemeCustomizerPanel não incluídos.

## Mapeamento: clone → n.files

| Área | Clone | n.files (atual → alvo) |
|------|--------|-------------------------|
| **Layout raiz** | `app/layout.tsx`, `globals.css`, `themes.css` | Adotar estrutura do clone; preservar fontes e branding ness./n.files; integrar `themes.css` se desejado. |
| **Dashboard layout** | `app/dashboard/(auth)` e `(guest)`; layout com sidebar/header do clone | Substituir o layout atual do dashboard pelo layout do clone: sidebar + header (e conteúdo principal); manter ProjectProvider e rotas (dashboard, projetos, ingestao, file-manager). |
| **Sidebar** | `components/layout/sidebar/` + `components/ui/sidebar.tsx` | Usar sidebar do clone; itens de menu: Dashboard, Projetos, Ingestão, File system; logo ness./n.files; usuário e Sair. Sem seletor de projeto na sidebar (conforme reestruturação). |
| **Header** | `components/layout/header/` | Usar header do clone; adaptar para breadcrumb, título da página, ações globais (e tema, se usar theme-customizer). |
| **Login** | `(guest)` no clone (se houver tela de login) | Manter `/login` do n.files; redesenhar com componentes do clone (card, input, button, field) e estilo do clone. |
| **Dashboard (home)** | Páginas em `(auth)` do clone | Página inicial do dashboard: KPIs (projetos, arquivos) e cards de acesso (Projetos, Ingestão, File system) usando `card`, `badge`, grid do clone. |
| **Projetos** | — | Página `/dashboard/projetos`: usar card, select, input, button, table/tabs do clone; posições e espaçamento no estilo do clone. |
| **Ingestão** | — | Página `/dashboard/ingestao`: seletor de projeto + área de upload; usar card, select, button, empty, progress do clone. |
| **File system** | `app/dashboard/(auth)/file-manager` + `file-manager/components/` (SummaryCards, FolderListCards, StorageStatusCard, ChartFileTransfer, TableRecentFiles, FileUploadDialog) | Página `/dashboard/file-manager`: estrutura e componentes do file-manager do clone; na área FolderListCards integrar FileTree do n.files (árvore por projeto); SummaryCards e StorageStatusCard com dados reais; manter seletor de projeto; FileUploadDialog ligado à ingestão ou upload direto. |
| **Componentes UI** | `components/ui/*` do clone | Copiar ou referenciar os que faltam no n.files (ex.: `resizable`, `empty`, `field`, `breadcrumb`, `native-select`); alinhar versões de shadcn (button, card, input, etc.) ao clone para consistência. |
| **Temas** | `themes.css`, `active-theme`, `theme-customizer` | Opcional: integrar temas do clone; ou manter apenas dark/light do n.files e reutilizar variáveis do clone. |

## Posições e estrutura das telas

- **Login:** Centralizado; card único com logo (ness.), título, campos e botão; estilo do clone.
- **Dashboard:** Layout do clone (sidebar + header + main); na área main: título “Dashboard”, KPIs em cards/estatísticas (projetos, arquivos), depois grid de cards (Projetos, Ingestão, File system).
- **Projetos:** Mesmo layout; main com título “Projetos”, card “Projeto” (select + criar), depois grid de cards “Regras” e “Preview” (posições atuais adaptadas ao estilo do clone).
- **Ingestão:** Mesmo layout; main com título “Ingestão”, card “Projeto de destino”, depois componente de ingestão (lote/unitário).
- **File system:** Layout do clone para file-manager: título "File Manager", FileUploadDialog no topo, SummaryCards, grid FolderListCards (2 col) + StorageStatusCard (1 col), ChartFileTransfer + TableRecentFiles; na área FolderListCards integrar o FileTree do n.files (por projeto); SummaryCards/StorageStatusCard com dados reais; seletor de projeto no header ou card.

## File manager no dashboard do clone

- O clone **já inclui** um file manager em [`app/dashboard/(auth)/file-manager`](https://github.com/resper1965/clone/tree/main/app/dashboard/(auth)/file-manager), com:
  - **page.tsx:** título "File Manager", `FileUploadDialog` no topo, `SummaryCards`, grid `FolderListCards` (2 col) + `StorageStatusCard` (1 col), depois `ChartFileTransfer` e `TableRecentFiles`.
  - **Componentes:** `FileUploadDialog`, `SummaryCards`, `FolderListCards`, `StorageStatusCard`, `ChartFileTransfer`, `TableRecentFiles` (em `file-manager/components/`).
- **Integração n.files:** Copiar/adaptar essa estrutura para o n.files; na área de **FolderListCards** substituir ou combinar com o **FileTree** do n.files (árvore por projeto); **SummaryCards** e **StorageStatusCard** alimentados por dados reais (projetos, arquivos, storage Supabase); manter seletor de projeto; **FileUploadDialog** pode abrir ingestão ou upload direto.
- Manter estado (selectedPaths) e lógica de listagem (listFiles, listAllFilesUnderPrefix) do n.files; ChartFileTransfer e TableRecentFiles podem exibir dados reais ou ser simplificados na primeira versão.

## Codebase Context (n.files)

- **Frontend atual:** `frontend/` — App Router; `app/dashboard/layout.tsx` (sidebar própria); páginas: dashboard, projetos, ingestao, file-manager; componentes: FileTree, PatternSelector, PreviewRenames, SeedFullOverridesForm, FileIngestion, etc.; contexts: auth, project; lib: storage, patterns.
- **APIs e backend:** Inalterados (Supabase Auth, Storage; APIs de copy-batch, export zip, content extract, ai suggest).
- **Refatoração:** Trocar layout do dashboard pelo do clone; adotar componentes UI do clone onde possível; redesenhar cada tela com posições e componentes do clone; manter rotas e funcionalidade.

## Agent Lineup

| Agent | Role in this plan |
|-------|-------------------|
| Architect Specialist | Mapear estrutura do clone para n.files; definir onde usar header, sidebar, temas; garantir que login/(auth)/(guest) e rotas do n.files encaixem no layout do clone. |
| Frontend Specialist | Copiar/adaptar layout (header, sidebar), componentes UI e temas do clone; adaptar login, dashboard, projetos, ingestão e file system às posições e componentes do clone. |
| Refactoring Specialist | Integrar FileTree e lógica do file manager ao novo layout; garantir que ProjectProvider, useAuth e rotas continuem funcionando; resolver conflitos de estilos (globals.css, themes.css). |
| Documentation Writer | Atualizar dinamica-da-aplicacao.md e arquitetura com a nova estrutura de UI e referência ao clone. |

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Conflito de versões (shadcn, React, Next) entre clone e n.files | Medium | Medium | Alinhar dependências (package.json); preferir componentes do clone e ajustar imports. |
| Layout do clone não contemplar auth Supabase | Low | Medium | Manter middleware/auth do n.files; usar (auth)/(guest) do clone apenas para estrutura de rotas e layout. |
| Perda de funcionalidade na migração | Medium | High | Checklist por tela (login, dashboard KPIs, projetos, ingestão, file manager); testes manuais após cada etapa. |

### Dependencies

- **External:** Repositório [resper1965/clone](https://github.com/resper1965/clone) como referência (cópia de arquivos ou comparação manual).
- **Technical:** Next.js e React compatíveis com o clone (Next 15, React 19 no clone; verificar versão atual do n.files).

### Assumptions

- O clone permanece disponível em https://github.com/resper1965/clone; podemos copiar trechos de layout e componentes.
- As 5 telas atuais do n.files (login, dashboard, ingestão, projetos, file system) são preservadas em funcionalidade; apenas UI e posições mudam.

## Resource Estimation

| Phase | Estimated Effort | Calendar Time |
|-------|------------------|---------------|
| Phase 1 - Discovery | 1–2 person-days | 2–3 days |
| Phase 2 - Implementation | 5–8 person-days | 1.5–2 weeks |
| Phase 3 - Validation | 1–2 person-days | 2–3 days |
| **Total** | **~8–12 person-days** | **~2–3 weeks** |

### Required Skills

- React/Next.js; Shadcn UI; integração de layout e temas entre projetos.

## Working Phases

### Phase 1 — Discovery & Alignment

**Steps**

1. Listar e anotar arquivos do clone relevantes: `app/layout.tsx`, `app/globals.css`, `app/themes.css`, `app/dashboard/`, `components/layout/`, `components/ui/sidebar.tsx`, `components/ui/header` (ou layout/header), e um exemplo de página em `(auth)`.
2. Definir decisões: usar ou não `themes.css` e theme-customizer; usar (auth)/(guest) do clone ou apenas copiar sidebar/header; lista final de componentes UI a trazer do clone.
3. Documentar mapeamento clone → n.files (este plano) e aprovar com stakeholder.

**Commit Checkpoint**

- `chore(plan): complete phase 1 discovery refatoracao-frontend-clone`

### Phase 2 — Implementation & Iteration

**Steps**

1. **Layout e temas:** Trazer layout raiz e dashboard do clone para `frontend/`; integrar sidebar e header do clone; manter ou integrar `themes.css`; preservar branding ness./n.files e rotas (dashboard, projetos, ingestao, file-manager).
2. **Componentes UI:** Copiar ou atualizar componentes do clone que faltam ou diferem (ex.: resizable, empty, field, breadcrumb, native-select); garantir que button, card, input, label, select, sheet existam e estejam alinhados ao clone.
3. **Login:** Redesenhar `/login` com componentes e estilo do clone; manter auth Supabase.
4. **Dashboard:** Redesenhar página inicial do dashboard com KPIs e cards de Projetos, Ingestão, File system no estilo e posições do clone.
5. **Projetos:** Redesenhar `/dashboard/projetos` com card de projeto, regras e preview usando componentes e grid do clone.
6. **Ingestão:** Redesenhar `/dashboard/ingestao` com card de projeto de destino e área de upload no estilo do clone.
7. **File system:** Trazer a página e os componentes do file-manager do clone (`app/dashboard/(auth)/file-manager`); na área de FolderListCards integrar o FileTree do n.files; conectar SummaryCards e StorageStatusCard aos dados reais (projetos, arquivos, storage); manter seletor de projeto; adaptar FileUploadDialog à ingestão/upload do n.files.
8. Ajustar responsividade e acessibilidade; corrigir conflitos de CSS (globals vs themes).

**Commit Checkpoint**

- `feat: refatoracao frontend com layout e componentes do clone (resper1965/clone)`

### Phase 3 — Validation & Handoff

**Steps**

1. Testar fluxo completo: login → dashboard (KPIs e links) → Projetos (criar/selecionar, regras, preview) → Ingestão (selecionar projeto, upload) → File system (selecionar projeto, árvore).
2. Verificar em mais de um tema (se integrado) e em mobile/tablet.
3. Atualizar documentação (dinâmica da aplicação, arquitetura, referência ao clone).

**Commit Checkpoint**

- `chore(plan): complete phase 3 validation refatoracao-frontend-clone`

## Rollback Plan

- **Phase 2 Rollback:** Reverter commits da refatoração; restaurar layout e componentes atuais do n.files. Dados e APIs não são afetados.
- **Phase 3 Rollback:** Reverter deploy; manter branch anterior estável.

## Evidence & Follow-up

- Lista de arquivos/componentes trazidos do clone e alterados no n.files.
- Screenshots ou gravação das 5 telas após refatoração.
- Atualização de `.context/docs/dinamica-da-aplicacao.md` e `architecture.md` com referência ao clone e nova estrutura de UI.
