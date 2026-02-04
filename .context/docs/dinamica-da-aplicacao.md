# Dinâmica da aplicação — ness (n.files)

Documento que explica **como a aplicação funciona**: o que ela faz, por onde o usuário passa e como os dados fluem.

---

## 1. O que a aplicação faz (em uma frase)

A **ness** é um sistema de **renomeação de arquivos em lote**: você envia arquivos para a nuvem (Supabase Storage), escolhe um **padrão de nome** (regra) e a aplicação mostra um **preview** (nome atual → nome novo); quando você confirma, ela **renomeia** os arquivos no Storage conforme a regra.

---

## 2. Páginas e navegação

| Página | Rota | O que o usuário vê / faz |
|--------|------|---------------------------|
| **Home** | `/` | Apresentação do produto (ness), lista de recursos e botões para **Entrar** e **Abrir File manager**. |
| **Login** | `/login` | Formulário de email e senha (Supabase Auth). Quem não quiser logar pode ir direto ao **Dashboard** (acesso sem login, mas renomear no Storage exige login). |
| **Dashboard** | `/dashboard` | Resumo e link para o **File manager**. Na lateral: **ness**, estado de login (email + Sair ou Entrar) e menu (Dashboard, File manager). |
| **File manager** | `/dashboard/file-manager` | **Tela principal**: ingestão de arquivos, regras, busca e preview de renomeação. É aqui que todo o fluxo acontece. |

Ou seja: o uso típico é **Home → (opcional) Login → Dashboard → File manager**.

---

## 3. O que acontece no File manager (fluxo em 4 blocos)

Na página **File manager** há quatro blocos que se encaixam assim:

```
[1. INGESTÃO]  →  [2. REGRAS]  →  [3. PREVIEW]  →  [4. RENOMEAR]
```

### 3.1 Ingestão (entrada de arquivos)

- **O que é:** lista dos arquivos que existem no **Supabase Storage** (bucket do usuário) e forma de **adicionar** novos arquivos.
- **O que o usuário faz:**
  - Faz **upload** de arquivos (um ou vários) para o Storage.
  - Ou usa o botão **"Usar arquivos do Storage"** no bloco de Preview para preencher a tabela com os nomes que já estão no Storage.
  - Ou usa **"Usar seed do repositório"** para carregar uma lista de exemplo (nomes do ZIP de seed do projeto).
- **Resultado:** você tem uma **lista de nomes de arquivos** (atuais) que podem ser renomeados. Essa lista alimenta o preview.

### 3.2 Regras (padrão de nomenclatura)

- **O que é:** a **regra** que define como cada nome atual vira um **nome novo** (ex.: colocar data no início, usar um template com operadora e tipo de documento, etc.).
- **O que o usuário faz:**
  - Escolhe um **padrão** no dropdown (ex.: **Seed simples**, **Seed completo**, **Data no início**, **Slug**, ou um padrão **customizado**).
  - Se escolher **Seed completo**, pode preencher opcionalmente: Operadora, Tipo doc, Descrição (esses valores entram no nome novo).
  - Pode criar **Nova regra**: nome do padrão + template com `{nome}`, `{data}`, `{indice}` (regras custom ficam salvas no navegador, em `localStorage`).
- **Resultado:** o sistema sabe **como** transformar cada “nome atual” em “nome novo”. Nada é renomeado ainda; isso só acontece no passo 4.

### 3.3 Preview (nome atual → nome novo)

- **O que é:** uma **tabela** que mostra, para cada arquivo, o **nome atual** e o **nome novo** que a regra escolhida geraria.
- **O que o usuário faz:**
  - Preenche a lista do preview usando **"Usar arquivos do Storage"**, **"Usar seed do repositório"** ou adicionando nomes manualmente (conforme a UI permitir).
  - Ajusta a **regra** (padrão ou campos do Seed completo) e vê a tabela atualizar na hora.
  - Pode usar a **busca** para filtrar as linhas da tabela (só visual).
- **Resultado:** você **vê** exatamente o que será renomeado antes de confirmar. Se dois nomes novos coincidirem, o sistema coloca sufixo `_1`, `_2`, etc., para não haver conflito.

### 3.4 Renomear (aplicar no Storage)

- **O que é:** o **botão "Renomear"** que aplica de fato as renomeações no **Supabase Storage** (cada arquivo é “movido” do nome atual para o nome novo no mesmo bucket).
- **O que o usuário faz:** clica em **Renomear** depois de conferir o preview. É necessário estar **logado**; sem login, a aplicação avisa.
- **Resultado:** os arquivos no Storage passam a ter os nomes novos; a lista de ingestão é atualizada (refresh) para refletir os nomes atuais.

---

## 4. Resumo do fluxo (passo a passo)

1. **Entrar no File manager** (`/dashboard/file-manager`).
2. **Ter arquivos no Storage:** fazer upload na ingestão ou já ter arquivos no bucket.
3. **Definir a regra:** escolher um padrão (e, se for o caso, preencher Operadora, Tipo doc, Descrição ou criar nova regra).
4. **Montar o preview:** usar “Usar arquivos do Storage” (ou seed) para preencher a tabela nome atual → nome novo; conferir e ajustar a regra até ficar como deseja.
5. **Renomear:** clicar em **Renomear** (com login). Os arquivos no Storage são renomeados; a lista da ingestão atualiza.

---

## 5. Onde os dados ficam

| Dado | Onde fica |
|------|-----------|
| **Usuário e sessão** | Supabase **Auth** (login). |
| **Arquivos (arquivos em si)** | Supabase **Storage** (bucket, por usuário). |
| **Lista de nomes no preview** | Só na **memória do navegador** (estado da página); não é salva no servidor. |
| **Regras customizadas** | **localStorage** do navegador (chave `nfiles-custom-patterns`). |
| **Seed de exemplo (nomes do ZIP)** | Arquivo estático `frontend/public/seed-files.json` (lista de nomes para demonstração). |

Ou seja: **autenticação e arquivos** estão no Supabase; **preview e regras custom** são locais (navegador).

---

## 6. Conceitos em uma linha

- **Ingestão:** entrada de arquivos (upload para o Storage) e lista do que está no Storage.
- **Regra / padrão:** definição de como transformar “nome atual” em “nome novo” (ex.: Seed completo, Data no início, template customizado).
- **Preview:** tabela “nome atual → nome novo” antes de aplicar; só visualização.
- **Renomear:** ação que aplica o preview no Storage (move/renomeia os arquivos).
- **Resolução de conflitos:** se a regra gerar o mesmo nome novo para dois arquivos, o sistema adiciona `_1`, `_2`, etc., antes da extensão.
- **Seed do repositório:** lista de nomes de exemplo (vinda do ZIP do projeto) para testar o preview sem depender do Storage.

---

## 7. Referências

- **Visão geral e estado atual:** `project-overview.md`
- **Motor de padrões e regras:** `motor-escolha-padroes.md`
- **Fluxo de dados (origem/destino):** `data-flow.md`
- **Termos e entidades:** `glossary.md`
