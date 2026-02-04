---
type: doc
name: motor-escolha-padroes
description: Motor de escolha de padrões de nomenclatura, mantendo vínculo com melhores práticas (n.files)
category: architecture
generated: 2026-02-04
---

# Motor de escolha de padrões — n.files (ness)

O n.files terá um **motor de escolha de padrões**: o usuário escolhe ou compõe um padrão de nomenclatura (ex.: template do seed, genérico ou customizado), **sem perder a conexão com as melhores práticas**. Ou seja: qualquer padrão escolhido passa pela mesma camada de validação e boas práticas antes de ser aplicado.

## Objetivo

- Oferecer **escolha** entre padrões (seed, genéricos, customizados) na UI.
- Garantir que **todos** os padrões obedeçam às **melhores práticas** (caracteres válidos no Windows, sem conflitos, nomes legíveis).
- Permitir **ingerência do usuário**: o usuário pode editar o padrão escolhido; a edição continua validada pelas mesmas regras.

## Componentes

| Componente | Função |
|------------|--------|
| **Catálogo de padrões** | Lista de padrões disponíveis: (1) **Padrão seed** — índice: RAZÃO SOCIAL DO CLIENTE \| NOME DA OPERADORA \| TIPO DE DOCUMENTO \| OBJETO DO DOCUMENTO \| DATA DE EMISSÃO DO DOCUMENTO (ver `regras-sugeridas-seed.md`); a IA pode extrair do conteúdo; (2) **Padrões genéricos** — ex.: data no início, slug; (3) **Padrões customizados** — salvos pelo usuário. |
| **Escolha na UI** | Tela ou painel onde o usuário **seleciona** um padrão (dropdown, cards, etc.) ou **monta** um padrão a partir dos campos do índice (razão social do cliente, nome da operadora, tipo de documento, objeto do documento, data de emissão). O padrão escolhido vira uma **regra** (ou template de regra). |
| **Validação (melhores práticas)** | **Sempre** aplicada após a escolha: caracteres permitidos no Windows; tamanho máximo; ausência de caracteres proibidos (`\ / : * ? " < > \|`); sem conflitos (nomes duplicados); padrão legível. Se o padrão escolhido gerar nome inválido, o sistema corrige ou avisa e o usuário pode ajustar (ingerência). |
| **Motor de regras** | Recebe o padrão (escolhido + eventual edição do usuário) e gera o mapeamento nome atual → nome novo; usa a mesma validação acima. |

## Fluxo

1. Usuário **escolhe** um padrão no motor de escolha (seed, genérico ou customizado) ou **monta** um a partir de campos.
2. O sistema **valida** o padrão contra as melhores práticas; se algo for inválido, sugere correção ou exibe aviso.
3. O usuário pode **editar** (ingerência) o resultado; a edição passa de novo pela validação.
4. O padrão aprovado vira **regra** aplicável na ingestão; o motor de regras gera o preview e, após o botão de renomeação, insere no file manager.

## Melhores práticas (sempre aplicadas)

- **Windows:** apenas caracteres permitidos; sem `\ / : * ? " < > \|`; tamanho adequado (ex.: até 255 caracteres no nome).
- **Conflitos:** não gerar dois arquivos com o mesmo nome no mesmo diretório; resolver com sufixo (ex.: numeração) se necessário.
- **Legibilidade:** preferir separadores consistentes (ex.: ` | ` no padrão seed); maiúsculas/minúsculas conforme o padrão escolhido.

## Conexão com o seed

- O **padrão sugerido pelo seed** (ver `regras-sugeridas-seed.md`) é um dos padrões disponíveis no catálogo; o usuário pode escolhê-lo como base e editar (ingerência), mantendo as melhores práticas.

## Implementação atual

- **Catálogo:** quatro padrões built-in (Seed RAZÃO | DATA, Seed completo, Data no início, Slug) + **padrões customizados** criados via **Nova regra** (persistidos em `localStorage`, chave `nfiles-custom-patterns`).
- **Escolha na UI:** seletor de padrão (dropdown) no card Regras; para o padrão "Seed completo", formulário opcional (Razão social do cliente, Nome da operadora, Tipo de documento, Objeto do documento; data de emissão preenchida automaticamente). Card "Sugerir nome com IA": ao selecionar um arquivo na árvore, a IA lê o conteúdo do documento (PDF/DOCX) para extrair os campos do índice e sugerir o nome.
- **Nova regra:** formulário em Sheet lateral (Nome do padrão + Template). O template usa placeholders `{nome}`, `{data}`, `{indice}`; a extensão do arquivo é sempre preservada. Validação exige ao menos um placeholder. Regras custom podem ser removidas quando selecionadas (botão "Remover regra").
- **Validação:** `sanitize()` remove caracteres inválidos no Windows e limita a 255 caracteres; **resolução de conflitos** (`resolveNameConflicts`) garante que nenhum "nome novo" se repita no mesmo diretório, inserindo sufixo `_1`, `_2`, … antes da extensão quando necessário.
- **Preview e Renomear:** o preview usa o padrão selecionado (built-in ou custom) para gerar "nome novo"; o botão "Renomear" aplica as renomeações no Supabase Storage (move) e atualiza a lista da ingestão.

## Referências

- `regras-sugeridas-seed.md` — padrão do seed
- `glossary.md` — regras de renomeação, melhores práticas, ingerência
- `architecture.md` — motor de regras
