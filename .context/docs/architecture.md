---
type: doc
name: architecture
description: Arquitetura do sistema n.files (ness)
category: architecture
generated: 2026-02-04
status: filled
scaffoldVersion: "2.0.0"
---

# Arquitetura — n.files (ness)

## Visão de alto nível

Sistema em camadas: **Frontend** (UI + busca) ↔ **API/Core** (regras + árvore) ↔ **Supabase** (Auth + Storage) e, opcionalmente, sistema de arquivos local (Windows).

```
┌─────────────────────────────────────────────────────────┐
│  Frontend (UI + busca, ingestão, regras, file manager)  │
├─────────────────────────────────────────────────────────┤
│  Core: motor de regras + modelo da árvore + persistência │
├─────────────────────────────────────────────────────────┤
│  Supabase Auth (autenticação) + Storage (arquivos)      │
├─────────────────────────────────────────────────────────┤
│  Opcional: sistema de arquivos (Windows)                 │
└─────────────────────────────────────────────────────────┘
```

## Componentes e responsabilidades

| Componente | Responsabilidade |
|------------|------------------|
| **Tela de ingestão** | Ingestão em lote ou unitária; acionar geração de nomes e inserção no modelo file manager; botão de renomeação (aplicar regras). |
| **Frontend** | Tela de ingestão; seleção de pasta raiz; criação/edição de regras (com ingerência do usuário); busca (árvore, regras, preview); visualização da árvore e do file manager; aplicação (preview e execução). |
| **Motor de regras** | Interpretar regras (melhores práticas por padrão, com override do usuário); gerar mapeamento (atual → novo); quando a regra exigir, solicitar leitura de arquivo; validar conflitos (duplicados, caracteres inválidos). |
| **Leitor de arquivos** | Ler conteúdo ou metadados do arquivo quando a regra precisar para avaliar o nome (ex.: EXIF, metadados de documento). |
| **Modelo file manager** | Estrutura da aplicação que recebe os arquivos renomeados após a ingestão; exibir e buscar itens ingeridos. |
| **Árvore de arquivos** | Modelo da pasta raiz e filhos; metadados (regras, histórico); persistência; integração com o file manager (inserção dos renomeados). |
| **Persistência** | Salvar/carregar regras e vínculo com a árvore; estado do file manager; opcionalmente histórico. |
| **Supabase Auth** | Autenticação de usuários; sessão; proteger acesso a Storage e dados. |
| **Supabase Storage** | Armazenar arquivos ingeridos e arquivos renomeados (file manager); buckets com RLS por usuário. |

## Fluxo de dados (resumido)

1. **Ingestão:** usuário envia arquivos (lote ou único) na **tela de ingestão**.
2. **Regras:** motor aplica regras (melhores práticas + ingerência do usuário); quando necessário, **lê** conteúdo/metadados do arquivo para avaliar o nome.
3. **Preview / Renomeação:** usuário vê preview e aciona o **botão de renomeação**; sistema gera os arquivos renomeados.
4. **Inserção no file manager:** os arquivos renomeados são **inseridos no modelo file manager** da aplicação (disponíveis na árvore/lista da app).
5. Regras e vínculo com a árvore são gravados; busca filtra árvore, regras e resultados.

Ver `data-flow.md` para detalhes.

## Decisões de design

- **Regras descritas:** armazenadas como dados (ex.: JSON), não só UI; permitem reutilização e versionamento.
- **Árvore lógica:** representação da estrutura de pastas + metadados (regras, histórico) independente do disco para busca e preview.
- **Frontend com busca:** busca sobre árvore, regras e resultados para localizar rapidamente itens e regras.

## Stack (a definir)

- **Desktop:** ex. Electron (Node + frontend web) ou Tauri (Rust + frontend).
- **Web local:** ex. React/Vue + Node/Express servindo API local; acesso a pastas via seleção de diretório ou backend com permissão no Windows.

