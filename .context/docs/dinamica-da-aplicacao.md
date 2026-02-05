# Dinâmica da aplicação — ness (n.files)

Documento que explica **como a aplicação funciona**: o que ela faz, por onde o usuário passa e como os dados fluem.

---

## 1. O que a aplicação faz (em uma frase)

A **ness** é um sistema de **gestão de documentos**: você envia arquivos para a nuvem (Supabase Storage), escolhe um **padrão de nome** (regra) e a aplicação mostra um **preview** (nome atual → nome novo); quando você confirma, ela **renomeia** os arquivos no Storage conforme a regra.

---

## 2. Área autenticada e páginas

**Toda a aplicação exige login.** Quem não estiver autenticado é redirecionado para `/login`. Após entrar, o usuário fica na área do dashboard (sidebar com ness, email e menu).

| Página | Rota | O que o usuário vê / faz |
|--------|------|---------------------------|
| **Home** | `/` | Redireciona: se logado → `/dashboard`; se não → `/login`. |
| **Login** | `/login` | Formulário de email e senha (Supabase Auth). Se já logado, redireciona para `/dashboard`. |
| **Dashboard** | `/dashboard` | Resumo e cards para **Projetos**, **Ingestão** e **File system**. Na lateral: **ness**, **Projeto** (seletor + criar novo), email, Sair e menu (Dashboard, Projetos, Ingestão, File system). |
| **Projetos** | `/dashboard/projetos` | Criar projeto (razão social + operadora), **Regras**, **Preview** (nome atual → nome novo) e botão **Renomear** / **Copiar com nome correto** no Storage. Escolhida pelo menu **Projetos**. |
| **Ingestão** | `/dashboard/ingestao` | Upload de arquivos (lote ou único) e **estrutura de arquivos** (lista/grade) do Storage **do projeto selecionado**. Escolhida pelo menu **Ingestão**. |
| **File system** | `/dashboard/file-manager` | **Estrutura de arquivos (árvore)** do projeto: pastas e arquivos; expandir pastas e marcar arquivos para usar no preview de renomeação (em Projetos). Link para Ingestão. Escolhida pelo menu **File system**. |

Ou seja: o uso típico é **Login → Dashboard → Ingestão** (enviar arquivos e ver estrutura em lista/grade), **File system** (ver estrutura em árvore) e **Projetos** (regras, preview e renomear).

---

## 3. Ingestão, File system e Projetos (fluxo em três telas)

A **Ingestão** (`/dashboard/ingestao`) é a tela para enviar arquivos ao Storage e ver a **estrutura de arquivos** em lista/grade. O **File system** (`/dashboard/file-manager`) é a tela para ver a **estrutura de arquivos em árvore** (pastas e arquivos do projeto). A página **Projetos** (`/dashboard/projetos`) concentra **Regras**, **Preview** e **Renomear**. O fluxo é:

```
[INGESTÃO]       →  enviar arquivos ao Storage e ver estrutura (lista/grade)
[FILE SYSTEM]    →  ver estrutura de arquivos (árvore)
[PROJETOS]       →  [REGRAS]  →  [PREVIEW]  →  [RENOMEAR]
```

### 3.1 Ingestão (tela escolhida no menu)

- **O que é:** tela dedicada a **upload** e **listagem** do que está no **Supabase Storage** (bucket do usuário).
- **O que o usuário faz:** faz **upload** de arquivos (um ou vários) para o Storage e vê a lista atualizada.
- **Resultado:** os arquivos ficam no Storage. Na página **Projetos**, o botão **"Usar arquivos do Storage"** no preview usa essa mesma lista (carregada automaticamente em Projetos).

### 3.2 Regras (na tela Projetos)

- **O que é:** a **regra** define o **padrão da nomenclatura** (como cada nome atual vira um nome novo). O que importa aqui é **qual padrão** está escolhido (ex.: Seed completo). Razão e operadora vêm do **projeto** (já preenchidos); tipo e objeto ficam em branco por documento para cada arquivo poder variar.
- **O que o usuário faz:**
  - Escolhe um **padrão** no dropdown (ex.: **Seed simples**, **Seed completo**, **Data no início**, **Slug**, ou um padrão **customizado**).
  - Se escolher **Seed completo**, pode ajustar opcionalmente: Razão e Operadora (vêm do projeto), Tipo doc e Objeto (em branco por documento; preencha só se quiser o mesmo para todos).
  - Pode criar **Nova regra**: nome do padrão + template com `{nome}`, `{data}`, `{indice}` (regras custom ficam salvas no navegador, em `localStorage`).
  - Pode usar **Sugerir nome com IA**: opcionalmente informar nome atual; a API pode receber também **metadados** e **trecho de conteúdo** (via extração em `POST /api/content/extract`) para sugerir um nome mais adequado.
