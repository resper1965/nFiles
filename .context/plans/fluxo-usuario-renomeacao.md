# Plano: fluxo do usuário — renomeação e reorganização

Documento que descreve o **fluxo desejado** pelo usuário e o alinhamento com o que já existe no app.

---

## 1. Fluxo desejado (5 passos)

1. **Autentica** — usuário faz login.
2. **Dá um nome ao projeto** — o nome do projeto é o **nome da pasta raiz** no Storage/file manager. Isso permite **manter vários projetos** por usuário (cada projeto = uma pasta raiz distinta).
3. **Escolhe os arquivos** a serem renomeados e reorganizados **na árvore** — seleção explícita dos itens que participarão do processo (em uma árvore de arquivos dentro do projeto).
4. **Escreve uma regra** e a **IA ajuda a validar**, com aspectos de nomes baseados em **metadados** e/ou **conteúdo do arquivo** — regra de nomenclatura com sugestão/validação por IA, podendo usar metadados (ex.: data, tipo) ou conteúdo (ex.: texto dentro do PDF) para definir o nome.
5. **Massivamente** os arquivos são **copiados** no file manager **com o nome correto** — operação em lote: cópia (não só renomear no lugar) no file manager, com os nomes gerados pela regra.

**Após a criação do resultado**, o usuário pode:
- **Dar download** dos arquivos em **formato ZIP** com **documentação de índices** (ex.: CSV/JSON/MD que mapeia nome original → nome novo, caminho, metadados úteis para referência).
- **Ou usar os arquivos dentro do repositório** — continuar trabalhando com eles no Storage/file manager da aplicação (visualizar, reorganizar, novo lote, etc.).

---

## 2. Mapeamento: fluxo desejado vs estado atual

| Passo | Desejado | Estado atual | Gap |
|-------|----------|--------------|-----|
| **1. Autentica** | Login obrigatório para todo o fluxo. | ✅ Área toda autenticada; redireciona para `/login` se não logado. | Nenhum. |
| **2. Nome do projeto (pasta raiz)** | Usuário **dá um nome ao projeto**; esse nome é o **nome da pasta raiz** no Storage/file manager. Permite **vários projetos** por usuário (cada projeto = uma pasta raiz). | Storage usa prefixo único por usuário (`userId/`); não há conceito de **projeto** nem **pasta raiz nomeada**; um único “espaço” por usuário. | **Projeto** como entidade: nome escolhido pelo usuário = pasta raiz; listar/criar/abrir projetos; paths no Storage como `userId/<nomeProjeto>/...` (ou equivalente). |
| **3. Escolhe arquivos na árvore** | Usuário seleciona, **na árvore** (dentro do projeto), quais arquivos serão renomeados/reorganizados. | Lista plana no Storage (Ingestão + “Usar arquivos do Storage” no File system). Não há **árvore** (pastas/arquivos hierárquicos) nem **seleção** explícita “estes aqui”. | **Árvore de arquivos** no file manager (por projeto); **seleção** (checkboxes ou equivalente) dos itens que entram no lote; possivelmente **reorganização** (mover para pastas). |
| **4. Regra + IA valida (metadados/conteúdo)** | Usuário **escreve** a regra; **IA valida**; nomes podem depender de **metadados** (ex.: data do arquivo, tipo MIME) e/ou **conteúdo** (ex.: texto extraído do PDF). | Regras por **template** (`{nome}`, `{data}`, `{indice}`) e padrões built-in (Seed, Data no início, Slug). IA só em “Sugerir nome” e “Sugerir regra” (texto livre). **Não** há leitura de metadados nem de conteúdo do arquivo para gerar/validar nome. | **Editor de regra** mais rico; **validação por IA** da regra; **leitura de metadados** (Storage/API); **leitura de conteúdo** quando necessário (extração de texto, etc.); uso desses dados na geração e validação do nome. |
| **5. Cópia em massa no file manager com nome correto** | Arquivos são **copiados** em lote no file manager com o **nome correto** (resultado da regra). | **Renomear** (move no Storage) no mesmo “diretório”; não há **cópia** explícita nem **file manager** como destino configurável (só o bucket do usuário). | **Cópia** (não só move/rename) no Storage; file manager como **destino** do resultado (estrutura de pastas?); operação **em massa** já existe, mas o resultado é “renomear no lugar” e não “copiar com nome novo” para um lugar definido. |
| **Pós-resultado: download ou uso no repositório** | Usuário pode **baixar ZIP** com os arquivos + **documentação de índices** (nome original → novo, caminho, etc.) **ou** seguir usando os arquivos **dentro do repositório** (Storage/file manager). | Não há **download em ZIP**; não há **índice/documentação** do lote; arquivos ficam só no Storage (uso “dentro do app” existe como listagem/renomear). | **Exportar como ZIP** (arquivos + opcionalmente estrutura de pastas); **documento de índices** (ex.: `indice.csv`, `manifesto.json` ou `.md`) dentro do ZIP ou junto; opção clara de **continuar no repositório** (file manager) após o lote. |

---

## 3. Conceitos a detalhar

