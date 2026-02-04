# AGENTS.md

## Project identity
- **Brand:** ness
- **Product:** n.files — sistema de renomeação de arquivos para Windows com **tela de ingestão** (lote/único), **botão de renomeação**, regras (melhores práticas + ingerência do usuário), leitura de arquivos quando necessário para o nome, e **inserção dos renomeados no modelo file manager** da aplicação.
- **Repositório:** [github.com/resper1965/nFiles](https://github.com/resper1965/nFiles)
- **Hospedagem:** **Vercel** (projeto **n-files**, ID `prj_FF8Anquga9QmD9WF5SnVYdpaFbH2`). **Supabase (conectado):** **Auth** (autenticação) e **Storage** (arquivos); Postgres opcional para regras e metadados do file manager.
- Docs: `.context/docs/project-overview.md`, `architecture.md`, `glossary.md`, `data-flow.md`, `tooling.md`, `development-workflow.md`, `supabase.md`, `security.md`.

## Dev environment tips
- Install dependencies with `npm install` before running scaffolds.
- Use `npm run dev` for the interactive TypeScript session that powers local experimentation.
- Run `npm run build` to refresh the CommonJS bundle in `dist/` before shipping changes.
- Store generated artefacts in `.context/` so reruns stay deterministic.

## Testing instructions
- Execute `npm run test` to run the Jest suite.
- Append `-- --watch` while iterating on a failing spec.
- Trigger `npm run build && npm run test` before opening a PR to mimic CI.
- Add or update tests alongside any generator or CLI changes.

## PR instructions
- Follow Conventional Commits (for example, `feat(scaffolding): add doc links`).
- Cross-link new scaffolds in `docs/README.md` and `agents/README.md` so future agents can find them.
- Attach sample CLI output or generated markdown when behaviour shifts.
- Confirm the built artefacts in `dist/` match the new source changes.

## Repository map
- `frontend/` — UI do n.files: tela de ingestão (lote/único), botão de renomeação, regras, árvore, file manager (itens renomeados inseridos), busca e preview.
- `core/` — motor de regras (melhores práticas + ingerência do usuário), leitor de arquivos quando a regra exigir, modelo file manager (inserção dos renomeados), árvore e persistência; integração com **Supabase Auth** e **Supabase Storage**.
- **Seed do sistema:** os arquivos existentes na raiz do repositório são **seed** do n.files — usados como dados iniciais para demonstração, testes ou bootstrap (ex.: `Ingridion - Contrato e Aditivos.zip` e anexos). Não remover nem tratar como lixo; o sistema pode referenciar ou expandir essa árvore de seed.

## AI Context References
- Documentation index: `.context/docs/README.md`
- Agent playbooks: `.context/agents/README.md`
- Contributor guide: `CONTRIBUTING.md`