- **Resultado:** o sistema sabe **como** transformar cada “nome atual” em “nome novo”. Nada é renomeado ainda; isso só acontece quando o usuário clica em **Renomear** (ver 3.5).

### 3.3 Árvore (na tela File system)

- **O que é:** um **card “Árvore”** que lista pastas e arquivos do **projeto selecionado** (um nível por vez ao expandir). Permite **selecionar** arquivos (checkbox) ou **Selecionar pasta** (todos os arquivos da pasta).
- **O que o usuário faz:** expande pastas na árvore, marca checkboxes nos arquivos desejados ou clica em **Selecionar pasta** numa pasta. Depois usa **“Usar seleção no preview”** no card Preview para preencher a tabela só com os itens selecionados.
- **Resultado:** o preview (na página **Projetos**) passa a ser alimentado **só pelos itens selecionados** na árvore (ou pela lista plana do Storage, como antes).

### 3.4 Preview (nome atual → nome novo, na tela Projetos)

- **O que é:** o **Preview** é a **tabela** que mostra, para cada arquivo, o **nome atual** e o **nome novo** que a regra geraria. É só **visualização**: nenhum arquivo no Storage é alterado até você clicar no botão **Renomear** (ou **Copiar com nome correto**).
- **O que o usuário faz:**
  - Preenche a lista do preview usando **“Usar arquivos do Storage”**, **“Usar seleção no preview”** (itens marcados na Árvore), **“Usar seed do repositório”** ou adicionando nomes manualmente.
  - Ajusta a **regra** (padrão ou campos do Seed completo) e vê a tabela atualizar na hora.
  - Pode usar a **busca** para filtrar as linhas da tabela (só visual).
- **Resultado:** você **vê** exatamente o que será renomeado antes de confirmar. Se dois nomes novos coincidirem, o sistema coloca sufixo `_1`, `_2`, etc., para não haver conflito.

### 3.5 Renomear (aplicar no Storage, na tela Projetos)

- **O que é:** o **botão “Renomear”** que aplica as renomeações no **Supabase Storage** (cada arquivo é “movido” do nome atual para o nome novo no mesmo bucket).
- **O que o usuário faz:** clica em **Renomear** depois de conferir o preview. É necessário estar **logado**; sem login, a aplicação avisa.
- **Resultado:** os arquivos no Storage passam a ter os nomes novos; a lista e a árvore são atualizadas (refresh) para refletir os nomes atuais.

### 3.6 Copiar com nome correto (cópia em massa para Renomeados)

- **O que é:** o **botão “Copiar com nome correto”** no card Preview. Copia cada arquivo do preview para a pasta **Renomeados** do projeto (no Storage), com o nome novo; não remove o original.
- **O que o usuário faz:** monta o preview (nome atual → nome novo), clica em **Copiar com nome correto**. A aplicação chama a API `POST /api/storage/copy-batch`; ao concluir, abre um **modal de conclusão** com o resumo (quantos copiados, eventual lista de falhas).
- **Resultado:** os arquivos ficam em `userId/<projeto>/Renomeados/<nome_novo>`. No modal, o usuário pode **Baixar ZIP com índices** ou **Continuar no file manager**.

### 3.7 Baixar ZIP com índices (pós-cópia)

- **O que é:** no **modal de conclusão** (após cópia em massa), o botão **Baixar ZIP com índices** gera um ZIP com os arquivos renomeados e um arquivo **indice.csv** (nome_original, nome_novo, caminho_no_zip, data).
- **O que o usuário faz:** clica em **Baixar ZIP com índices**; o navegador baixa o arquivo (ex.: `NomeProjeto-renomeados-YYYY-MM-DD-HHmm.zip`).
- **Resultado:** ZIP para uso local; **Continuar no file manager** fecha o modal e mantém o usuário na tela Projetos.

