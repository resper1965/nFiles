# Seed — n.files (ness)

Dados de seed do repositório para demonstração e preenchimento do preview no n.files.

## Origem

- **Arquivo:** `Ingridion - Contrato e Aditivos.zip` (raiz do projeto).
- **Conteúdo:** Contratos e aditivos (Ingredion/Unimed); nomes de arquivos usados como lista de exemplo no File manager.

## Arquivos

| Arquivo | Descrição |
|---------|------------|
| `files-from-zip.json` | Lista de nomes de arquivos extraída do ZIP. Contém `source`, `description`, `count` e `files` (array de strings). |
| `README.md` | Este arquivo. |

## Uso no frontend

- O frontend expõe `frontend/public/seed-files.json` (cópia de `files-from-zip.json`).
- Na página File manager, no card **Preview**, o botão **"Usar seed do repositório"** carrega essa lista e preenche a tabela nome atual → nome novo (sem duplicar itens já presentes).

## Regenerar o seed

Se o ZIP na raiz for atualizado, regenere o JSON:

```bash
# Na raiz do projeto (Ingridion)
python3 -c "
import zipfile
import json
z = zipfile.ZipFile('Ingridion - Contrato e Aditivos.zip', 'r')
names = sorted([n for n in z.namelist() if not n.endswith('/')])
z.close()
seed = {
  'source': 'Ingridion - Contrato e Aditivos.zip',
  'description': 'Lista de nomes de arquivos do seed (contratos/aditivos Ingredion).',
  'count': len(names),
  'files': names
}
with open('.context/seed/files-from-zip.json', 'w', encoding='utf-8') as f:
    json.dump(seed, f, ensure_ascii=False, indent=2)
print('OK', len(names), 'files')
"
cp .context/seed/files-from-zip.json frontend/public/seed-files.json
```

## Referências

- `regras-sugeridas-seed.md` — padrão de nomenclatura sugerido para o seed.
- `project-overview.md` — seed do sistema.
