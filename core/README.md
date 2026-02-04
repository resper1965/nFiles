# Core — n.files (ness)

Motor de regras, modelo da árvore de arquivos e persistência do **n.files**.

## Responsabilidades

- **Motor de regras:** interpretar regras (melhores práticas por padrão + ingerência do usuário); gerar mapeamento (atual → novo); quando a regra exigir, **ler** conteúdo ou metadados do arquivo para avaliar o nome; validar nomes para Windows.
- **Leitor de arquivos:** ler conteúdo ou metadados do arquivo quando a regra precisar para definir o nome (ex.: EXIF, metadados de documento).
- **Modelo file manager:** estrutura da aplicação onde os **arquivos renomeados** são **inseridos** após a ingestão; persistir e expor para o frontend.
- **Árvore de arquivos:** modelo da pasta raiz e subpastas; metadados (regras, histórico); integração com o file manager.
- **Persistência:** salvar/carregar regras, vínculo com a árvore e estado do file manager (e opcionalmente histórico).

## Stack

A definir (ex.: Node/TypeScript, Python). Deve permitir acesso ao sistema de arquivos Windows. Não adotar novas tecnologias sem consentimento.
