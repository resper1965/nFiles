---
status: in_progress
generated: 2026-02-06
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

# Resolver autenticação na deleção de projetos (definitivo) Plan

> Plano definitivo para eliminar o erro "Não autenticado" na exclusão de um projeto e em "Apagar todos os projetos": diagnóstico da causa raiz (token não obtido, não enviado ou não aceito pela API), correção em todas as camadas e validação end-to-end.

## Task Snapshot
- **Primary goal:** Eliminar de forma definitiva o erro "Não autenticado. Faça login ou envie accessToken no body." em **todas** as ações de deleção de projetos: (1) exclusão de um projeto (modal "Excluir projeto") e (2) "Apagar todos os projetos" (modal "Apagar todos os projetos"). O usuário logado deve conseguir excluir um ou todos os projetos sem ver a mensagem de não autenticado.
- **Success signal:** Em produção, usuário logado: (1) clica em Excluir num projeto → confirma → projeto é removido e o modal fecha sem erro; (2) clica em "Apagar todos os projetos" → confirma → todos os projetos são removidos e o modal fecha sem erro. Nenhuma das duas ações exibe "Não autenticado".
- **Key references:**
  - [Documentation Index](../docs/README.md)
  - [Agent Handbook](../agents/README.md)
  - [Plans Index](./README.md)

## Codebase Context
- **Fluxo de deleção:** A página Projetos (`app/dashboard/projetos/page.tsx`) usa `deleteProject(name)` do `project-context`. Exclusão de um projeto: `confirmDelete` chama `deleteProject(deleteName)`. "Apagar todos": `confirmDeleteAll` itera `projectNames` e chama `deleteProject(name)` para cada um. Ambos dependem do mesmo `deleteProject` e do mesmo token.
- **Origem do token:** `deleteProject` chama `getAccessTokenForApi(session)` (session do `useAuth()`). Atualmente: (1) tenta `getSupabaseBrowser().auth.getSession()`, (2) fallback `session?.access_token` do AuthContext. **Causa raiz provável:** token nulo porque (a) sessão no cliente expirou ou não foi refresada, (b) `getSession()` retorna sessão em cache vazia, (c) AuthContext ainda não tem `session` no momento do clique (timing).
- **Envio à API:** `deleteProject` envia o token em **header** `Authorization: Bearer` e em **body** `{ accessToken }` (Content-Type: application/json). A API DELETE (`app/api/projects/route.ts`) lê body opcional `{ accessToken }` e repassa para `getUserIdFromRequest(request, body)`. Em `lib/api-auth.ts`, a ordem é: (1) cookies via createSupabaseServerClient, (2) header Authorization Bearer, (3) body.accessToken. Como o cliente usa localStorage (não cookies), a API depende de (2) ou (3).
- **Arquivos críticos:** `frontend/contexts/project-context.tsx` (getAccessTokenForApi, deleteProject), `frontend/app/api/projects/route.ts` (DELETE handler), `frontend/lib/api-auth.ts` (getUserIdFromRequest, getUserIdFromAccessToken), `frontend/contexts/auth-context.tsx` (session, refreshSession).

## Agent Lineup
| Agent | Role in this plan | Playbook | First responsibility focus |
| --- | --- | --- | --- |
| Bug Fixer | Reproduzir erro em "Excluir projeto" e "Apagar todos"; identificar onde o token se perde (obtenção, envio ou validação na API). | [Bug Fixer](../agents/bug-fixer.md) | Reproduzir, inspecionar Rede e sessão, confirmar deploy |
| Backend Specialist | Garantir que a API DELETE aceite e valide token por header e body; ordem cookies → Bearer → body.accessToken; getUserIdFromAccessToken robusto. | [Backend Specialist](../agents/backend-specialist.md) | Revisar api-auth.ts e rota DELETE |
| Frontend Specialist | Garantir token sempre obtido quando o usuário está logado: refresh da sessão antes de obter token, envio em header e body, fallback session do AuthContext; mensagem clara se token continuar nulo. | [Frontend Specialist](../agents/frontend-specialist.md) | Revisar project-context (getAccessTokenForApi, deleteProject) |

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
| Token nulo (sessão expirada ou não refresada) | Alta | Alto | Chamar refreshSession() antes de obter token; fallback session do AuthContext. | Frontend |
| API não recebe body em DELETE (proxy/CDN) | Baixa | Alto | Enviar token também no header; API já aceita body opcional. | Backend |
| Deploy em produção desatualizado | Média | Alto | Confirmar SHA do deploy; redeploy se necessário; hard refresh no browser. | Devops |

### Dependencies
- **Internal:** AuthContext expõe session e refreshSession; ProjectProvider usa useAuth() com session; rota DELETE lê body e repassa para getUserIdFromRequest.
- **External:** Supabase Auth (getSession, refreshSession); variáveis NEXT_PUBLIC_SUPABASE_* e chave anon no cliente.
- **Technical:** Next.js App Router; fetch com body em DELETE suportado; request.json() no handler DELETE.

### Assumptions
- O usuário está de fato logado na UI (vê projetos, abre modais). Se session estiver null no contexto, o token deve ser obtido via getSupabaseBrowser().auth.refreshSession() ou getSession().
- A API já aceita Authorization Bearer e body.accessToken. Se o erro persiste, a falha é (1) token não obtido no front, ou (2) token inválido/expirado na validação no servidor.

