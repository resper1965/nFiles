# Frontend — n.Files (ness)

Interface do usuário do sistema de **gestão de documentos** **n.Files**.

## Stack

- **Next.js 16** (App Router), **React 19**, **TypeScript**, **Tailwind CSS 4**
- **shadcn/ui** (componentes: Button, Input, Card, Sidebar, etc.)
- Deploy na **Vercel** (definir Root Directory = `frontend` no projeto)

## Responsabilidades

- **Tela de ingestão** — ingestão de arquivos em **lote** ou **unitária** (upload/drag-and-drop ou seleção).
- **Botão de renomeação** — disparo explícito da aplicação das regras (preview e execução); após aplicar, os arquivos renomeados são inseridos no **modelo file manager** da aplicação.
- Criação/edição de **regras** (melhores práticas por padrão, **ingerência do usuário** permitida).
- Visualização da **árvore**, do **file manager** (itens renomeados inseridos) e **busca** (árvore + regras + resultados + file manager).
- **Preview** das renomeações (nome atual → nome novo) antes de aplicar.

## Rotas

- `/` — página inicial (link para dashboard).
- `/dashboard` — dashboard com link para File manager.
- `/dashboard/file-manager` — File manager (ingestão, busca, regras, preview).

## IA (Gemini)

- **API:** `POST /api/ai/suggest` — body: `{ type: "suggest-name" | "suggest-rule", payload: { currentName?, context? } }`; resposta: `{ suggestion: string }`. Chave `GEMINI_API_KEY` só no servidor (`.env.local` ou Vercel).
- **UI:** botões **"Sugerir nome com IA"** (na ingestão) e **"Sugerir regra com IA"** (nas regras) na página File manager; componente `components/suggest-with-ai.tsx`.

## Como rodar

```bash
pnpm install
pnpm dev
```

Abrir [http://localhost:3000](http://localhost:3000). Para build de produção:

## Testes

Testes unitários com **Vitest** (lógica de padrões e persistência de regras custom).

```bash
pnpm test        # modo watch
pnpm test:run    # execução única
```

Arquivos de teste: `lib/patterns.test.ts`, `lib/custom-patterns-storage.test.ts`.

```bash
pnpm build
pnpm start
```

## Deploy (Vercel)

O app está na pasta `frontend/`. No projeto Vercel **n-files**, em **Settings** → **General** → **Root Directory**, defina **`frontend`**. Ver `../.context/docs/env-config-vercel.md`.
