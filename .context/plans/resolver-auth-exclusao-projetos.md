---
status: in_progress
generated: 2026-02-05
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

# Resolver autenticação na exclusão de projetos (n.Files) Plan

> Corrigir erro "Não autenticado" ao excluir projeto na UI: API DELETE /api/projects não recebe sessão quando o cliente usa localStorage (Supabase browser client) e o servidor lê cookies.

## Task Snapshot
- **Primary goal:** Garantir que, ao clicar em "Excluir" no modal de exclusão de projeto (ex.: "INGREDION_UNIMEDNACIONAL"), a requisição DELETE `/api/projects?name=...` seja autenticada e o projeto seja removido (Storage + tabela `projects`), sem retornar "Não autenticado".
- **Success signal:** Usuário logado consegue excluir um projeto pela UI sem ver a mensagem "Não autenticado. Faça login ou envie accessToken no body."
- **Key references:**
  - [Documentation Index](../docs/README.md)
  - [Agent Handbook](../agents/README.md)
  - [Plans Index](./README.md)

## Codebase Context
- **Auth no browser:** `lib/supabase.ts` usa `createClient` (Supabase JS); sessão fica em **localStorage**. Login/sessão são gerenciados em `contexts/auth-context.tsx` (getSession, onAuthStateChange).
- **Auth no servidor:** `lib/supabase-server.ts` usa `createServerClient` (Supabase SSR) e lê **cookies** via `next/headers` (`cookies()`). Como o cliente não grava sessão em cookies, as rotas API não veem sessão só por cookies.
- **API de projetos:** `app/api/projects/route.ts` — DELETE chama `getUserIdFromRequest(request, {})`. Em `lib/api-auth.ts`, `getUserIdFromRequest` obtém userId por: (1) cookies via `createSupabaseServerClient().auth.getUser()`, (2) header `Authorization: Bearer <token>`, (3) `body.accessToken`. Para DELETE não há body, então a autenticação depende de cookies ou do header Bearer.
- **Frontend ao excluir:** `contexts/project-context.tsx` — `deleteProject` chama `getAccessTokenForApi(session)` (tenta `getSupabaseBrowser().auth.getSession()`, fallback `session` do `useAuth()`), depois `fetch(..., headers: token ? { Authorization: \`Bearer ${token}\` } : {}, credentials: "include")`. Se `getAccessTokenForApi` retornar `null`, o header não é enviado e a API responde 401.
- **Hipótese da falha:** (a) `getAccessTokenForApi(session)` retorna `null` (getSupabaseBrowser null, ou getSession/session do contexto vazios no momento da chamada); (b) deploy em produção desatualizado (código com Bearer/fallback não publicado); (c) header `Authorization` removido por proxy/CDN (improvável em Vercel).

## Agent Lineup
| Agent | Role in this plan | Playbook | First responsibility focus |
| --- | --- | --- | --- |
| Bug Fixer | Analisar mensagem "Não autenticado" e fluxo DELETE; confirmar onde o token se perde (front vs API). | [Bug Fixer](../agents/bug-fixer.md) | Reproduzir erro, inspecionar rede e sessão |
| Backend Specialist | Garantir que a API aceite e valide `Authorization: Bearer`; checar `getUserIdFromRequest` e ordem de fallbacks. | [Backend Specialist](../agents/backend-specialist.md) | Revisar `lib/api-auth.ts` e rota DELETE |
| Frontend Specialist | Garantir envio do token em todas as chamadas à API de projetos (DELETE e demais); fallback session do AuthContext. | [Frontend Specialist](../agents/frontend-specialist.md) | Revisar `project-context.tsx` e `getAccessTokenForApi` |

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
| Risk | Probability | Impact | Mitigation Strategy | Owner |
| --- | --- | --- | --- | --- |
| Token não enviado (getSession/session null no momento do clique) | Média | Alto | Usar session do AuthContext como fallback; garantir que deleteProject só rode com user logado. | Frontend |
| Deploy em produção desatualizado | Média | Alto | Confirmar que o commit com Bearer + getAccessTokenForApi está em produção; redeploy se necessário. | Devops |
| Header Authorization removido por proxy | Baixa | Alto | Verificar na aba Rede se o header é enviado; Vercel não remove por padrão. | Bug Fixer |

### Dependencies
- **Internal:** AuthContext deve expor `session` (já expõe). ProjectProvider deve usar `useAuth()` com `session`.
- **External:** Supabase (auth); variáveis NEXT_PUBLIC_SUPABASE_* e chave anon no cliente.
- **Technical:** Next.js App Router; rotas API em `app/api/projects/route.ts`.

### Assumptions
- O usuário está de fato logado na UI (vê projetos, consegue abrir o modal de exclusão). Se session estiver null no contexto, o problema é timing ou hidratação.
- A API já está preparada para ler `Authorization: Bearer` (código em `api-auth.ts`). Se o erro persiste, a falha é no envio do token pelo front ou em deploy.