## Resource Estimation

### Time Allocation
| Phase | Estimated Effort | Calendar Time | Team Size |
| --- | --- | --- | --- |
| Phase 1 - Diagnosis | ~0.5 dia | 1 dia | 1 |
| Phase 2 - Implementation | ~0.5–1 dia | 1–2 dias | 1 |
| Phase 3 - Validation | ~0.25 dia | 1 dia | 1 |
| **Total** | **~1–1.5 dias** | **1–2 dias** | **1** |

### Required Skills
- React (context, hooks); Next.js API routes; Supabase Auth (getSession, refreshSession, setSession).

### Resource Availability
- **Available:** Desenvolvedor com acesso ao repo e deploy (Vercel).

## Working Phases
### Phase 1 — Diagnosis (causa raiz)
**Steps**
1. **Reproduzir:** Em produção, logar, ir em Projetos, (1) clicar em Excluir num projeto e confirmar; (2) clicar em "Apagar todos os projetos" e confirmar. Anotar em qual(is) cenário(s) aparece "Não autenticado".
2. **Rede (DevTools):** Na requisição DELETE para `/api/projects?name=...`, verificar: (a) header `Authorization: Bearer <token>` presente? (b) body com `{ "accessToken": "..." }` presente? Se ambos ausentes, o token não está sendo obtido no front (getAccessTokenForApi retorna null). Se um deles presente e a API ainda retorna 401, o token pode ser inválido/expirado no servidor.
3. **Deploy:** Confirmar que o branch em produção inclui: (1) API DELETE lendo body `{ accessToken }` e repassando para getUserIdFromRequest; (2) front deleteProject enviando token em header e body; (3) getAccessTokenForApi com refreshSession + getSession + fallback session. Comparar SHA do deploy com o commit mais recente do repo.
4. **Conclusão:** Documentar causa raiz (token não obtido / não enviado / não aceito) e definir correção na Phase 2.

**Commit Checkpoint**
- `chore(plan): phase 1 diagnosis auth deleção projetos`.

### Phase 2 — Implementation (correção definitiva)
**Steps**
1. **Frontend — obter token de forma robusta:** Em `getAccessTokenForApi`: (1) chamar `getSupabaseBrowser().auth.refreshSession()` para obter sessão fresca; (2) se retornar session?.access_token, usar; (3) senão, chamar `getSession()` e usar; (4) fallback `sessionFromAuth?.access_token`. Assim o token é sempre o mais atual possível antes de cada DELETE (single ou "Apagar todos").
2. **Frontend — envio:** Manter envio do token em **header** `Authorization: Bearer` e em **body** `{ accessToken }` (Content-Type: application/json) em todo deleteProject. Garantir que, quando token for null, a mensagem de erro sugira "Faça logout e login novamente" (opcional).
3. **Backend:** Garantir que DELETE lê body opcional `{ accessToken }` e repassa para getUserIdFromRequest(request, body). Ordem em getUserIdFromRequest: cookies → header Bearer → body.accessToken. Manter getUserIdFromAccessToken para validar o token no servidor.
4. **Deploy:** Commit, push e deploy na Vercel; confirmar que a URL de produção serve o build mais recente.

**Commit Checkpoint**
- `fix(auth): refresh sessão antes de obter token na deleção de projetos` (e demais commits do fix).

### Phase 3 — Validation & Handoff
**Steps**
1. **Teste manual — exclusão de um projeto:** Em produção, logar, excluir um projeto (confirmar no modal). Verificar que o modal fecha sem "Não autenticado" e que o projeto some da lista.
2. **Teste manual — Apagar todos:** Em produção, criar 2+ projetos se necessário, clicar em "Apagar todos os projetos", confirmar. Verificar que o modal fecha sem "Não autenticado" e que todos os projetos são removidos.
3. **Regressão:** Criar projeto, editar projeto, listar projetos — garantir que nada quebrou.
4. **Documentação:** Atualizar este plano com status "completed" e anotar evidência (ex.: "Exclusão single e Apagar todos validados em produção em DD/MM/AAAA").

**Commit Checkpoint**
- `chore(plan): phase 3 validation auth deleção projetos — completed`.

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
- Action: Revertir commits do fix de auth (getAccessTokenForApi com refreshSession, body no DELETE); push; redeploy da versão anterior na Vercel.
- Data Impact: Nenhum (apenas código).
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

- **Evidência:** (1) Exclusão de um projeto em produção sem "Não autenticado"; (2) "Apagar todos os projetos" em produção sem "Não autenticado". Opcional: captura da aba Rede mostrando header Authorization e/ou body accessToken na requisição DELETE.
- **Arquivos principais:** `frontend/contexts/project-context.tsx` (getAccessTokenForApi com refreshSession, deleteProject), `frontend/app/api/projects/route.ts` (DELETE com body), `frontend/lib/api-auth.ts` (getUserIdFromRequest).
- **Follow-up:** Se o erro persistir após refreshSession + header + body: (1) verificar se refreshSession retorna erro (ex.: refresh_token inválido); (2) considerar migrar o cliente browser para Supabase SSR (createBrowserClient + cookies + middleware) para que a API leia a sessão por cookies; (3) adicionar log temporário (ex.: console.log do token antes do fetch) apenas em dev para confirmar se o token está sendo obtido.