A escolha impacta: onde roda o acesso ao sistema de arquivos (processo principal vs backend) e como a “árvore” e as regras são persistidas. Não introduzir novas tecnologias sem consentimento do usuário.

## Supabase (Auth + Storage)

O projeto está **conectado ao Supabase**. Utilizar:

- **Supabase Auth** — autenticação de usuários (login, sessão); proteger rotas e acesso a Storage; associar regras e file manager ao usuário.
- **Supabase Storage** — armazenar **arquivos** (ingestão e arquivos renomeados do file manager); buckets com políticas (RLS) por usuário.

Regras e metadados do file manager podem ser persistidos em **tabelas no Supabase (Postgres)** ou em metadados dos objetos no Storage. Ver `.context/docs/supabase.md` para variáveis de ambiente, RLS e fluxos.

## Persistência e banco de dados

Com **Supabase** conectado:

- **Arquivos:** Supabase **Storage** (binários).
- **Autenticação:** Supabase **Auth** (usuários, sessão).
- **Metadados (regras, file manager, histórico):** Supabase **Postgres** (tabelas com RLS) ou metadados no Storage; antes era opcional “DB”, agora o backend é o Supabase.

## Hospedagem e integrações

- **Vercel:** aplicação **hospedada na Vercel** (frontend Next.js; APIs via Serverless Functions se necessário). Build, env e domínio via dashboard ou `vercel.json`.
- **Supabase:** **autenticação** (Auth) e **arquivos** (Storage); opcionalmente Postgres para regras e metadados do file manager. Configurar `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` (e `SUPABASE_SERVICE_ROLE_KEY` só no servidor se necessário). Ver `supabase.md`.

---

## Decisões para os 6 próximos passos (fase P — plano proximos-passos-fluxo-usuario)

Documento de decisões de arquitetura e design para os 6 passos do fluxo de renomeação (árvore + seleção, regra + IA, cópia em massa, download ZIP + índices, uso no repositório, documentação). Referência: `.context/plans/fluxo-usuario-renomeacao.md` e `.context/plans/proximos-passos-fluxo-usuario.md`.

### 1. Árvore + seleção

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| **Modelo da árvore** | Listagem recursiva por prefixo no Supabase Storage, **por projeto** (path base `userId/<projectName>/`). Cada chamada `list(path)` retorna itens imediatos; subpastas são obtidas listando `path/subpasta`. | Storage não expõe delimiter; manter compatível com `listFiles` atual; projeto já define a pasta raiz. |
| **Profundidade** | Um nível por vez (lazy): expandir pasta = nova chamada `list(userId, projectName, prefix)`. Opcional: cache em memória por sessão. | Evitar listar todo o bucket de uma vez; UX de “expandir pasta”. |
| **Seleção** | Estado no frontend: conjunto de paths (ou nomes relativos ao projeto) dos itens selecionados. Checkboxes por arquivo; opção “selecionar pasta” = todos os arquivos sob esse prefixo. | Preview e cópia usam só os itens selecionados; não alterar Storage até o usuário acionar “Copiar”/“Renomear”. |
| **Onde vive a árvore** | File system (`/dashboard/file-manager`): nova área ou card “Árvore” com árvore + seleção; preview continua alimentado por “Usar arquivos do Storage” **ou** pelos itens selecionados na árvore. | Centralizar escolha de arquivos e regras na mesma tela. |

### 2. Regra + IA (metadados/conteúdo)

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| **Metadados** | Usar o que o Supabase Storage expõe (ex.: `created_at` se disponível no list) e, para conteúdo, **tipo MIME** inferido por extensão ou por cabeçalho no servidor. Campos: nome atual, data de criação (se houver), content-type, tamanho. | Evitar dependência de libs pesadas no cliente; metadados mínimos para IA sugerir/validar nome. |
| **Extração de conteúdo** | **API route** (Next.js) no servidor: recebe path ou arquivo; para PDF/DOCX usa lib server-side (ex.: pdf-parse, mammoth) e retorna trecho de texto (ex.: primeiros N caracteres). IA (Gemini) consome metadados + trecho. | Conteúdo não deve ir todo ao cliente; GEMINI_API_KEY só no servidor; controle de tamanho e custo. |
| **Validação por IA** | Estender `app/api/ai/suggest/route.ts`: aceitar payload com metadados e trecho de conteúdo; resposta inclui nome sugerido e/ou validação (válido/inválido + motivo). | Reaproveitar endpoint existente; mesma chave e modelo. |

