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

# Próximos passos do fluxo do usuário — árvore, regra+IA, cópia, ZIP, documentação Plan

> Plano que detalha os 6 próximos passos do fluxo de renomeação (fluxo-usuario-renomeacao.md): (1) Árvore + seleção — listar Storage por pastas e exibir como árvore por projeto; permitir selecionar arquivos/pastas para o lote; preview só com itens selecionados. (2) Regra + IA com metadados/conteúdo — definir metadados (created_at, content-type); extração de conteúdo (PDF, DOCX) em API/Edge; IA recebe metadados e trecho de conteúdo para sugerir/validar nome. (3) Cópia em massa com nome correto — implementar cópia no Storage (não só move); definir destino (pasta Renomeados, estrutura por data); batch com feedback. (4) Download ZIP + documentação de índices — exportar resultado em ZIP; índice (CSV/JSON) com nome original → novo, caminho, data; dentro do ZIP ou separado. (5) Uso no repositório — UI explícita: continuar no file manager após lote; opção Baixar ZIP vs Continuar no repositório. (6) Documentação — atualizar dinâmica-da-aplicacao.md; registrar decisões (cópia vs move, destino, formato índice, metadados/conteúdo).

## Task Snapshot
- **Primary goal:** Implementar os 6 próximos passos do fluxo de renomeação (árvore + seleção, regra + IA com metadados/conteúdo, cópia em massa, download ZIP + índices, uso no repositório, documentação) conforme [fluxo-usuario-renomeacao.md](./fluxo-usuario-renomeacao.md).
- **Success signal:** Usuário consegue (1) ver árvore por projeto e selecionar itens para o lote; (2) usar regra validada por IA com metadados/conteúdo; (3) copiar em massa com nome correto; (4) baixar ZIP com índice; (5) continuar no file manager após lote; (6) docs atualizados.
- **Key references:**
  - [Fluxo do usuário — renomeação e reorganização](./fluxo-usuario-renomeacao.md)
  - [Documentation Index](../docs/README.md)
  - [Dinâmica da aplicação](../docs/dinamica-da-aplicacao.md)
  - [Plans Index](./README.md)

## Codebase Context
- **Stack:** Next.js 16 (frontend), React 19, TypeScript, Supabase (Auth + Storage), Vercel.
- **APIs relevantes:** `listFiles`, `listProjectNames`, `createProject`, `uploadFile`, `renameFile` em `frontend/lib/storage.ts`; paths `userId/<projectName>/`. `ProjectProvider` e `useProject` em `frontend/contexts/project-context.tsx`. Preview e regras em `frontend/components/preview-renames.tsx`, `frontend/lib/patterns.ts`. IA em `frontend/app/api/ai/suggest/route.ts`.
- **Pré-requisito já feito:** Projeto (nome = pasta raiz) implementado; ingestão e file manager atuam por projeto.

## Agent Lineup
| Agent | Role in this plan | Playbook | First responsibility focus |
| --- | --- | --- | --- |
| Code Reviewer | Revisar mudanças nas API routes (copy-batch, export/zip) e componentes (Preview, modal). | [Code Reviewer](../agents/code-reviewer.md) | Review code changes for quality, style, and best practices |
| Bug Fixer | Analisar erros de cópia/ZIP e falhas no fluxo pós-lote. | [Bug Fixer](../agents/bug-fixer.md) | Analyze bug reports and error messages |
| Feature Developer | Implementar cópia em massa, ZIP e modal conforme especificação. | [Feature Developer](../agents/feature-developer.md) | Implement new features according to specifications |
| Refactoring Specialist | Identificar duplicação (ex.: validação de path) e centralizar em api-auth. | [Refactoring Specialist](../agents/refactoring-specialist.md) | Identify code smells and improvement opportunities |
| Test Writer | Testes para listAllFilesUnderPrefix, expandSelectionToFiles, /api/content/extract, copy-batch, export/zip. | [Test Writer](../agents/test-writer.md) | Write comprehensive unit and integration tests |
| Documentation Writer | Atualizar dinâmica-da-aplicacao.md, CHANGELOG e architecture. | [Documentation Writer](../agents/documentation-writer.md) | Create clear, comprehensive documentation |
| Performance Optimizer | Avaliar batch grande na cópia e no ZIP (streaming se necessário). | [Performance Optimizer](../agents/performance-optimizer.md) | Identify performance bottlenecks |
| Security Auditor | Validar sessão e path traversal em copy-batch e export/zip. | [Security Auditor](../agents/security-auditor.md) | Identify security vulnerabilities |
| Backend Specialist | Desenhar e implementar copy-batch e export/zip (Storage, archiver). | [Backend Specialist](../agents/backend-specialist.md) | Design and implement server-side architecture |
| Frontend Specialist | UI do botão Copiar, modal pós-lote e Baixar ZIP. | [Frontend Specialist](../agents/frontend-specialist.md) | Design and implement user interfaces |
| Architect Specialist | Decisões: cópia vs move, destino Renomeados, formato índice CSV. | [Architect Specialist](../agents/architect-specialist.md) | Design overall system architecture and patterns |
| Devops Specialist | N/A para este plano (CI já existente). | [Devops Specialist](../agents/devops-specialist.md) | Design and maintain CI/CD pipelines |
| Database Specialist | N/A (Storage apenas). | [Database Specialist](../agents/database-specialist.md) | Design and optimize database schemas |
| Mobile Specialist | N/A (web only). | [Mobile Specialist](../agents/mobile-specialist.md) | Develop native and cross-platform mobile applications |

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
| Supabase Storage indisponível | Low | High | Retry e mensagem clara ao usuário; falhas por arquivo em copy-batch | Backend |
| Insufficient test coverage | Low | Medium | Testes unitários para api-auth, copy-batch, export/zip; E2E opcional | Test Writer |

