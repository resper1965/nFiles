# Changelog — 6 próximos passos do fluxo de renomeação

Registro das implementações do plano `proximos-passos-fluxo-usuario.md`.

---

## 2026-02-04 — Passos 3, 4, 5 e 6

### Passo 3: Cópia em massa
- **API:** `POST /api/storage/copy-batch` — recebe `projectName`, `items` (fromPath, toName), valida sessão e paths; copia para `userId/projectName/Renomeados/`.
- **UI:** Botão **Copiar com nome correto** no card Preview; feedback de progresso e erros por arquivo no modal pós-lote.
- **Segurança:** Validação de sessão e path traversal em `lib/api-auth.ts`; paths relativos ao projeto sem `..`.

### Passo 4: Download ZIP + índices
- **API:** `POST /api/export/zip` — recebe `projectName`, `items`; monta ZIP com arquivos e `indice.csv` (nome_original, nome_novo, caminho_no_zip, data); retorna binário com nome `{projeto}-renomeados-{data}.zip`.
- **UI:** Botão **Baixar ZIP com índices** no modal de conclusão (pós-cópia).
- **Segurança:** Mesma validação de sessão e paths que copy-batch.

### Passo 5: UI pós-lote
- **Componente:** `PostBatchModal` — modal (Sheet) com resumo (N copiados, falhas), **Baixar ZIP com índices** e **Continuar no file manager**.
- **Fluxo:** Após clicar em "Copiar com nome correto", o modal abre; "Continuar" fecha o modal e mantém o usuário no file manager.

### Passo 6: Documentação
- **Atualizado:** `dinamica-da-aplicacao.md` — seções 3.6, 3.7, 4, 7, 8 (estado dos 6 passos e detalhes de copy-batch e export ZIP).
- **Criado:** Este `CHANGELOG.md` e referência em `docs/README.md` (opcional).

### Outros
- **lib/api-auth.ts:** Helper compartilhado para autenticação (getUserIdFromRequest) e validação de path (pathBelongsToUser, isValidProjectRelativePath) nas API routes.
- **Dependência:** `archiver` para geração do ZIP no servidor.
