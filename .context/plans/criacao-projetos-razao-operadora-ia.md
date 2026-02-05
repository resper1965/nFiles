---
status: filled
generated: "2026-02-04"
agents:
  - type: "architect-specialist"
    role: "Definir modelo de dados do projeto e fluxo de inferência (metadado + IA)"
  - type: "backend-specialist"
    role: "API de inferência, persistência de metadados do projeto, validação"
  - type: "frontend-specialist"
    role: "Formulário de criação (razão social + operadora), exibição/edição dos campos inferidos"
  - type: "documentation-writer"
    role: "Documentar vocabulários, prompts e boas práticas para pesquisa da IA"
docs:
  - "project-overview.md"
  - "architecture.md"
  - "dinamica-da-aplicacao.md"
  - "glossary.md"
  - "data-flow.md"
  - "security.md"
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

# Criação de projetos: razão social + operadora e inferência por metadado e IA

> Alterar a lógica de criação de projetos: o usuário informa **razão social do cliente** e **operadora**; os demais campos (tipo de documento, objeto do documento, etc.) são **inferidos** por metadados dos arquivos e por **pesquisa da IA**. Este plano descreve o fluxo alvo, o modelo de dados e **como tornar a pesquisa da IA mais assertiva**.

## Objetivo e sucesso

- **Objetivo:** Na criação de projeto, o usuário informa apenas **razão social do cliente** e **operadora**. O sistema infere (e opcionalmente preenche) tipo de documento, objeto do documento e outros campos usando **metadados** (ex.: nomes de arquivos já ingeridos, metadados de PDF) e **pesquisa da IA** (ex.: dado cliente + operadora, sugerir tipos/objetos comuns). O usuário pode revisar e editar os valores inferidos antes de confirmar.
- **Sinal de sucesso:** Criação de projeto exige razão social e operadora; os demais campos são sugeridos por inferência (metadado + IA) e podem ser editados; a pesquisa da IA segue boas práticas (prompts estruturados, vocabulários, validação, feedback) para maior assertividade.

## Estado atual

- **Projeto hoje:** Um “projeto” é uma **pasta raiz** no Storage (`userId/projectName/.keep`). Não existe tabela de projetos nem metadados persistentes (razão social, operadora, tipo/objeto de documento).
- **Criação hoje:** Um único campo “Nome do projeto” na página Projetos; `createProject(name)` no `project-context` chama `createProjectStorage(userId, name)` e cria a pasta com `.keep`.
- **Regras de renomeação:** Os overrides do Seed completo (razão social, operadora, tipo documento, objeto) são preenchidos **manualmente** na página Projetos no formulário de regras; não estão vinculados ao “projeto” como entidade.

## Fluxo alvo (criação de projeto)

1. Usuário acessa “Novo projeto” e informa **obrigatoriamente**:
   - **Razão social do cliente** (ex.: INGREDION)
   - **Operadora** (ex.: UNIMED NACIONAL)
2. Opcional: nome de exibição/pasta do projeto (derivado da razão + operadora se omitido).
3. O sistema dispara **inferência**:
   - **Metadados:** Se já houver arquivos no projeto (ou em um lote de ingestão associado), analisar nomes de arquivos e metadados (ex.: PDF) para extrair candidatos a tipo de documento e objeto do documento.
   - **Pesquisa da IA:** Dado (razão social, operadora), chamar a IA para sugerir **tipo de documento** e **objeto do documento** (e outros campos desejados), com base em contexto de domínio (ex.: contratos de saúde, operadoras).
4. Exibir os campos inferidos (tipo, objeto, etc.) em formato **editável**; o usuário confirma ou corrige.
5. Persistir o projeto: pasta no Storage (como hoje) **e** metadados do projeto (razão social, operadora, tipo, objeto, origem da inferência, etc.) em tabela ou arquivo de metadados.

## Modelo de dados do projeto (opções)