### 3. Cópia em massa

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| **Operação** | **Cópia** (ler objeto do Storage, gravar em novo path com nome novo), não só move. Origem: path atual no projeto; destino: **subpasta configurável** do mesmo projeto (ex.: `Renomeados` ou `Renomeados/YYYY-MM-DD`). | Preservar originais; usuário pode definir pasta de resultado; data opcional para lotes repetidos. |
| **Destino padrão** | Subpasta **`Renomeados`** dentro do projeto (`userId/<projectName>/Renomeados/`). Opcional: sufixo por data (`Renomeados/2026-02-04`) configurável na UI. | Um lugar previsível; evita sobrescrever arquivos existentes no root do projeto. |
| **Batch e feedback** | Loop no cliente ou em API route: para cada item do preview, chamar Storage (download + upload no novo path). UI: progresso (N de M) e mensagem de erro por arquivo se falhar. | Limites de tempo em serverless; feedback claro para o usuário. |

### 4. Download ZIP + índices

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| **Geração do ZIP** | **API route** (Next.js): recebe lista de paths (resultado do lote); baixa arquivos do Storage (service role ou signed URLs); monta ZIP em memória ou stream; retorna arquivo. Ou: cliente monta ZIP com arquivos já baixados (mais simples, mas mais tráfego). | Servidor pode usar service role para ler do Storage; ZIP único com todos os arquivos. |
| **Formato do índice** | **CSV** na raiz do ZIP: `indice.csv`. Colunas: `nome_original`, `nome_novo`, `caminho_no_zip`, `indice`, `data` (ISO). Encoding UTF-8. | Legível em Excel e scripts; dentro do ZIP para portabilidade. |
| **Nome do ZIP** | `{nomeProjeto}-renomeados-{YYYY-MM-DD-HHmm}.zip` ou configurável. | Identificação clara do lote. |

### 5. Uso no repositório

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| **Pós-lote** | Após “Copiar em massa”, exibir **tela ou modal de conclusão** com: (1) resumo (N arquivos copiados para `<destino>`); (2) botão **“Baixar ZIP com índices”**; (3) botão **“Continuar no file manager”** (navega para file manager, foco no projeto atual). | Deixar explícito que o usuário pode baixar ou seguir no app; evita dúvida. |

### 6. Documentação

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| **Onde registrar** | **architecture.md** (esta seção); **dinamica-da-aplicacao.md** atualizado quando cada passo estiver implementado; decisões de “cópia vs move”, “destino”, “formato do índice” e “metadados/conteúdo” ficam aqui e no plano. | Rastreabilidade e onboarding; plano e docs alinhados. |

### Frontend — impacto em UI (6 passos)

| Passo | Componente / tela | Alteração |
|-------|-------------------|-----------|
| **1. Árvore + seleção** | File system | Novo card Árvore: árvore com checkboxes, estado de seleção, Usar seleção no preview. |
| **2. Regra + IA** | Card Regras | Campos metadados/trecho; API sugerir/validar nome. |
| **3. Cópia em massa** | Preview | Botão Copiar com nome correto; destino (Renomeados); progresso. |
| **4. Download ZIP** | Pós-cópia | Botão Baixar ZIP com índices; API ZIP + indice.csv. |
| **5. Uso no repositório** | Conclusão | Modal: resumo, Baixar ZIP, Continuar no file manager. |
| **6. Documentação** | — | Atualizar doc apenas. |
