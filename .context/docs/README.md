# Documentation Index

Welcome to the repository knowledge base. Start with the project overview, then dive into specific guides as needed.

## Core Guides
- [Project Overview](./project-overview.md)
- [**Dinâmica da aplicação**](./dinamica-da-aplicacao.md) — Como a aplicação funciona: páginas, fluxo (ingestão → regras → preview → renomear) e onde os dados ficam.
- [Architecture Notes](./architecture.md)
- [Development Workflow](./development-workflow.md)
- [Testing Strategy](./testing-strategy.md)
- [Glossary & Domain Concepts](./glossary.md)
- [Data Flow & Integrations](./data-flow.md)
- [Security & Compliance Notes](./security.md)
- [Tooling & Productivity Guide](./tooling.md)
- [Regras sugeridas pelo seed](./regras-sugeridas-seed.md) — Padrão de nomenclatura (maiúsculas, razão social | operadora | tipo doc | descrição | data) sugerido pela usuária do seed.
- [Supabase (Auth + Storage)](./supabase.md) — Autenticação e arquivos; variáveis de ambiente, RLS e fluxos.
- [Configuração env (Vercel e local)](./env-config-vercel.md) — Como substituir placeholders na Vercel e usar `.env.local`.
- [Motor de escolha de padrões](./motor-escolha-padroes.md) — Escolha de padrões (seed, genéricos, custom) mantendo melhores práticas.
- [Brand ness](./brand-ness.md) — Cores e identidade visual do branding ness (n.files); variáveis CSS em `frontend/app/globals.css`.
- [**Auditoria aplicação e ai-context**](./auditoria-aplicacao-e-ai-context.md) — O que falta na aplicação (passos 3–5, testes, segurança) e no ai-context (TODOs dos planos, workflow).
- [**Changelog (6 passos)**](./CHANGELOG.md) — Registro das implementações do plano proximos-passos-fluxo-usuario (cópia, ZIP, modal, doc).

## Repository Snapshot
- `Ingridion - Contrato e Aditivos.zip/`
- `Ingridion - Contrato e Aditivos.zip:Zone.Identifier/`

## Document Map
| Guide | File | Primary Inputs |
| --- | --- | --- |
| Project Overview | `project-overview.md` | Roadmap, README, stakeholder notes |
| Dinâmica da aplicação | `dinamica-da-aplicacao.md` | Fluxo do usuário, File manager, ingestão, regras, preview, renomear |
| Architecture Notes | `architecture.md` | ADRs, service boundaries, dependency graphs; **decisões dos 6 próximos passos** (árvore, regra+IA, cópia, ZIP, uso repo, doc) e impacto em UI. |
| Development Workflow | `development-workflow.md` | Branching rules, CI config, contributing guide |
| Testing Strategy | `testing-strategy.md` | Test configs, CI gates, known flaky suites |
| Glossary & Domain Concepts | `glossary.md` | Business terminology, user personas, domain rules |
| Data Flow & Integrations | `data-flow.md` | System diagrams, integration specs, queue topics |
| Security & Compliance Notes | `security.md` | Auth model, secrets management, compliance requirements |
| Tooling & Productivity Guide | `tooling.md` | CLI scripts, IDE configs, automation workflows |
| Regras sugeridas pelo seed | `regras-sugeridas-seed.md` | Padrão de nomenclatura sugerido pela usuária do seed (Ingredion, contratos/aditivos) |
| Supabase (Auth + Storage) | `supabase.md` | Autenticação (Auth) e arquivos (Storage); env, RLS, buckets |
| Brand ness | `brand-ness.md` | Cores do branding ness (primary, sidebar); variáveis em globals.css |
| Auditoria aplicação e ai-context | `auditoria-aplicacao-e-ai-context.md` | Pendências da aplicação (cópia, ZIP, UI pós-lote) e do ai-context (TODOs, workflow) |
| Changelog (6 passos) | `CHANGELOG.md` | Registro das implementações do plano (cópia, ZIP, modal, doc) |
