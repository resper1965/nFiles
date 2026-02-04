---
status: filled
generated: 2026-02-04
agents:
  - type: "code-reviewer"
    role: "Review code changes for quality, style, and best practices"
  - type: "bug-fixer"
    role: "Analyze bug reports and error messages"
  - type: "feature-developer"
    role: "Implement new features according to specifications"
  - type: "refactoring-specialist"
    role: "Identify code smells and improvement opportunities"
  - type: "test-writer"
    role: "Write comprehensive unit and integration tests"
  - type: "documentation-writer"
    role: "Create clear, comprehensive documentation"
  - type: "performance-optimizer"
    role: "Identify performance bottlenecks"
  - type: "security-auditor"
    role: "Identify security vulnerabilities"
  - type: "backend-specialist"
    role: "Design and implement server-side architecture"
  - type: "frontend-specialist"
    role: "Design and implement user interfaces"
  - type: "architect-specialist"
    role: "Design overall system architecture and patterns"
  - type: "devops-specialist"
    role: "Design and maintain CI/CD pipelines"
  - type: "database-specialist"
    role: "Design and optimize database schemas"
  - type: "mobile-specialist"
    role: "Develop native and cross-platform mobile applications"
docs:
  - "project-overview.md"
  - "architecture.md"
  - "development-workflow.md"
  - "testing-strategy.md"
  - "glossary.md"
  - "data-flow.md"
  - "security.md"
  - "tooling.md"
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

# Adaptar shadcn-ui-kit-dashboard (file-manager) para n.files Plan

> Usar o dashboard Bundui (shadcn) como base e adaptar a área file-manager para o frontend do n.files: **tela de ingestão** (lote/único), **botão de renomeação**, regras (melhores práticas + ingerência do usuário), leitura de arquivos quando necessário, e **inserção dos renomeados no modelo file manager**. Base disponível: bundui/shadcn-admin-dashboard-free; file-manager completo no kit pro.

