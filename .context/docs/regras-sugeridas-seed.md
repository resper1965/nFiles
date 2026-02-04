---
type: doc
name: regras-sugeridas-seed
description: Regras de nomenclatura sugeridas pela usuária do seed (n.files / ness)
category: reference
generated: 2026-02-04
---

# Regras sugeridas pelo seed

Regra de nomenclatura sugerida pela **usuária do seed existente**, guardada para referência e possível uso como padrão ou template no n.files.

---

## Padrão: nomes em letras maiúsculas

**ATENÇÃO:** Nomear com **letras maiúsculas** com o seguinte **índice da regra**:

1. **RAZÃO SOCIAL DO CLIENTE:** ex.: INGREDION  
2. **NOME DA OPERADORA:** ex.: UNIMED NACIONAL  
3. **TIPO DE DOCUMENTO:** CONTRATO, ADITAMENTO, CARTA, PROPOSTA COMERCIAL etc  
4. **OBJETO DO DOCUMENTO:** ex.: RENOVAÇÃO, REAJUSTE, ALTERAÇÃO DE REEMBOLSO  
5. **DATA DE EMISSÃO DO DOCUMENTO:** DIA/MÊS/ANO  

Esses dados podem ou não fazer parte do título atual; a IA lê o conteúdo do documento (PDF/DOCX) para extrair e gerar o nome.  

---

## Exemplo de nome gerado

`INGREDION | UNIMED NACIONAL | CONTRATO | RENOVAÇÃO | 04/02/2026`

(ou com TERMO DE ADITAMENTO, CARTA, PROPOSTA COMERCIAL e descrições conforme o documento.)

---

## Uso no n.files

- Esta regra pode ser usada como **template** ou **melhor prática** para regras de renomeação no sistema (ex.: padrão por campos separados por ` | `, maiúsculas, data no final).
- O seed do repositório (ex.: Ingridion - Contrato e Aditivos.zip) está alinhado a esse contexto (Ingredion, contratos/aditivos).
