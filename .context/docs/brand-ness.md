---
type: doc
name: brand-ness
description: Cores e identidade visual do branding ness (n.files)
category: design
---

# Brand ness (n.files)

**ness** é a marca; **n.files** é o produto/sistema.

## Tipografia das marcas "ness." e "n.files"

- **Fonte:** Montserrat Medium (peso 500).
- **Partes de texto** ("ness", "n", "files"): cor do texto (preto em fundo claro, branco em fundo escuro) — usa `text-foreground`, `text-sidebar-foreground` ou `text-muted-foreground` conforme o contexto.
- **"." (ponto):** cor **#00ade8** (variável CSS `--color-ness-dot` em `frontend/app/globals.css`). O ponto obedece à mesma regra em "ness." e "n.files".

Componentes em `frontend/components/ness-brand.tsx`: **NessBrand** ("ness.") e **NFilesBrand** ("n.files"). Fonte carregada em `app/layout.tsx` (Google Fonts).

## Cores do branding

Paleta mínima usada na aplicação (CSS variables em `frontend/app/globals.css`).

| Uso | Variável | Light | Dark | Nota |
|-----|----------|--------|------|------|
| **Primary** (botões, links, destaque) | `--primary` | `#1a3a5c` | `#7eb8da` | Azul ness — confiança, foco |
| **Primary foreground** | `--primary-foreground` | `#f0f7fc` | `#0f172a` | Texto sobre primary |
| **Sidebar primary** (item ativo) | `--sidebar-primary` | `#1a3a5c` | `#5b9fd4` | Mesmo tom, sidebar |

Valores em OKLCH (usados no CSS) para melhor consistência e acessibilidade.

- **Primary light:** `oklch(0.32 0.06 250)` (azul escuro)
- **Primary dark:** `oklch(0.72 0.08 235)` (azul claro)
- **Sidebar primary dark:** `oklch(0.62 0.1 235)`

Se a marca tiver cores oficiais (ex.: hex da Ingredion ou outro guia), atualizar este doc e `globals.css` para refletir.
