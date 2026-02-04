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

# Usar IA na aplicação n.files Plan

> Integrar IA (ex.: Gemini) na aplicação n.files: sugestões de nomes, regras ou assistência; API no servidor com GEMINI_API_KEY; fluxos na ingestão, regras e preview.

## Task Snapshot
- **Primary goal:** Integrar **IA** (ex.: Gemini / Google AI) na aplicação n.files para: (1) **sugestões de nomes** a partir de conteúdo ou metadados do arquivo; (2) **sugestões de regras** de renomeação (ex.: a partir de exemplos ou do padrão do seed); (3) **assistência** na descrição do conteúdo ou na definição de regras. A chave (`GEMINI_API_KEY`) fica **apenas no servidor** (API route / Serverless); o frontend chama uma API interna que por sua vez chama o Gemini.
- **Success signal:** Usuário consegue obter sugestões de nome ou de regra via UI (ex.: botão "Sugerir com IA" na ingestão ou no editor de regras); respostas vêm da API do projeto; a chave nunca é exposta no cliente.
- **Key references:**
  - [Documentation Index](../docs/README.md), [Tooling (Gemini env)](../docs/tooling.md), [Security](../docs/security.md)
  - [Regras sugeridas pelo seed](../docs/regras-sugeridas-seed.md) — contexto opcional para prompts de regras
  - [Plans Index](./README.md)

## Codebase Context
- **Projeto:** n.files (ness) — ingestão (lote/único), regras de renomeação (melhores práticas + ingerência do usuário), file manager, preview. Stack: Next.js (Vercel), Supabase (Auth + Storage).
- **IA já documentada:** `GEMINI_API_KEY` em `.env.example` e `tooling.md`; uso apenas no servidor; nunca `NEXT_PUBLIC_` para a chave.
- **Pontos de integração:** (1) Tela de ingestão — sugerir nome com base em arquivo/metadados; (2) Editor de regras — sugerir regra ou descrição; (3) Preview — assistência opcional na descrição do conteúdo.

## Agent Lineup (foco neste plano)
| Agent | Role in this plan | Playbook |
| --- | --- | --- |
| **Backend Specialist** | Desenhar e implementar **API route** (Next.js) que recebe payload do frontend e chama Gemini; garantir que `GEMINI_API_KEY` seja lida só no servidor. | [Backend Specialist](../agents/backend-specialist.md) |
| **Frontend Specialist** | Integrar chamadas à API de IA na UI: botão/fluxo "Sugerir com IA" na ingestão e/ou no editor de regras; exibir sugestões e permitir aplicar ou editar. | [Frontend Specialist](../agents/frontend-specialist.md) |
| **Architect Specialist** | Definir **contrato da API** (entrada/saída), onde a IA entra no fluxo (ingestão, regras, preview) e como o contexto (ex.: regras-sugeridas-seed) é passado ao prompt. | [Architect Specialist](../agents/architect-specialist.md) |
| **Security Auditor** | Garantir que a chave Gemini **nunca** vá para o cliente; revisar que a API route valide sessão (Supabase Auth) se necessário. | [Security Auditor](../agents/security-auditor.md) |
| **Documentation Writer** | Atualizar `tooling.md` / docs com uso da API de IA e exemplos de prompts; documentar variável `GEMINI_API_KEY`. | [Documentation Writer](../agents/documentation-writer.md) |
| Code Reviewer | Revisar PRs da API e do frontend de IA. | [Code Reviewer](../agents/code-reviewer.md) |
| Test Writer | Testes da API route (mock do Gemini) e fluxo de sugestão quando aplicável. | [Test Writer](../agents/test-writer.md) |

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
| Exposição da chave Gemini no cliente | Média | Alto | API route no servidor apenas; `GEMINI_API_KEY` só em env do servidor (Vercel); nunca `NEXT_PUBLIC_GEMINI_API_KEY`. |
| Rate limit / custo da API Gemini | Média | Médio | Throttle por usuário/sessão; feature opcional; considerar cache de sugestões quando fizer sentido. |
| Resposta da IA inadequada (nome inválido no Windows, etc.) | Média | Médio | Validar saída da IA no backend (caracteres, tamanho); aplicar mesmas regras do motor de regras; usuário pode editar sugestão. |