- **Opção A — Tabela no Supabase (Postgres):**  
  Tabela `projects`: `id`, `user_id`, `name` (nome da pasta no Storage), `razao_social`, `operadora`, `tipo_documento`, `objeto_documento`, `inferred_at`, `created_at`, etc. RLS por `user_id`. Garante consultas, histórico e uso em regras/APIs.
- **Opção B — Metadados no Storage:**  
  Arquivo por projeto, ex.: `userId/projectName/.project.json` com `{ razao_social, operadora, tipo_documento, objeto_documento, ... }`. Menos mudança de infra; listagem de projetos continua por listagem de pastas; leitura/escrita do JSON na criação e ao editar.
- **Recomendação:** Opção A se já houver ou for planejado uso de Postgres para outros dados do n.files; Opção B para mínimo de mudança mantendo apenas Storage.

## Como tornar a pesquisa da IA mais assertiva

A “pesquisa” aqui é: dado (razão social, operadora), a IA sugere tipo de documento, objeto do documento e eventualmente outros campos. As práticas abaixo aumentam a precisão e a confiabilidade.

### 1. Saída estruturada (schema fixo)

- Definir **schema de resposta** (ex.: JSON) com campos fixos: `tipo_documento`, `objeto_documento`, opcionalmente `sugestoes_alternativas`.
- Usar **instrução de formato** no prompt (ex.: “Responda apenas com um JSON no formato …”) ou **structured output** da API (ex.: Gemini com `response_mime_type: "application/json"` e `response_schema`).
- Reduz alucinações em texto livre e facilita validação e pré-preenchimento na UI.

### 2. Contexto de domínio no system prompt

- Incluir no **system prompt** que o domínio é **gestão de documentos contratuais** (ex.: saúde, operadoras, contratos e aditamentos).
- Mencionar **tipos de documento** típicos: CONTRATO, ADITAMENTO, CARTA, PROPOSTA COMERCIAL, TERMO DE ADITAMENTO, OUTRO.
- Mencionar **objetos** típicos: RENOVAÇÃO, REAJUSTE, ALTERAÇÃO DE REEMBOLSO, ELEGIBILIDADE, etc.
- Isso alinha o modelo a um vocabulário consistente e reduz respostas fora do domínio.

### 3. Vocabulários permitidos (allowed values)

- Manter listas **curtas e estáveis** de valores sugeridos para tipo e objeto (em código ou config).
- No prompt: “Escolha **apenas** entre os seguintes valores para tipo de documento: …” e “Para objeto do documento, escolha ou sugira um valor **coerente** com a lista: …”.
- Na **validação** pós-IA: se a resposta não bater com a lista, considerar “OUTRO” ou o valor mais próximo (similaridade) e sinalizar para revisão do usuário.
- Opcional: permitir valor livre apenas quando o usuário editar explicitamente.

### 4. Few-shot (exemplos no prompt)

- Incluir **2–3 exemplos** no prompt:  
  (Razão social X, Operadora Y) → Tipo: CONTRATO, Objeto: RENOVAÇÃO.  
  (Razão social Z, Operadora W) → Tipo: TERMO DE ADITAMENTO, Objeto: REAJUSTE.
- Ajuda o modelo a manter formato e nível de abstração corretos.

### 5. Validação e retry

- Após receber a resposta da IA, **validar** (campos obrigatórios, valores dentro do vocabulário quando aplicável).
- Se inválido: **retry** com prompt ajustado (ex.: “O valor de tipo_documento deve ser um dos: …”) ou **fallback** para valores padrão (ex.: tipo = OUTRO, objeto = vazio) e marcar “Revisar” na UI.
- Registrar falhas de validação para melhorar prompts ou vocabulários.

### 6. Feedback do usuário (loop de correção)

