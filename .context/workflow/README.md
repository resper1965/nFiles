# Workflow — ness (n.files)

Pasta de **workflow** do projeto: ações registradas e passo de inicialização.

---

## workflow-init

**workflow-init** é o passo de **inicialização** do fluxo de trabalho no repositório. Ao começar a trabalhar no projeto (clone novo ou retomada), execute:

### 1. Clone e dependências

```bash
git clone https://github.com/resper1965/nFiles.git
cd nFiles   # ou Ingridion, conforme o nome da pasta local
cd frontend && pnpm install
```

### 2. Variáveis de ambiente

- Copie `.env.example` (na raiz) para `frontend/.env.local` (ou use os valores da Vercel).
- Preencha `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` (ou `NEXT_PUBLIC_SUPABASE_ANON_KEY`) e, se for usar IA no servidor, `GEMINI_API_KEY`. Ver `.context/docs/env-config-vercel.md`.

### 3. Contexto do repositório (opcional)

- Se o projeto usar ferramenta de contexto (ex.: `ai-context` ou similar), rode o **init** na raiz do repositório para gerar/atualizar índices e documentação em `.context/` (ex.: `context init` ou `workflow-init` conforme a ferramenta).
- O resultado do init pode ser registrado em `.context/workflow/actions.jsonl`.

### 4. Verificações rápidas

- **Frontend:** `cd frontend && pnpm run build` e `pnpm run test` (ou `pnpm run test:run`).
- **Vercel:** deploy pela CLI na raiz: `vercel` (preview) ou `vercel --prod` (produção). Root Directory do projeto na Vercel deve ser `frontend`. Ver `.context/docs/env-config-vercel.md`.

---

## actions.jsonl

Arquivo que registra **ações** do workflow (ex.: context init, scaffold plan) com timestamp, ferramenta, ação e status. Apenas leitura/append; não editar manualmente além de adicionar novas linhas se a ferramenta assim o fizer.

---

## Automação PREVC (ai-context)

Para **executar todas as etapas de um épico** respeitando PREVC (Plan → Review → Execute → Validate → Close) com as ferramentas do ai-context (MCP no Cursor):

- **[automation-prevc.md](./automation-prevc.md)** — Runbook: ciclo PREVC, ferramentas MCP (workflow-init, workflow-advance, plan, agent, workflow-manage), sequência por fase e artefatos esperados.
- **[run-prevc-epic.md](./run-prevc-epic.md)** — Guia operacional: checklist por fase (P, R, E, V, C) com chamadas explícitas às ferramentas MCP; uso para épico atual (proximos-passos-fluxo-usuario) e para retomar/novo épico.

Ordem sugerida: consultar `workflow-status` → seguir o runbook ou o guia operacional a partir da fase atual.

---

## Referências

- `../docs/development-workflow.md` — fluxo de desenvolvimento e deploy.
- `../docs/env-config-vercel.md` — env e Vercel CLI.
- `../docs/README.md` — índice da documentação.