---

## 4. Resumo do fluxo (passo a passo)

1. **Entrar** (login em `/login`). Toda a aplicação está em área autenticada.
2. **Enviar arquivos:** ir em **Ingestão** no menu (`/dashboard/ingestao`) e fazer upload (lote ou único) para o Storage.
3. **(Opcional) Ver estrutura em árvore:** no menu, abrir **File system** (`/dashboard/file-manager`) para expandir pastas e marcar arquivos para o preview.
4. **Ir a Projetos:** no menu, abrir **Projetos** (`/dashboard/projetos`).
5. **Definir a regra: escolher um padrão (e, se for o caso, preencher Operadora, Tipo doc, Descrição ou criar nova regra). Opcional: usar **Sugerir nome com IA** (com ou sem metadados/trecho de conteúdo).
6. **Montar o preview:** usar **“Usar arquivos do Storage”**, **“Usar seleção no preview”** (itens marcados na Árvore) ou “Usar seed do repositório” para preencher a tabela nome atual → nome novo; conferir e ajustar a regra até ficar como deseja.
7. **Renomear ou Copiar:** clicar em **Renomear** (move no Storage) ou em **Copiar com nome correto** (copia para a pasta Renomeados). Após copiar, o modal permite **Baixar ZIP com índices** ou **Continuar no file manager**.

---

## 5. Projeto (nome = pasta raiz)

O usuário **dá um nome ao projeto**; esse nome é o **nome da pasta raiz** no Storage (ex.: `userId/Contrato-2025/`). Assim é possível **manter vários projetos** por usuário.

### 5.1 Estrutura de pastas

- **Pasta principal:** o nome da pasta principal no Storage é **sempre o nome do projeto** (ex.: `userId/NomeDoProjeto/`).
- **Subpasta:** dentro do projeto, a subpasta pode ser razão+operadora (ex.: na ingestão, `NomeDoProjeto/Razao-Operadora/`).

### 5.2 Na sidebar do dashboard (passos)

- **Seletor de projeto:** dropdown com os projetos (pastas raiz) do usuário; opção “— Sem projeto —” usa o path legado `userId/`.
- **Criar projeto:** campo “Novo projeto” + botão; Razão social + Operadora (obrigatórios); nome da pasta opcional. Pasta principal = nome do projeto; subpasta pode ser razão+operadora. Tipo e objeto não são do projeto. Regras: razão e operadora vêm do projeto; tipo e objeto em branco para cada documento poder variar. Preview: os arquivos só são renomeados no Storage quando você clica no botão **Renomear** (na página **Projetos**).

## 6. Onde os dados ficam

| Dado | Onde fica |
|------|-----------|
| **Usuário e sessão** | Supabase **Auth** (login). |
| **Arquivos (arquivos em si)** | Supabase **Storage** (bucket: `userId/<nomeProjeto>/` ou `userId/` se sem projeto). |
| **Projeto atual** | **localStorage** (chave `nfiles-current-project`); lista de projetos = pastas raiz sob `userId/`. |
| **Lista de nomes no preview** | Só na **memória do navegador** (estado da página); não é salva no servidor. |
| **Regras customizadas** | **localStorage** do navegador (chave `nfiles-custom-patterns`). |
| **Seed de exemplo (nomes do ZIP)** | Arquivo estático `frontend/public/seed-files.json` (lista de nomes para demonstração). |

Ou seja: **autenticação e arquivos** estão no Supabase; **projeto atual** e **regras custom** em localStorage; **preview** só em memória.

---

## 7. Conceitos em uma linha

- **Ingestão:** entrada de arquivos (upload para o Storage) e lista do que está no Storage.
- **Regra / padrão:** definição de como transformar “nome atual” em “nome novo” (ex.: Seed completo, Data no início, template customizado).
- **Preview:** tabela “nome atual → nome novo” antes de aplicar; só visualização.
- **Renomear:** ação que aplica o preview no Storage (move/renomeia os arquivos).
- **Copiar com nome correto:** cópia em massa para a pasta **Renomeados** do projeto (originais permanecem); depois é possível baixar ZIP com índices.
- **Resolução de conflitos:** se a regra gerar o mesmo nome novo para dois arquivos, o sistema adiciona `_1`, `_2`, etc., antes da extensão.
- **Seed do repositório:** lista de nomes de exemplo (vinda do ZIP do projeto) para testar o preview sem depender do Storage.

