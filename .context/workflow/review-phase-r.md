# Revisão fase R — proximos-passos-fluxo-usuario

Revisão dos artefatos da fase P (decisões de arquitetura e docs) pelos agentes da fase Review.

---

## 1. architect-specialist — Revisão de consistência

**Artefatos revisados:** `.context/docs/architecture.md` (seção “Decisões para os 6 próximos passos”).

- **Consistência:** As decisões estão alinhadas com o plano `fluxo-usuario-renomeacao.md` e com o plano `proximos-passos-fluxo-usuario.md`. Paths `userId/<projectName>/` e destino `Renomeados` são coerentes com o Storage atual.
- **Completude:** Árvore (lazy por nível), regra+IA (API route, metadados + trecho), cópia (não move), ZIP (API route + indice.csv), pós-lote (modal) e doc estão definidos. Nenhum gap crítico.
- **Recomendação:** Aprovar. Na implementação, validar que a API route de extração de conteúdo (PDF/DOCX) use apenas paths do Storage do usuário autenticado (validar `userId`/projeto no path).

---

## 2. code-reviewer — Revisão de documentação

**Artefatos revisados:** `architecture.md`, `docs/README.md`, `dinamica-da-aplicacao.md`.

- **Qualidade:** Tabelas de decisão estão claras; motivos justificam as escolhas. Frontend — impacto em UI está resumido por passo.
- **Alinhamento:** README (Document Map) e dinâmica (Referências) apontam corretamente para as decisões e para o plano.
- **Recomendação:** Aprovar. Opcional: ao implementar, manter um changelog ou “Implementado” na doc para cada passo concluído.

---

## 3. security-auditor — Revisão de segurança

**Artefatos revisados:** Decisões em `architecture.md`; referência `security.md` e `supabase.md`.

- **API route de extração de conteúdo:** Decisão correta (servidor; GEMINI_API_KEY não exposta). **Requisito:** a API deve receber apenas paths que pertençam ao usuário autenticado (ex.: prefixo `userId/<projectName>/`). Validar sessão/JWT e que o path não escape do projeto do usuário (path traversal).
- **API route de ZIP:** Uso de service role ou signed URLs no servidor é aceitável desde que a lista de paths venha de uma sessão autenticada e seja restrita ao bucket/prefixo do usuário. Não aceitar paths arbitrários do cliente sem validação.
- **Cópia em massa:** Operações de Storage (download/upload) devem usar cliente autenticado ou service role no servidor; em ambos os casos, RLS ou validação de path por `userId`/projeto.
- **RLS Storage:** Garantir que políticas do bucket `files` restrinjam por `auth.uid()` (path contém o user id). Ver `supabase.md`.
- **Recomendação:** Aprovar com a condição de que todas as API routes que recebem path ou listam/baixam arquivos validem que o recurso pertence ao usuário da sessão e bloqueiem path traversal.

---

## Conclusão fase R

- **architect-specialist:** Aprovado.
- **code-reviewer:** Aprovado.
- **security-auditor:** Aprovado com requisitos de validação de path e sessão nas API routes.

Próximo passo: **fase E (Execute)** — implementar os 6 passos conforme o plano e as decisões documentadas.
