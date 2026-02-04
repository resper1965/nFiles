# Executar um épico PREVC — guia operacional (ai-context)

Checklist para o **agente (Cursor)** executar todas as etapas de um épico respeitando PREVC, usando as ferramentas MCP **user-ai-context**.

---

## Uso

1. **Novo épico:** siga a seção "Iniciar um épico do zero".
2. **Épico em andamento:** chame `workflow-status` e continue a partir da fase indicada na seção correspondente (P, R, E, V ou C).

---

## 0. Consultar status atual

**Sempre que for continuar o workflow:**

| Ferramenta MCP | Parâmetros |
|----------------|------------|
| `workflow-status` | (nenhum) |

Interpretar: `current_phase` = próxima fase a executar; `phases` = status de cada fase (filled, in_progress, completed, pending).

---

## 1. Iniciar um épico do zero

**Quando:** novo épico/feature que terá plano e ciclo PREVC completo.

| # | Ferramenta | Parâmetros |
|---|------------|------------|
| 1.1 | `workflow-init` | `name`: slug do épico (ex. `proximos-passos-fluxo-usuario`), `description`: descrição curta, `scale`: `LARGE` \| `MEDIUM` \| `SMALL` \| `QUICK`, `require_plan`: true, `archive_previous`: true |
| 1.2 | `plan` | `action`: `"link"`, `planSlug`: slug do plano (ex. `proximos-passos-fluxo-usuario`) |

**Pré-requisito:** plano já existe em `.context/plans/<planSlug>.md`. Se não existir: usar `context` (scaffoldPlan, fillSingle) conforme a ferramenta context do ai-context.

---

## 2. Fase P (Planning)

**Quando:** `workflow-status` indica fase P ou acabou de iniciar o workflow.

| # | Ação | Ferramenta / passo |
|---|------|--------------------|
| 2.1 | Obter agentes | `agent` → `action`: `"getSequence"`, `phases`: `["P"]` |
| 2.2 | Executar agentes P | Seguir os agentes retornados: architect-specialist (decisões em architecture.md), documentation-writer (atualizar docs), frontend-specialist (impacto UI), etc. |
| 2.3 | Marcar fase do plano | `plan` → `action`: `"updatePhase"`, `planSlug`, `phaseId`: `"phase-1"` (ou o id da fase P no plano), `status`: `"completed"` |
| 2.4 | Avançar para R | `workflow-advance` → `outputs`: lista de paths dos artefatos (ex. `[".context/docs/architecture.md", ".context/docs/README.md", ".context/docs/dinamica-da-aplicacao.md"]`). Se gate bloquear: `force`: true |

---

## 3. Fase R (Review)

**Quando:** `workflow-status` indica fase R.

| # | Ação | Ferramenta / passo |
|---|------|--------------------|
| 3.1 | Obter agentes | `agent` → `action`: `"getSequence"`, `phases`: `["R"]` |
| 3.2 | Executar revisão | architect-specialist (consistência), code-reviewer (documentação), security-auditor (requisitos de segurança). Gerar `.context/workflow/review-phase-r.md` com conclusão (aprovado / aprovado com condições). |
| 3.3 | Aprovar plano (gate R→E) | `workflow-manage` → `action`: `"approvePlan"`, `planSlug` (e opcionalmente `approver`, `notes`) |
| 3.4 | Avançar para E | `workflow-advance` → `outputs`: `[".context/workflow/review-phase-r.md"]` (e outros). Usar `force`: true se o gate não exigir aprovação explícita no MCP. |

---

## 4. Fase E (Execute)

**Quando:** `workflow-status` indica fase E.

| # | Ação | Ferramenta / passo |
|---|------|--------------------|
| 4.1 | Obter agentes | `agent` → `action`: `"getSequence"`, `phases`: `["E"]` |
| 4.2 | Implementar passos do plano | Para cada passo/épico menor do plano: implementar código/APIs/UI; opcional: `plan` → `updateStep` ou `updatePhase` (phase-2 in_progress → completed). |
| 4.3 | Commits incrementais | Usar skill commit-message (phases E, C) para mensagens de commit. |
| 4.4 | Avançar para V | `workflow-advance` → `outputs`: paths dos artefatos principais (ex. arquivos do frontend ou `.context/docs/` atualizados). |

---

## 5. Fase V (Validate)

**Quando:** `workflow-status` indica fase V.

| # | Ação | Ferramenta / passo |
|---|------|--------------------|
| 5.1 | Obter agentes | `agent` → `action`: `"getSequence"`, `phases`: `["V"]` |
| 5.2 | Validar | test-writer (testes), code-reviewer (qualidade), security-auditor (segurança). Corrigir se necessário. |
| 5.3 | Marcar fase do plano | `plan` → `action`: `"updatePhase"`, `planSlug`, `phaseId`: da fase V no plano (ex. `phase-3`), `status`: `"completed"` |
| 5.4 | Avançar para C | `workflow-advance` → `outputs`: artefatos de validação (ex. relatório de testes ou doc). |

---

## 6. Fase C (Close)

**Quando:** `workflow-status` indica fase C.

| # | Ação | Ferramenta / passo |
|---|------|--------------------|
| 6.1 | Obter agentes | `agent` → `action`: `"getSequence"`, `phases`: `["C"]` |
| 6.2 | Fechar | documentation-writer (atualizar dinâmica-da-aplicacao, changelog); commit final com commit-message. |
| 6.3 | Opcional | `plan` → `action`: `"commitPhase"`, `planSlug`, `phaseId` da última fase. |
| 6.4 | Fim | Não há advance após C; workflow concluído. |

---

## Épico atual: proximos-passos-fluxo-usuario

**Plano:** `.context/plans/proximos-passos-fluxo-usuario.md`  
**Fases do plano:** phase-1 (P), phase-2 (E), phase-3 (V).

**Passos do plano (fase E):**

1. Árvore + seleção  
2. Regra + IA (metadados/conteúdo)  
3. Cópia em massa  
4. Download ZIP + índices  
5. UI pós-lote  
6. Documentação  

**Status típico:** após fase R concluída, a automação deve seguir na ordem: E (implementar os 6 passos) → V (validar) → C (documentar e fechar).

Para **retomar** este épico: chamar `workflow-status` e executar a seção da fase retornada (2 a 6 acima).

---

## Referências

- [Automação PREVC (runbook)](./automation-prevc.md) — descrição detalhada das fases e ferramentas.
- [Workflow README](./README.md) — init e contexto do projeto.