---

## 8. Estado de implementação (6 próximos passos)

Conforme o plano `proximos-passos-fluxo-usuario.md` e as decisões em `architecture.md`:

| Passo | Descrição | Estado |
|-------|-----------|--------|
| **1. Árvore + seleção** | Árvore por projeto (lazy por nível), checkboxes por arquivo, “Selecionar pasta”, “Usar seleção no preview”. | **Implementado.** Card “Árvore” no File system; `FileTree`, `listAllFilesUnderPrefix`, `expandSelectionToFiles`; preview com botão “Usar seleção no preview (N)”. |
| **2. Regra + IA (metadados/conteúdo)** | Metadados + extração de conteúdo (PDF/DOCX) em API; IA recebe metadados e trecho para sugerir nome. | **Implementado.** `POST /api/content/extract` (path, validação de usuário, PDF/DOCX → snippet); `POST /api/ai/suggest` aceita `metadata` e `contentSnippet`; `SuggestWithAI` com `payloadExtras`. |
| **3. Cópia em massa** | Cópia no Storage (destino Renomeados), batch com feedback. | **Implementado.** `POST /api/storage/copy-batch`; botão "Copiar com nome correto" no Preview; destino `userId/<projeto>/Renomeados/`. |
| **4. Download ZIP + índices** | API route ZIP, índice CSV dentro do ZIP. | **Implementado.** `POST /api/export/zip`; ZIP com arquivos + `indice.csv` (nome_original, nome_novo, caminho_no_zip, data). |
| **5. Uso no repositório** | Modal pós-lote: Baixar ZIP vs Continuar no file manager. | **Implementado.** Modal pós-cópia com "Baixar ZIP com índices" e "Continuar no file manager"; `PostBatchModal`. |
| **6. Documentação** | Atualizar este doc e registrar decisões. | **Implementado.** Este doc e `architecture.md` atualizados; decisões (cópia vs move, destino Renomeados, formato índice CSV) registradas. |

### 8.1 Detalhes do que está implementado

- **Árvore:** Em `/dashboard/file-manager`, card **Árvore** lista pastas/arquivos do projeto (um nível por vez ao expandir). Checkbox por arquivo; em pastas, botão **Selecionar pasta** inclui todos os arquivos da pasta na seleção. O botão **Usar seleção no preview** no card Preview preenche a tabela com os itens selecionados (paths relativos ao projeto).
- **Extração de conteúdo:** `POST /api/content/extract` recebe `{ path }` (path completo no Storage). Requer autenticação (cookies ou `accessToken` no body). Valida que o path pertence ao usuário. Retorna `{ snippet }` (até 4000 caracteres) para PDF e DOCX.
- **Sugestão com metadados/trecho:** `POST /api/ai/suggest` aceita no payload `metadata` (createdAt, contentType, size) e `contentSnippet`. O componente `SuggestWithAI` aceita `payloadExtras` para enviar esses dados.
- **Cópia em massa:** `POST /api/storage/copy-batch` recebe `{ projectName, items: [{ fromPath, toName }], accessToken? }`. Valida sessão e que cada `fromPath` pertence ao usuário/projeto; copia para `userId/projectName/Renomeados/toName`. Retorna `{ copied, failed }`.
- **Export ZIP:** `POST /api/export/zip` recebe `{ projectName, items, accessToken? }`. Valida sessão e paths; monta ZIP com arquivos e `indice.csv`; retorna o binário com `Content-Disposition: attachment`. Autenticação e validação de path centralizadas em `lib/api-auth.ts` (pathBelongsToUser, getUserIdFromRequest).

---

## 9. Referências

- **Visão geral e estado atual:** `project-overview.md`
- **Motor de padrões e regras:** `motor-escolha-padroes.md`
- **Fluxo de dados (origem/destino):** `data-flow.md`
- **Termos e entidades:** `glossary.md`
- **Decisões dos 6 próximos passos (árvore, regra+IA, cópia, ZIP, doc) e impacto em UI:** `architecture.md` (seção “Decisões para os 6 próximos passos” e “Frontend — impacto em UI”). Plano: `.context/plans/proximos-passos-fluxo-usuario.md`.