### Dependencies
- **Internal:** File manager e Preview já implementados (passos 1–2); ProjectContext e AuthContext.
- **External:** Supabase (Auth + Storage); Vercel para deploy.
- **Technical:** Next.js 16, archiver para ZIP no servidor; SUPABASE_SERVICE_ROLE_KEY para download/upload em APIs.

### Assumptions
- Paths no preview são relativos ao projeto (fromPath = nome ou subpasta/nome). API valida prefixo userId/projectName.
- Bucket `files` existe e RLS permite acesso por auth.uid(); service role usado apenas após validação de path no backend.
- Se assumirmos paths inválidos: API retorna 403; frontend exibe erro no modal ou na mensagem de cópia.

## Resource Estimation

### Time Allocation
| Phase | Estimated Effort | Calendar Time | Team Size |
| --- | --- | --- | --- |
| Phase 1 - Discovery | 1 person-day | 1-2 days | 1 |
| Phase 2 - Implementation | 3-4 person-days | 1 week | 1-2 |
| Phase 3 - Validation | 1 person-day | 1-2 days | 1 |
| **Total** | **5-6 person-days** | **~1-2 weeks** | **-** |

### Required Skills
- Next.js API routes, Supabase Storage, React (estado e callbacks).
- Conhecimento de validação de path e sessão em APIs.

### Resource Availability
- **Available:** Desenvolvimento concluído em 2026-02-04 (passos 3–6).
- **Escalation:** N/A.

## Próximos passos (6) — ordem de implementação

| # | Passo | Descrição resumida |
|---|-------|--------------------|
| 1 | **Árvore + seleção** | Listar Storage por pastas (por projeto); exibir como árvore; selecionar arquivos/pastas para o lote; preview só com itens selecionados. |
| 2 | **Regra + IA (metadados/conteúdo)** | Metadados (created_at, content-type); extração de conteúdo (PDF, DOCX) em API/Edge; IA recebe metadados e trecho para sugerir/validar nome. |
| 3 | **Cópia em massa** | Implementar cópia no Storage (não só move); destino configurável (ex.: pasta Renomeados); batch com feedback. |
| 4 | **Download ZIP + índices** | Exportar resultado em ZIP; documento de índices (CSV/JSON) nome original → novo, caminho, data; dentro do ZIP ou separado. |
| 5 | **Uso no repositório** | UI explícita: após lote, opção "Baixar ZIP com índices" vs "Continuar no repositório" (file manager). |
| 6 | **Documentação** | Atualizar dinâmica-da-aplicacao.md; registrar decisões (cópia vs move, destino, formato índice, metadados/conteúdo). |

## Working Phases
### Phase 1 — Discovery & Alignment
**Steps**
1. Alinhar com [fluxo-usuario-renomeacao.md](./fluxo-usuario-renomeacao.md): confirmar ordem dos 6 passos e critérios de aceite.
2. Definir formato da árvore (list recursivo no Storage? delimiter?); formato do índice (CSV vs JSON); destino padrão da cópia.

**Commit Checkpoint**
- `git commit -m "chore(plan): complete phase 1 discovery — proximos-passos-fluxo-usuario"`

### Phase 2 — Implementation & Iteration
**Steps (um por próximo passo)**
1. **Árvore + seleção:** Estender listFiles/Storage para listagem recursiva ou por prefixo; componente de árvore no File system; estado de seleção; preview só com selecionados.
2. **Regra + IA:** API route ou Edge para extrair metadados/conteúdo (PDF, DOCX); estender api/ai/suggest para metadados e trecho; validação de nome pela IA.
3. **Cópia em massa:** Função copyFile no Storage; destino configurável; batch com feedback (progress/erro).
4. **Download ZIP + índices:** Montar ZIP a partir dos paths do resultado; gerar indice.csv ou manifesto.json; incluir no ZIP ou retornar junto.
5. **Uso no repositório:** Tela/modal pós-lote com "Baixar ZIP com índices" e "Continuar no file manager".
6. **Documentação:** Atualizar dinamica-da-aplicacao.md; registrar decisões em fluxo-usuario-renomeacao ou ADR.

**Commit Checkpoint**
- Após cada passo: commit incremental. Ao final: `chore(plan): complete phase 2 implementation — 6 passos`.

### Phase 3 — Validation & Handoff
**Steps**
1. Testar fluxo completo: projeto → árvore → seleção → regra + IA → cópia → download ZIP; verificar índice no ZIP.
2. Revisar documentação; rodar build e testes (Vitest).

**Commit Checkpoint**
- `git commit -m "chore(plan): complete phase 3 validation — proximos-passos-fluxo-usuario"`

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
- Action: Revert commits das API routes (copy-batch, export/zip) e do frontend (botão Copiar, PostBatchModal); remover lib/api-auth se não usado em outras rotas.
- Data Impact: Nenhum (Storage não é migrado; pasta Renomeados pode permanecer).
- Estimated Time: 1-2 hours

#### Phase 3 Rollback
- Action: Rollback de deploy (Vercel); restaurar versão anterior do frontend e APIs.
- Data Impact: Nenhum.
- Estimated Time: ~1 hour

### Post-Rollback Actions
1. Document reason for rollback in incident report
2. Notify stakeholders of rollback and impact
3. Schedule post-mortem to analyze failure
4. Update plan with lessons learned before retry

## Evidence & Follow-up

List artifacts to collect (logs, PR links, test runs, design notes). Record follow-up actions or owners.