- Quando o usuário **corrigir** um valor inferido, persistir a correção (ex.: “para este par (razão_social, operadora), o usuário escolheu tipo X e objeto Y”).
- Usos futuros:  
  - **Retrieval:** Em novas criações com o mesmo par (ou operadora), consultar primeiro as correções anteriores e sugerir esses valores; chamar a IA só se não houver registro.  
  - **Melhoria de prompts:** Analisar correções (ex.: “IA sugeriu A, usuário escolheu B”) para ajustar exemplos ou descrições no prompt.
- Mantém a pesquisa cada vez mais alinhada ao uso real.

### 7. Preferir retrieval quando houver histórico

- Se existir base de projetos ou correções com (razão_social, operadora) → (tipo, objeto), **buscar primeiro** nessa base.
- Só chamar a IA quando não houver match ou quando o usuário solicitar “Sugerir de novo”.
- Reduz custo e inconsistência e aumenta assertividade quando há histórico.

### 8. Cache e idempotência

- **Cache:** Para o par (razão_social, operadora), cachear a resposta da IA por um tempo (ex.: 24h) ou até haver correção do usuário, para evitar chamadas repetidas idênticas.
- **Idempotência:** Se a criação for disparada duas vezes com os mesmos inputs, retornar o mesmo resultado sem chamar a IA duas vezes.

### 9. Rate limiting e custo

- Aplicar **rate limiting** na API de inferência (por usuário/sessão) para evitar abuso e controlar custo de API da IA.
- Documentar limites e comportamento (ex.: mensagem clara quando o limite for atingido).

### 10. Métricas e melhoria contínua

- Registrar (anonimizado): quantas inferências foram aceitas sem edição vs. quantas foram corrigidas; quais campos são mais corrigidos.
- Usar esses dados para priorizar ajustes de prompt, vocabulários e exemplos.

## Mapeamento rápido: atual → alvo

| Aspecto | Atual | Alvo |
|--------|--------|------|
| Entrada na criação | Nome do projeto (texto livre) | Razão social (obrigatório) + Operadora (obrigatório) + Nome do projeto (opcional/derivado) |
| Metadados do projeto | Nenhum | Razão social, operadora, tipo documento, objeto documento, inferred_at, etc. |
| Origem dos outros campos | Manual no formulário de regras (Seed completo) | Inferidos por metadados + IA; usuário revisa/edita |
| Persistência | Apenas pasta no Storage | Pasta no Storage + metadados (tabela `projects` ou `.project.json`) |
| Regras (Seed completo) | Overrides independentes do “projeto” | Podem ser pré-preenchidos a partir dos metadados do projeto selecionado |

## Referências

- [Reestruturação de telas](./reestruturacao-telas-nfiles.md) — variáveis predeterminadas (razão social, operadora, tipo, objeto)
- [Use AI in Application](./use-ai-in-application.md) — API de IA no servidor, Gemini, segurança
- [Fluxo usuário renomeação](./fluxo-usuario-renomeacao.md) — regras e preview
- [Documentation Index](../docs/README.md), [Plans Index](./README.md)
- API existente: `frontend/app/api/ai/suggest/route.ts` (suggest-name, suggest-rule); pode ser estendida ou nova rota para inferência de projeto

## Próximos passos (ordem sugerida)

1. **Decisão de persistência:** Tabela `projects` (Supabase) vs. `.project.json` no Storage; atualizar architecture/data-flow.
2. **Contrato da API de inferência:** Entrada (razão_social, operadora, opcional: nomes de arquivos ou metadados); saída (tipo_documento, objeto_documento, sugestões); autenticação (Supabase Auth).
3. **Implementar pesquisa da IA** conforme as práticas acima (schema, domínio, vocabulários, few-shot, validação, cache).
4. **Frontend:** Formulário de criação com razão social + operadora; chamada à inferência; tela de revisão/edição dos campos inferidos; persistência do projeto e metadados.
5. **Integração com regras:** Ao selecionar projeto, pré-preencher overrides do Seed completo com os metadados do projeto (se existirem).
6. **Feedback e retrieval:** Persistir correções do usuário e usar em retrieval antes de chamar a IA; documentar em glossary ou doc dedicado.