- **Projeto:** o usuário **dá um nome ao projeto**; esse nome é o **nome da pasta raiz** no Storage/file manager (ex.: path `userId/Contrato-2025/` ou `userId/<nomeProjeto>/`). Assim é possível **manter vários projetos** por usuário: cada projeto = uma pasta raiz; listar projetos = listar pastas raiz do usuário; criar projeto = criar pasta com o nome escolhido; trocar de projeto = trocar o contexto (pasta raiz) em que a árvore e o file manager atuam.
- **Árvore:** hoje é lista plana por prefixo do usuário no Storage. Com projetos, a árvore fica **por projeto** (pasta raiz = nome do projeto). “Árvore” implica **pastas e subpastas** (estrutura hierárquica) e, se for o caso, **navegação** por pasta no file manager.
- **Reorganização:** pode significar **mover** arquivos entre pastas e/ou **renomear**; no passo 4 você falou em **copiar** com nome correto — definir se o resultado é “cópia em novo local/pasta” ou “renomear no mesmo lugar” (ou ambos, configurável).
- **File manager como destino:** hoje o “file manager” é a própria listagem/operação no Storage. Aqui seria o **destino** da cópia em massa (ex.: pasta “Renomeados”, estrutura por data, etc.).
- **Metadados/conteúdo:** precisa de **backend ou Edge** para ler arquivo (Storage) e extrair metadados ou conteúdo; a IA consome isso para sugerir/validar o nome.
- **Documentação de índices:** arquivo (CSV, JSON ou MD) que descreve o lote — ex.: nome original, nome novo, caminho no ZIP, data, índice numérico. Pode vir **dentro do ZIP** (ex.: `indice.csv` na raiz) ou como artefato separado para referência.
- **Uso no repositório:** os arquivos resultantes continuam acessíveis no Storage/file manager da aplicação; o usuário pode abrir outro lote, reorganizar ou exportar de novo.

---

## 4. Próximos passos sugeridos (priorização)

1. **Projeto (nome = pasta raiz)**  
   - Introduzir conceito de **projeto**: usuário informa o **nome do projeto**, que vira o **nome da pasta raiz** no Storage (ex.: `userId/<nomeProjeto>/`).  
   - Permitir **vários projetos** por usuário: listar projetos (pastas raiz), criar novo projeto (nome + pasta), abrir/selecionar projeto (contexto atual).  
   - Ingestão e file manager atuam **no projeto selecionado** (toda listagem e escrita sob a pasta raiz do projeto).

2. **Árvore + seleção**  
   - Modelar/listar Storage por **pastas** (prefixos) e exibir como árvore, **por projeto** (pasta raiz = nome do projeto).  
   - Permitir **selecionar** arquivos (e/ou pastas) que entram no lote de renomeação/reorganização.  
   - Manter o preview “nome atual → nome novo” alimentado só pelos itens selecionados.

3. **Regra + IA com metadados/conteúdo**  
   - Definir **quais metadados** usar (ex.: `created_at`, `content-type`, nome atual).  
   - Para **conteúdo**, definir formato (ex.: PDF, DOCX) e onde rodar extração (API route, Edge, worker).  
   - Estender a **IA** (sugerir/validar regra) para receber metadados e, quando possível, trecho de conteúdo, e devolver sugestão/validação de nome.

4. **Cópia em massa com nome correto**  
   - Implementar **cópia** no Storage (ler objeto, gravar com novo nome/path) em vez de só **move**.  
   - Definir **destino** no file manager (ex.: mesma pasta, pasta “Renomeados”, estrutura por data).  
   - Manter operação **em massa** (batch) e feedback de progresso/erro.

5. **Download ZIP + documentação de índices**  
   - Após o lote (cópia com nome correto), oferecer **Download em ZIP**: todos os arquivos do resultado (e opcionalmente estrutura de pastas).  
   - Incluir no ZIP (ou gerar junto) **documentação de índices**: ex.: `indice.csv` ou `manifesto.json` com mapeamento nome original → nome novo, caminho, índice, data.  
   - Definir formato do índice (colunas/campos) e se vai **dentro do ZIP** ou como segundo arquivo (ex.: ZIP + `indice.csv`).

6. **Uso no repositório**  
   - Deixar explícito na UI que, após o lote, o usuário **pode continuar** usando os arquivos no file manager (Storage): visualizar, filtrar, novo lote, exportar de novo.  
   - Opção “Baixar ZIP com índices” vs “Continuar no repositório” (ou ambas) na tela de conclusão do lote.

7. **Documentação**  
   - Atualizar **dinâmica-da-aplicacao.md** quando a árvore, a cópia e o download ZIP estiverem disponíveis.  
   - Registrar decisões: “projeto = pasta raiz”, “cópia vs move”, “destino padrão”, “formato do índice”, “quais metadados/conteúdo são suportados”.

---

## 5. Referências

- `dinamica-da-aplicacao.md` — fluxo atual da aplicação.
- `motor-escolha-padroes.md` — motor de regras e melhores práticas.
- `data-flow.md` — fluxo de dados e integrações.
- `use-ai-in-application.md` — uso de IA no projeto.
