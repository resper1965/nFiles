# Automação PREVC — executar todas as etapas/épicos com ai-context

Este documento descreve como executar **todas as etapas de um épico** respeitando o ciclo **PREVC** (Plan → Review → Execute → Validate → Close) usando as ferramentas do **ai-context** (MCP no Cursor).

---

## Visão do ciclo PREVC

| Fase | Nome       | Objetivo principal |
|------|------------|----------------------|
| **P** | Planning  | Alinhar escopo, decisões de design e documentação |
| **R** | Review    | Revisar artefatos da fase P (arquitetura, segurança, qualidade) |
| **E** | Execute   | Implementar conforme plano e decisões aprovadas |
| **V** | Validate  | Testes, revisão de código, validação de requisitos |
| **C** | Close     | Documentação final, commit de fase, encerramento |

**Escala do workflow** (define quais fases rodam):

- **QUICK:** E → V
- **SMALL:** P → E → V
- **MEDIUM:** P → R → E → V
- **LARGE:** P → R → E → V → C (completo)

---

## Ferramentas ai-context (MCP) usadas

Todas são invocadas via MCP **user-ai-context** no Cursor:

| Ferramenta | Uso na automação |
|------------|-------------------|
| `workflow-init` | Iniciar workflow para um épico (nome, descrição, scale, require_plan) |
| `workflow-advance` | Avançar para a próxima fase (outputs = artefatos da fase atual; force se necessário) |
| `workflow-status` | Consultar fase atual, gates e planos linkados |
| `plan` (link, updatePhase, getStatus, …) | Vincular plano ao workflow, atualizar status das fases do plano |
| `agent` (getSequence, orchestrate) | Obter sequência de agentes por fase e orquestrar execução |
| `workflow-manage` (approvePlan, getGates) | Aprovar plano (gate R→E), consultar gates |

---

## Sequência da automação (épico completo LARGE)

### 0. Pré-requisitos

- Plano existente em `.context/plans/<slug>.md` (ex.: `proximos-passos-fluxo-usuario`).
- Opcional: `context` init e `scaffoldPlan` / `fillSingle` já executados para o plano.

### 1. Iniciar workflow (uma vez por épico)

**Ferramenta:** `workflow-init`

**Parâmetros sugeridos (LARGE, com plano):**

- `name`: nome do épico (ex.: `proximos-passos-fluxo-usuario`)
- `description`: descrição curta do que será feito
- `scale`: `LARGE` (ou MEDIUM/SMALL/QUICK)
- `require_plan`: `true`
- `archive_previous`: `true` (para arquivar workflow anterior)

**Em seguida:** vincular o plano ao workflow.

**Ferramenta:** `plan` com `action: "link"`, `planSlug`: slug do plano (ex.: `proximos-passos-fluxo-usuario`).

---

### 2. Fase P (Planning)

**Objetivo:** Produzir decisões de design, documentação e alinhamento (architecture, docs, impacto em UI).

1. **Obter agentes da fase P:**  
   `agent` com `action: "getSequence"`, `phases: ["P"]` (ou `orchestrate` com `phase: "P"`).

2. **Executar** conforme os agentes retornados (ex.: architect-specialist, documentation-writer, frontend-specialist):
   - Decisões em `.context/docs/architecture.md` (e docs referenciados no plano).
   - Atualizar `.context/docs/README.md` e `.context/docs/dinamica-da-aplicacao.md` se aplicável.

3. **Marcar fase do plano como concluída:**  
   `plan` com `action: "updatePhase"`, `planSlug`, `phaseId: "phase-1"` (ou o id da fase P no plano), `status: "completed"`.

4. **Avançar para R:**  
   `workflow-advance` com `outputs: [".context/docs/architecture.md", ".context/docs/README.md", ".context/docs/dinamica-da-aplicacao.md"]`.  
   Se o gate exigir plano linkado e já tiver linkado, não é necessário `force`. Caso contrário, usar `force: true` conforme necessidade.

---

### 3. Fase R (Review)

**Objetivo:** Revisar artefatos da fase P (consistência, qualidade, segurança).