### Dependencies
- **Internal:** Frontend (tela de ingestão, editor de regras); motor de regras (validação do nome sugerido); opcional: `regras-sugeridas-seed.md` como contexto para prompts.
- **External:** **Google AI (Gemini)** — API para geração de texto; chave em [Google AI Studio](https://aistudio.google.com/) ou equivalente.
- **Technical:** `GEMINI_API_KEY` configurada na Vercel (e em `.env.local` em dev); Next.js API route ou Serverless Function; SDK ou fetch para Gemini API.

### Assumptions
- Usar **Gemini** como provedor de IA; trocar por outro provedor depois é possível abstraindo a chamada em um serviço.
- A IA é **assistência** (sugestão); o usuário pode aceitar, editar ou ignorar; a aplicação de regras e renomeação continua sob controle do motor de regras e da ingerência do usuário.

## Resource Estimation

### Time Allocation
| Phase | Estimated Effort | Calendar Time | Team Size |
| --- | --- | --- | --- |
| Phase 1 - Discovery | 1 person-day | 1-2 days | 1 |
| Phase 2 - Implementation | 3-5 person-days | 3-7 days | 1-2 |
| Phase 3 - Validation | 1 person-day | 1-2 days | 1 |
| **Total** | **5-7 person-days** | **~1-2 weeks** | **-** |

### Required Skills
- Next.js API routes (ou Serverless); integração com Gemini API (REST ou SDK).
- Frontend: chamada à API interna, UI para "Sugerir com IA" e exibição de sugestões.
- Validação de nomes (Windows) e alinhamento com regras do motor.

### Resource Availability
- **Available:** A definir. **Escalation:** A definir.

## Working Phases
### Phase 1 — Discovery & Alignment
**Steps**
1. **Definir casos de uso da IA:** (a) Sugerir **nome** a partir de nome atual + metadados/conteúdo do arquivo (ex.: tipo MIME, nome original); (b) Sugerir **regra** ou template a partir de exemplos ou do padrão em `regras-sugeridas-seed.md`; (c) Assistência na **descrição do conteúdo** para preencher campo na regra ou no preview.
2. **Contrato da API:** método HTTP (POST), body (ex.: `{ type: "suggest-name" | "suggest-rule" | "describe", payload: { ... } }`), resposta (texto ou objeto com sugestão); tratamento de erro e timeout.
3. **Segurança:** API route exige sessão (Supabase Auth) ou é pública com throttle; `GEMINI_API_KEY` lida apenas no servidor; nenhum dado sensível enviado ao Gemini além do necessário (ex.: metadados do arquivo, não o binário inteiro se for grande).
4. **Documentar** decisões em `.context/docs/` (ex.: novo doc `ai-integration.md` ou seção em `architecture.md`) e referenciar este plano.

**Commit Checkpoint**
- `git commit -m "chore(plan): complete phase 1 discovery — AI use cases and API contract"`

### Phase 2 — Implementation & Iteration
**Steps**
1. **API route (Next.js):** criar rota (ex.: `app/api/ai/suggest/route.ts`) que: lê `GEMINI_API_KEY` de `process.env`; recebe body (tipo + payload); monta prompt conforme tipo (suggest-name, suggest-rule, describe); chama Gemini API (REST ou SDK); valida e sanitiza resposta (ex.: nome válido para Windows); retorna JSON. Tratar erros e timeout.
2. **Prompts:** definir prompts (e opcionalmente system prompt) para cada tipo; incluir contexto das regras sugeridas pelo seed quando for suggest-rule; instruir a IA a devolver nomes compatíveis com Windows (sem caracteres inválidos, tamanho razoável).
3. **Frontend:** em ingestão e/ou editor de regras, adicionar botão ou ação "Sugerir com IA"; chamar `fetch('/api/ai/suggest', { method: 'POST', body: ... })`; exibir sugestão e permitir aplicar ou editar antes de usar.
4. **Validação:** após receber sugestão da IA, aplicar mesma validação do motor de regras (caracteres, duplicados) antes de mostrar ao usuário; se inválida, exibir mensagem ou pedir nova sugestão.
5. **Opcional:** throttle por usuário (ex.: rate limit por sessão) para evitar abuso e custo.

**Commit Checkpoint**
- `git commit -m "chore(plan): complete phase 2 implementation — AI suggest API and frontend integration"`

### Phase 3 — Validation & Handoff
**Steps**
1. **Testes:** verificar que a API route não expõe `GEMINI_API_KEY`; testar com mock do Gemini se possível; testar fluxo "Sugerir com IA" na UI (ingestão e/ou regras); validar que nomes sugeridos passam pela validação Windows.
2. **Documentação:** atualizar `tooling.md` e, se criado, `ai-integration.md` com: uso da API, variável `GEMINI_API_KEY`, exemplos de payload/resposta; referenciar este plano.
3. **Evidência:** capturar exemplo de request/response (sem chave); anotar limites de uso (rate limit, tamanho de payload) para operação.

**Commit Checkpoint**
- `git commit -m "chore(plan): complete phase 3 validation — AI integration ready"`

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
- Action: Revert commits da API route e do frontend de IA; remover rota `api/ai/suggest` e botões "Sugerir com IA".
- Data Impact: Nenhum (IA não persiste dados no nosso backend).
- Estimated Time: < 1 hour

#### Phase 3 Rollback
- Action: Idem Phase 2; documentar motivo.
- Data Impact: Nenhum.
- Estimated Time: < 1 hour

### Post-Rollback Actions
1. Document reason for rollback in incident report
2. Notify stakeholders of rollback and impact
3. Schedule post-mortem to analyze failure
4. Update plan with lessons learned before retry

## Evidence & Follow-up

- **Artifacts:** PR(s) da API de IA e do frontend; exemplo de request/response (sem chave); doc de uso da API e env (`GEMINI_API_KEY`); este plano com status das fases.
- **Follow-up:** Considerar cache de sugestões; ajustar prompts com feedback de uso; avaliar outros provedores de IA se necessário.
