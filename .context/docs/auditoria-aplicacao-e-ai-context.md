---
type: doc
name: auditoria-aplicacao-e-ai-context
description: Auditoria do código e do ai-context — o que falta na aplicação
category: qa
generated: "2026-02-04"
---

# Auditoria — aplicação e ai-context

Documento que consolida o que **já está feito** e o que **falta ser feito** na aplicação n.files (ness) e no ai-context (`.context/`), com base no plano `proximos-passos-fluxo-usuario`, na arquitetura e na revisão fase R.

---

## 1. Resumo executivo

| Área | Feito | Pendente |
|------|--------|----------|
| **6 passos do plano** | Passos 1–6 implementados (Árvore, Regra+IA, Cópia, ZIP, UI pós-lote, doc) | — |
| **Código** | Árvore, extração, suggest, branding, dark mode, cópia em massa, API ZIP, modal pós-lote, api-auth | Testes para novas features; toggle de tema (opcional) |
| **ai-context** | Workflow PREVC Fase C concluída; planos com TODOs preenchidos; CHANGELOG | — |

---

## 2. Aplicação — o que falta

### 2.1 Passos do plano (6 próximos passos)

Conforme `.context/plans/proximos-passos-fluxo-usuario.md` e `.context/docs/architecture.md`:

| # | Passo | Estado | O que falta |
|---|-------|--------|-------------|
| 1 | Árvore + seleção | ✅ Implementado | — |
| 2 | Regra + IA (metadados/conteúdo) | ✅ Implementado | Opcional: botão no File system que chama `/api/content/extract` para arquivo selecionado e passa snippet ao suggest (hoje `payloadExtras` existe mas o caller precisa obter o snippet). |
| 3 | **Cópia em massa** | ❌ Pendente | (1) Em `frontend/lib/storage.ts`: função `copyFile` ou equivalente (download + upload em `userId/<projectName>/Renomeados/` ou `Renomeados/YYYY-MM-DD`). (2) No Preview: botão **"Copiar com nome correto"** (além de "Renomear"); destino configurável (Renomeados, opcional sufixo por data). (3) UI: progresso (N de M) e mensagem de erro por arquivo. (4) Validação de path no servidor se houver API route (sessão + prefixo do usuário). |
| 4 | **Download ZIP + índices** | ❌ Pendente | (1) API route `POST /api/export/zip` (ou similar): recebe lista de paths (resultado do lote); valida sessão e que paths pertencem ao usuário; baixa do Storage (service role); monta ZIP com `indice.csv` (colunas: nome_original, nome_novo, caminho_no_zip, indice, data). (2) Nome do ZIP: `{nomeProjeto}-renomeados-{YYYY-MM-DD-HHmm}.zip`. (3) Frontend: botão **"Baixar ZIP com índices"** (pós-cópia ou pós-renomeação, conforme fluxo). |
| 5 | **Uso no repositório** | ❌ Pendente | (1) Após "Copiar em massa" (e quando houver ZIP): **modal de conclusão** com resumo (N arquivos copiados para `<destino>`), botão "Baixar ZIP com índices", botão "Continuar no file manager". (2) Navegação: "Continuar" fecha o modal e mantém o usuário no file manager (projeto atual). |
| 6 | Documentação | 🔄 Em curso | `dinamica-da-aplicacao.md` e `brand-ness.md` atualizados. Falta: marcar passos 3–5 como implementados quando forem feitos; opcional changelog por passo. |

### 2.2 Código e segurança

- **API routes e path traversal:** A revisão fase R exige que todas as API routes que recebem path validem sessão e prefixo do usuário e bloqueiem path traversal. Hoje: `/api/content/extract` já valida. Quando existir API de ZIP e de cópia em massa no servidor, aplicar a mesma regra (path dentro de `userId/<projectName>/`).
- **RLS Storage:** Garantir políticas do bucket `files` por `auth.uid()` (path contém o user id). Ver `.context/docs/supabase.md`.
- **renameFile atual:** O fluxo "Renomear" usa `renameFile` (move no Storage). Não há ainda "Copiar" para Renomeados; quando houver, manter "Renomear" como está e adicionar "Copiar" como opção distinta.

### 2.3 Testes

- Existem testes em `lib/patterns.test.ts` e `lib/custom-patterns-storage.test.ts`.
- **Falta:** testes para `listAllFilesUnderPrefix`, `expandSelectionToFiles`; testes para `/api/content/extract` (validação de path, resposta snippet); testes E2E ou de integração para fluxo Árvore → seleção → preview (opcional).

### 2.4 UX e tema

- **Dark mode:** Já é o padrão (`html` com `className="dark"`).
- **Falta:** toggle de tema (light/dark) se quiser permitir troca pelo usuário (ex.: `next-themes` + botão na sidebar).
- **Branding:** ness. e n.files com Montserrat Medium e ponto #00ade8 já aplicados.