## Resource Estimation

### Time Allocation
| Phase | Estimated Effort | Calendar Time | Team Size |
| --- | --- | --- | --- |
| Phase 1 - Discovery | ~0.5 dia | 1 dia | 1 |
| Phase 2 - Implementation | ~0.5–1 dia | 1–2 dias | 1 |
| Phase 3 - Validation | ~0.25 dia | 1 dia | 1 |
| **Total** | **~1–1.5 dias** | **1–2 dias** | **1** |

### Required Skills
- React (context, hooks); Next.js API routes; Supabase Auth (client + server).

### Resource Availability
- **Available:** Desenvolvedor com acesso ao repo e deploy (Vercel).

## Working Phases
### Phase 1 — Discovery & Alignment
**Steps**
1. **Reproduzir:** Em produção (ou local), logar, ir em Projetos, clicar em Excluir no projeto "INGREDION_UNIMEDNACIONAL", confirmar. Verificar se a mensagem "Não autenticado" aparece.
2. **Rede:** Aba Rede (DevTools) — inspecionar a requisição DELETE para `/api/projects?name=...`. Verificar se o header `Authorization: Bearer <token>` está presente. Se não estiver, o problema é no front (getAccessTokenForApi retorna null).
3. **Deploy:** Confirmar que o branch em produção contém: `getAccessTokenForApi(session)`, envio de `Authorization: Bearer` em deleteProject, e em `api-auth.ts` a leitura de `request.headers.get("authorization")`. Comparar SHA do deploy com o commit mais recente do repo.

**Commit Checkpoint**
- Documentar resultado da descoberta (header enviado ou não; deploy atualizado ou não) e criar commit `chore(plan): phase 1 discovery auth exclusão projetos`.

### Phase 2 — Implementation & Iteration
**Steps**
1. **Frontend:** Se o token não está sendo enviado: garantir que `deleteProject` use `getAccessTokenForApi(session)` com `session` do `useAuth()`; que `session` esteja nas dependências do useCallback; que, quando o usuário está logado, `session?.access_token` ou `getSupabaseBrowser().auth.getSession()` retornem valor. Opcional: logar (dev) `token` antes do fetch para debug.
2. **Backend:** Confirmar que `getUserIdFromRequest` em `api-auth.ts` lê o header antes de desistir: `const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim(); if (bearer) userId = await getUserIdFromAccessToken(bearer);`. Garantir que não há middleware removendo o header.
3. **Deploy:** Fazer commit, push e aguardar deploy na Vercel (ou rodar `vercel deploy --prod`). Garantir que a URL de produção serve o build mais recente.

**Commit Checkpoint**
- Commit de código: `fix(auth): garantir token Bearer na exclusão de projetos` (ou equivalente). Opcional: `chore(plan): phase 2 implementation auth exclusão`.

### Phase 3 — Validation & Handoff
**Steps**
1. **Teste manual:** Em produção, logar, excluir um projeto (ex.: um de teste). Confirmar que o modal não mostra "Não autenticado" e que o projeto some da lista (e do Storage/tabela).
2. **Regressão:** Criar projeto, editar projeto, listar projetos — garantir que não quebrou.
3. **Documentação:** Atualizar este plano com status "completed" e anotar evidência (ex.: "Exclusão validada em produção em DD/MM/AAAA").

**Commit Checkpoint**
- `chore(plan): phase 3 validation auth exclusão projetos`.

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
- Action: Revertir commits do fix de auth (`git revert`), push; ou manter código e re-deploy da versão anterior na Vercel.
- Data Impact: Nenhum (apenas código da API/front).
- Estimated Time: &lt; 30 min

#### Phase 3 Rollback
- Action: Rollback do deploy na Vercel para o deployment anterior.
- Data Impact: Nenhum.
- Estimated Time: &lt; 15 min

### Post-Rollback Actions
1. Document reason for rollback in incident report
2. Notify stakeholders of rollback and impact
3. Schedule post-mortem to analyze failure
4. Update plan with lessons learned before retry

## Evidence & Follow-up

- **Evidência:** Screenshot ou anotação de que a exclusão de projeto em produção concluiu sem "Não autenticado"; opcional: captura da aba Rede mostrando `Authorization: Bearer` na requisição DELETE.
- **Arquivos principais:** `frontend/lib/api-auth.ts`, `frontend/contexts/project-context.tsx`, `frontend/app/api/projects/route.ts`.
- **Follow-up:** Se o erro persistir após aplicar o plano, considerar migrar o cliente browser para Supabase SSR (`createBrowserClient` + cookies + middleware para refresh), para que a API leia a sessão por cookies e o Bearer seja redundante.
