# Validação desta entrega

Data: 14/10/2026. Ambiente: Debian GNU/Linux 13, x64/glibc, Node 24.19.0. Instalação limpa via npm de SDK e runtime Linux **0.1.2**, sem scripts de instalação, sem patches no pacote. Lockfile inclui as dependências opcionais Linux e Windows.

Executado:

- Importação das APIs e inspeção de versão/plataforma.
- CLI `--help`, enum `Ide.tpNF`, coleção `Det[].Imposto.PIS.CST` e erro de campo inexistente.
- Aula 5: geração real de XML local, saída 0.
- Aulas 6 e 7: sucesso, data com Z, recuperação; saídas 0/1/0; falha sem XML novo.
- `npm test`: 9 testes, 9 aprovados; inclui testes de integração real e testes isolados com fábrica simulada para falha de criação, fechamento, entrada inválida e resultado sem XML.
- Inspeção limitada dos XMLs: NFe presente, assinatura/protocolo ausentes.

Não executado nesta entrega: Windows, instalação WSL2, Ubuntu 24.04, ARM64, Node 22.12, compilação do motor, XSD/regras fiscais completas, certificado, assinatura, transmissão, consulta ou autorização fiscal. Não há workflow CI remoto; os resultados acima são da execução local na nuvem.

## Proveniência

Aula 5: `exemplo/gerar-local.mjs` e `exemplo/nota-sintetica.mjs` do pacote de capturas da aula 5. Aula 6: `sources/fixed/tratar-erro-local.mjs` e `sources/fixed/nota-video6.mjs` do pacote da aula 6; adicionou-se seleção de data inválida via argumento.

A fixture cita o fonte público `test/native-fixtures.mjs`, blob `951e1a118d36da5a64dbe9ea0692ceac775c2390`, do projeto [cosmemilton/acbr-node](https://github.com/cosmemilton/acbr-node). Identificadores e nomes são os dados sintéticos usados nas capturas, não dados de contribuinte fornecidos pelo usuário.

Aula 7 foi reconstruída do roteiro; não foi recuperado o código exato da captura. Guias 1–4 foram reconstituídos usando a versão instalada 0.1.2. Não foram incluídos vídeos, capturas, arquivos pessoais ou binários.