1. **Obter agentes da fase R:**  
   `agent` com `action: "getSequence"`, `phases: ["R"]` (ou `orchestrate` com `phase: "R"`).

2. **Executar** revisão com os agentes (ex.: architect-specialist, code-reviewer, security-auditor):
   - Gerar artefato de revisão, ex.: `.context/workflow/review-phase-r.md`, com aprovações e requisitos (ex.: validação de path nas API routes).

3. **Aprovar plano (para desbloquear R→E):**  
   `workflow-manage` com `action: "approvePlan"`, `planSlug` (e opcionalmente `approver`, `notes`).

4. **Avançar para E:**  
   `workflow-advance` com `outputs: [".context/workflow/review-phase-r.md"]` (e outros artefatos da revisão). Usar `force: true` se o gate de aprovação não estiver disponível ou já tiver sido tratado manualmente.

---

### 4. Fase E (Execute)

**Objetivo:** Implementar as tarefas do plano (código, APIs, UI).

1. **Obter agentes da fase E:**  
   `agent` com `action: "getSequence"`, `phases: ["E"]` (ou `orchestrate` com `phase: "E"`).

2. **Executar** em ordem lógica (ex.: por passos do plano):
   - Para cada passo/épico menor: implementar, commit incremental sugerido pelo skill commit-message.
   - Atualizar `plan` com `updateStep` ou `updatePhase` conforme o plano (ex.: phase-2 em progresso → completed).

3. **Artefatos:** código no repositório (frontend, API routes, etc.).

4. **Avançar para V:**  
   `workflow-advance` com `outputs` listando paths relevantes (ex.: arquivos principais alterados ou `.context/docs/` atualizados).

---

### 5. Fase V (Validate)

**Objetivo:** Testes, revisão de código, validação de requisitos e segurança.

1. **Obter agentes da fase V:**  
   `agent` com `action: "getSequence"`, `phases: ["V"]`.

2. **Executar:** testes (test-writer), code review (code-reviewer), security audit (security-auditor) conforme skills e plano.

3. **Correções** se necessário; depois marcar fase do plano (ex.: phase-3) como concluída.

4. **Avançar para C:**  
   `workflow-advance` com `outputs` dos artefatos de validação (ex.: relatório de testes ou doc de validação).

---

### 6. Fase C (Close)

**Objetivo:** Documentação final, commit de fase, encerramento do workflow.

1. **Obter agentes da fase C:**  
   `agent` com `action: "getSequence"`, `phases: ["C"]`.

2. **Executar:** atualizar documentação (dinâmica-da-aplicacao, changelog), commit final com skill commit-message.

3. **Opcional:** `plan` com `action: "commitPhase"` para registrar conclusão da última fase.

4. **Workflow encerrado:** não há “advance” após C; o status em `.context/workflow/status.yaml` refletirá a conclusão.

---

## Consultar status a qualquer momento

**Ferramenta:** `workflow-status` (sem parâmetros).

Retorna: fase atual, status de cada fase PREVC, gates, planos linkados. Use para decidir qual etapa executar em seguida.

---

## Resumo das chamadas por fase

| Fase | Ações principais |
|------|-------------------|
| **Início** | `workflow-init` → `plan link` |
| **P** | `agent getSequence ["P"]` → executar agentes P → `plan updatePhase` → `workflow-advance` (outputs docs) |
| **R** | `agent getSequence ["R"]` → revisar → `workflow-manage approvePlan` → `workflow-advance` |
| **E** | `agent getSequence ["E"]` → implementar passos do plano → `workflow-advance` |
| **V** | `agent getSequence ["V"]` → validar → `workflow-advance` |
| **C** | `agent getSequence ["C"]` → documentar/fechar |

---

## Referências

- [Workflow README](./README.md) — init e uso geral.
- [Plans README](../plans/README.md) — criação e preenchimento de planos.
- [Skills README](../skills/README.md) — mapeamento PREVC ↔ skills.
- [Actions](./actions.jsonl) — histórico de ações do workflow (apenas leitura/append).