## Task Snapshot
- **Primary goal:** Frontend n.files (ness) baseado no dashboard Bundui (shadcn), com: **tela de ingestão** (lote ou único); **botão de renomeação**; regras (melhores práticas + ingerência do usuário); leitura de arquivos quando a regra exigir; árvore de arquivos; **modelo file manager** onde os arquivos renomeados são inseridos após a ingestão; busca (árvore + regras + resultados + file manager).
- **Success signal:** App rodando (Next.js) com rota file-manager; tela de ingestão; botão de renomeação; árvore, regras, preview e file manager (itens renomeados inseridos) integrados ao core quando existir.
- **Key references:**
  - Repo base (público): [bundui/shadcn-admin-dashboard-free](https://github.com/bundui/shadcn-admin-dashboard-free) — Next 16, React 19, Tailwind 4, shadcn/ui, `app/dashboard` com layout (SidebarProvider, AppSidebar, SiteHeader).
  - File-manager (kit pro): demo em [shadcnuikit.com/dashboard/apps/file-manager](https://shadcnuikit.com/dashboard/apps/file-manager) — referência de UI (upload, categorias, lista de arquivos); código pro não está no GitHub.
  - Docs do projeto: [Documentation Index](../docs/README.md), [Architecture](../docs/architecture.md), [Project Overview](../docs/project-overview.md), [Plans Index](./README.md).

## Codebase Context
- **Base disponível:** `bundui/shadcn-admin-dashboard-free` — App Router (`app/dashboard`), layout com `SidebarProvider`, `AppSidebar`, `SiteHeader`, `SidebarInset`; rotas atuais: dashboard raiz, settings, users. **Não há pasta `(auth)/file-manager`** no free; no kit pro a estrutura é `app/dashboard/(auth)/file-manager`.
- **Stack do base:** Next.js 16.1, React 19.2, Tailwind 4, Radix/shadcn, cmdk, react-resizable-panels, recharts, etc.
- **Alvo n.files:** Repo Ingridion, pasta `frontend/`; integrar depois com `core/` (API de árvore, regras, preview).

## Agent Lineup (foco neste plano)
| Agent | Role in this plan | Playbook |
| --- | --- | --- |
| **Frontend Specialist** | Adaptar layout/sidebar e implementar: tela de ingestão (lote/único), botão de renomeação, árvore, regras, preview, modelo file manager (itens renomeados), busca. | [Frontend Specialist](../agents/frontend-specialist.md) |
| **Feature Developer** | Fluxos: ingestão → regras (melhores práticas + ingerência) → leitura de arquivos quando necessário → preview → botão renomear → inserção no file manager; integração com core quando existir. | [Feature Developer](../agents/feature-developer.md) |
| **Architect Specialist** | Estrutura de rotas (`(auth)/file-manager`), estado (árvore, regras, file manager), contrato com o core (ingestão, leitura de arquivos, inserção no file manager). | [Architect Specialist](../agents/architect-specialist.md) |
| **Documentation Writer** | Atualizar docs do frontend (README, uso do file-manager) e referências no .context. | [Documentation Writer](../agents/documentation-writer.md) |
| Code Reviewer | Revisar PRs de UI e integração. | [Code Reviewer](../agents/code-reviewer.md) |
| Test Writer | Testes de componentes e fluxos do file-manager quando aplicável. | [Test Writer](../agents/test-writer.md) |

## Documentation Touchpoints
| Guide | File | Primary Inputs |
| --- | --- | --- |
| Project Overview | [project-overview.md](../docs/project-overview.md) | Roadmap, README, stakeholder notes |
| Architecture Notes | [architecture.md](../docs/architecture.md) | ADRs, service boundaries, dependency graphs |
| Development Workflow | [development-workflow.md](../docs/development-workflow.md) | Branching rules, CI config, contributing guide |
| Testing Strategy | [testing-strategy.md](../docs/testing-strategy.md) | Test configs, CI gates, known flaky suites |
| Glossary & Domain Concepts | [glossary.md](../docs/glossary.md) | Business terminology, user personas, domain rules |
| Data Flow & Integrations | [data-flow.md](../docs/data-flow.md) | System diagrams, integration specs, queue topics |
| Security & Compliance Notes | [security.md](../docs/security.md) | Auth model, secrets management, compliance requirements |
| Tooling & Productivity Guide | [tooling.md](../docs/tooling.md) | CLI scripts, IDE configs, automation workflows |

## Risk Assessment
Identify potential blockers, dependencies, and mitigation strategies before beginning work.

### Identified Risks
| Risk | Probability | Impact | Mitigation Strategy |
| --- | --- | --- | --- |
| Código do file-manager do kit pro não está no GitHub | Alta | Médio | Usar **shadcn-admin-dashboard-free** como base e recriar área file-manager inspirada na demo (shadcnuikit.com); componentes shadcn reutilizáveis. |
| Core n.files ainda não existe | Média | Médio | Frontend pode usar dados mock (árvore, regras, preview) até a API do core estar pronta; definir contrato (endpoints/estruturas) na Phase 1. |
| Incompatibilidade de versões (Next/React) ao copiar trechos | Baixa | Baixo | Manter mesmo stack do base (Next 16, React 19, Tailwind 4) no frontend n.files. |

### Dependencies
- **Internal:** Core n.files (motor de regras, árvore, persistência) — opcional na Phase 2; integração quando disponível.
- **External:** Repo [bundui/shadcn-admin-dashboard-free](https://github.com/bundui/shadcn-admin-dashboard-free); referência visual do file-manager em shadcnuikit.com (kit pro); **Vercel** para hospedagem da aplicação.
- **Technical:** Node/pnpm; Next.js 16, React 19, Tailwind 4; componentes shadcn/ui; deploy na Vercel (frontend; APIs via Serverless Functions se necessário).

### Assumptions
- Usar o **free** dashboard como base é aceitável; o file-manager será **recriado** para n.files (árvore, regras, busca, preview), não copiado do pro.
- Se o usuário tiver acesso ao kit pro (código), pode-se alinhar estrutura de pastas/componentes em um segundo momento.
- Frontend roda como app web (Next.js); execução de renomeações no Windows ficará no core (ex.: API local ou Electron/Tauri depois).

## Resource Estimation

### Time Allocation
| Phase | Estimated Effort | Calendar Time | Team Size |
| --- | --- | --- | --- |
| Phase 1 - Discovery | 1–2 person-days | 2–3 days | 1 |
| Phase 2 - Implementation | 5–8 person-days | 1–2 weeks | 1–2 |
| Phase 3 - Validation | 1–2 person-days | 2–3 days | 1 |
| **Total** | **7–12 person-days** | **~2–3 weeks** | **-** |

### Required Skills
- Next.js App Router, React 19, TypeScript.
- Tailwind CSS e componentes shadcn/ui (ou Radix).
- Integração com API local (core) ou dados mock.

### Resource Availability
- **Available:** A definir.
- **Escalation:** A definir.

## Working Phases
### Phase 1 — Discovery & Alignment
**Steps**
1. **Clonar e analisar** [bundui/shadcn-admin-dashboard-free](https://github.com/bundui/shadcn-admin-dashboard-free): estrutura `app/`, `components/`, `package.json`, layout do dashboard (SidebarProvider, AppSidebar, SiteHeader).
2. **Referência file-manager (pro):** anotar da demo [shadcnuikit.com/dashboard/apps/file-manager](https://shadcnuikit.com/dashboard/apps/file-manager) layout, blocos (árvore, lista, categorias, busca) e componentes reutilizáveis (tabela, inputs, botões).
3. **Definir estrutura no Ingridion:** onde o frontend vive (ex.: `frontend/` como Next app ou cópia do dashboard em `frontend/` com rota `app/dashboard/(auth)/file-manager`); contrato de dados com o core (árvore, regras, preview) para mock/API futura.
4. **Documentar** decisões em `.context/docs/` (ex.: architecture, tooling) e atualizar este plano se necessário.

**Commit Checkpoint**
- `git commit -m "chore(plan): complete phase 1 discovery — shadcn base and file-manager structure"`

### Phase 2 — Implementation & Iteration
**Steps**
1. **Bootstrap do frontend:** copiar/adaptar o repo free para `frontend/` do Ingridion (ou inicializar Next com mesmas deps); branding **ness** / **n.files**; sidebar com entrada "File manager" (ou equivalente).
2. **Rota file-manager:** criar `app/dashboard/(auth)/file-manager/` com `page.tsx` e layout mínimo; garantir que o layout do dashboard (sidebar + header) envolva a página.
3. **Telas e componentes:** (a) **Tela de ingestão** — entrada de arquivos em **lote** ou **único** (upload/drag-and-drop ou seleção); (b) **Botão de renomeação** — dispara aplicação das regras e inserção no file manager; (c) Regras (lista + formulário; melhores práticas por padrão, ingerência do usuário); (d) Árvore de arquivos (navegável, com busca); (e) **Modelo file manager** — lista/árvore onde os arquivos renomeados são **inseridos** após a ingestão; (f) Preview (nome atual → nome novo); (g) Busca (árvore + regras + preview + file manager). Quando a regra exigir, o core fará **leitura do arquivo** (conteúdo/metadados) para avaliar o nome.
4. **Dados:** mock (árvore, regras, file manager em estado local) até o core expor API; quando houver core, trocar por chamadas (ingestão, leitura de arquivos, inserção no file manager).
5. **Referência:** usar componentes shadcn já presentes no base (Table, Input, Button, Sidebar, etc.); adicionar apenas o necessário (ex.: Tree, Command para busca).

**Commit Checkpoint**
- `git commit -m "chore(plan): complete phase 2 implementation — file-manager UI and mock data"`

### Phase 3 — Validation & Handoff
**Steps**
1. **Testes:** rodar `pnpm build` e `pnpm dev`; verificar navegação dashboard → file-manager; testar busca e exibição de árvore/regras/preview com dados mock.
2. **Docs:** atualizar `frontend/README.md` e `.context/docs/` com instruções de run e estrutura da rota file-manager; referenciar este plano.
3. **Deploy:** validar build e deploy na **Vercel** (config `vercel.json` se necessário); garantir que a aplicação rode no ambiente Vercel.
4. **Evidência:** capturar screenshot ou lista de rotas/componentes implementados; anotar pendências (ex.: integração real com core, seleção de pasta Windows).

**Commit Checkpoint**
- `git commit -m "chore(plan): complete phase 3 validation — file-manager ready for core integration"`

## Rollback Plan
Document how to revert changes if issues arise during or after implementation.

### Rollback Triggers
When to initiate rollback:
- Critical bugs affecting core functionality
- Performance degradation beyond acceptable thresholds
- Data integrity issues detected
- Security vulnerabilities introduced
- User-facing errors exceeding alert thresholds

### Rollback Procedures
#### Phase 1 Rollback
- Action: Discard discovery branch, restore previous documentation state
- Data Impact: None (no production changes)
- Estimated Time: < 1 hour

#### Phase 2 Rollback
- Action: Revert commits do frontend; remover pasta `frontend/` ou branch de feature.
- Data Impact: Nenhum (sem persistência de usuário ainda).
- Estimated Time: < 1 hour

#### Phase 3 Rollback
- Action: Reverter para versão anterior do frontend; documentar motivo.
- Data Impact: Nenhum.
- Estimated Time: < 1 hour

### Post-Rollback Actions
1. Document reason for rollback in incident report
2. Notify stakeholders of rollback and impact
3. Schedule post-mortem to analyze failure
4. Update plan with lessons learned before retry

## Evidence & Follow-up

- **Artifacts:** PR(s) do frontend; screenshot ou lista de rotas/componentes; `frontend/README.md` atualizado; este plano com status das fases.
- **Follow-up:** Integrar com core n.files (API de árvore, regras, preview); implementar seleção de pasta real no Windows quando o core existir.