---

## 3. ai-context — o que falta

### 3.1 Workflow PREVC

- **Status:** Fase C (Confirmation) em progresso. Fases P, R, E, V preenchidas/avançadas.
- **Falta:** Considerar fase C concluída (documentação de conclusão já foi feita em parte; opcional: `workflow-advance` não se aplica após C).

### 3.2 Planos

- **proximos-passos-fluxo-usuario:** Plano principal; 6 passos parcialmente implementados (ver acima).
- **Outros planos:** adapt-shadcn-file-manager-nfiles, fluxo-usuario-renomeacao, use-ai-in-application — podem estar parcialmente cobertos pelo estado atual; não auditados em detalhe aqui.

### 3.3 TODOs nos planos (proximos-passos-fluxo-usuario)

No arquivo `.context/plans/proximos-passos-fluxo-usuario.md` ainda constam:

- **Agent Lineup:** Todas as linhas com "TODO: Describe why this agent is involved."
- **Risk Assessment:** "TODO: Dependency on external team", "TODO: Insufficient test coverage", "TODO: Name", etc.
- **Dependencies:** "TODO: List dependencies... (Internal, External, Technical)."
- **Assumptions:** "TODO: Document key assumptions...", "TODO: Note what happens if assumptions prove false."
- **Resource Estimation:** "TODO: e.g., 2 person-days", "TODO: total", "TODO: total."
- **Team Availability:** "TODO: List required expertise...", "TODO: List team members...", "TODO: Name of person to contact...".
- **Rollback / Recovery:** "TODO: Revert commits...", "TODO: Full deployment rollback...", etc.

**Recomendação:** Preencher esses TODOs quando for dar continuidade ao plano (ex.: antes da próxima fase E para passos 3–5) ou marcar como "N/A" onde não se aplica.

### 3.4 Documentação .context

- **docs/README.md:** Índice e Document Map atualizados (inclui brand-ness, dinâmica, etc.).
- **docs/dinamica-da-aplicacao.md:** Estado dos 6 passos e fluxo atualizados.
- **docs/architecture.md:** Decisões dos 6 passos e impacto em UI documentados.
- **docs/brand-ness.md:** Cores e tipografia da marca.
- **workflow/automation-prevc.md e run-prevc-epic.md:** Runbook e guia operacional PREVC.

**Falta:** Atualizar dinâmica (e opcionalmente architecture) quando os passos 3, 4 e 5 forem implementados; manter uma linha "Implementado em DD/MM" ou changelog por passo, se desejado.

---

## 4. Checklist de próximas ações (priorizado)

### Alta prioridade (fluxo do usuário)

1. **Cópia em massa (passo 3):** Implementar cópia para `Renomeados` (ou `Renomeados/YYYY-MM-DD`), botão no Preview, progresso e tratamento de erro.
2. **Download ZIP + índices (passo 4):** API route de export ZIP com `indice.csv`; validação de sessão e paths; botão "Baixar ZIP" no frontend (pós-cópia).
3. **Modal pós-lote (passo 5):** Tela/modal de conclusão com resumo, "Baixar ZIP com índices" e "Continuar no file manager".

### Média prioridade (qualidade e segurança)

4. **Testes:** Testes unitários para `listAllFilesUnderPrefix`, `expandSelectionToFiles`; testes para `/api/content/extract` (path válido/inválido, sessão).
5. **Segurança:** Revisar RLS do bucket `files`; ao criar API de ZIP e de cópia no servidor, validar path e sessão em todas as rotas.

### Baixa prioridade (melhorias e ai-context)

6. **Toggle de tema:** Opção de alternar light/dark (ex.: next-themes + botão na sidebar).
7. **Sugestão com conteúdo no File system:** Botão "Sugerir com conteúdo do arquivo" que chama `/api/content/extract` para o item selecionado e passa o snippet ao `SuggestWithAI` (payloadExtras).
8. **Planos ai-context:** Preencher TODOs do plano proximos-passos-fluxo-usuario (Agent Lineup, Risks, Dependencies, Assumptions, Resource Estimation) ou marcar N/A onde não se aplica.

---

## 5. Referências

- Plano: `.context/plans/proximos-passos-fluxo-usuario.md`
- Decisões e UI: `.context/docs/architecture.md` (seção "Decisões para os 6 próximos passos" e "Frontend — impacto em UI")
- Estado implementado: `.context/docs/dinamica-da-aplicacao.md` (seção 8)
- Revisão fase R: `.context/workflow/review-phase-r.md`
- Workflow: `.context/workflow/status.yaml`, `run-prevc-epic.md`, `automation-prevc.md`
