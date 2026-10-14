# Tutorial Node + ACBr

Arquivos de apoio para as sete aulas, em português. SDK fixado em **cosmemilton-acbr-node 0.1.2**, com lockfile e runtime opcional da plataforma. Exemplos pequenos, executados pelo terminal, sem servidor ou framework.

> Exercício exclusivamente local com dados sintéticos públicos. Não usar os identificadores de teste em produção. Não configura certificado A1 ou CSC, não assina, não transmite e não consulta a SEFAZ. Gerar XML não comprova validade fiscal, validação de schema ou autorização de uso.

## Aulas

1. [Introdução, compiladores e licenças](01-introducao/README.md)
2. [Instalação e importação no Windows](02-windows/README.md)
3. [Instalação no Ubuntu / WSL2](03-ubuntu-wsl2/README.md)
4. [CLI: campos, tipos, coleções e erros](04-cli/README.md)
5. [Geração de XML local](05-xml-local/README.md)
6. [Diagnóstico, data inválida e recuperação](06-diagnostico/README.md)
7. [Aplicação: fixture, serviço e entrada](07-aplicacao/README.md)

## Começar

Pré-requisitos do SDK: Node.js **22.12 ou superior**, npm, Windows x64 ou Linux x64/glibc (Ubuntu 24.04 é a referência documentada pelo SDK). Instale Node de [nodejs.org](https://nodejs.org/). ARM64 e Alpine/musl não estão cobertos por estes exemplos. Git é opcional se baixar o ZIP do GitHub.

```sh
git clone https://github.com/cosmemilton/tutorial-node-acbr.git
cd tutorial-node-acbr
npm ci --ignore-scripts --no-audit --no-fund
npm run verificar
npm test
npm run aula7
npm run aula7 -- data-invalida
npm run aula7
```

Execute na raiz do repositório. Não use `--omit=optional`: o motor nativo é uma dependência opcional por plataforma. Os scripts não precisam de compiladores nem de `.env`. O XML é gravado no diretório de trabalho com nome novo e fica ignorado pelo Git.

Sequência esperada na aula 7: códigos de saída **0, 1, 0**. A execução com data inválida não grava XML. Veja o código logo após cada comando: `$LASTEXITCODE` no PowerShell ou `echo $?` no Bash. `npm test` inclui testes de integração que carregam o runtime real e verificam essa sequência.

## Origem e limites

- Aulas 5 e 6: recuperadas dos arquivos de captura; adaptação da aula 6 documentada na pasta.
- Aula 7: exemplo equivalente reconstruído a partir do roteiro, sem alegar identidade com o código filmado.
- Aulas 1–4: guias de apoio reconstituídos do contrato da versão 0.1.2; não são transcrições dos vídeos.
- [Validação realizada e diferenças](docs/VALIDACAO.md).
- [Documentação do SDK](https://miltonjunior.dev.br/acbr-node/), [fonte do SDK](https://github.com/cosmemilton/acbr-node) e [pacote npm 0.1.2](https://www.npmjs.com/package/cosmemilton-acbr-node/v/0.1.2).

## Licenças e segurança

O pacote 0.1.2 declara LGPL-2.1-or-later; consulte seus arquivos `LICENSE`, `NOTICE` e as licenças do runtime instalado. Isso não equivale a uma licença nova para todo este repositório. Nenhuma licença genérica foi atribuída ao material autoral sem decisão do titular. Consulte os termos aplicáveis antes de redistribuir ou incorporar componentes em produto comercial; este tutorial não fornece parecer jurídico.

Não envie certificados, senhas, tokens, CSC, documentos reais, `.env`, `node_modules` ou vídeos ao repositório. O `.gitignore` é uma proteção auxiliar, não um verificador de segredos. Revise sempre os arquivos antes de um commit.
