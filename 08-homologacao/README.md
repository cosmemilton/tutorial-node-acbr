# Aula 8 — Preparação para homologação

Exercício estritamente local com dados sintéticos. **NÃO TRANSMITIR a fixture, mesmo em homologação.** Não usa A1, senha, CSC, assinatura ou comunicação com a SEFAZ.

Após instalar as dependências pela orientação da raiz, execute:

```sh
node 08-homologacao/preflight.mjs
npm test
```

O script reutiliza a fixture CE da aula 5, inventaria os schemas do manifesto, confere ambiente 2 e consistência básica de CNPJ/UF, gera XML sem assinatura e chama a validação local. O emissor é fechado em `finally`. Não grava XML ou outros arquivos.

Na execução Linux x64 com SDK/runtime 0.1.2:

```text
SDK: 0.1.2 | Plataforma: linux x64
Schemas no manifesto: 201
Configuração e fixture: HOMOLOGAÇÃO | CE | modelo 55
Geração local: XML_GERADO | tpAmb=2 | sem assinatura
Validação do documento sem assinatura: XML_SCHEMA_INVALIDO
Status desta operação: nao_enviado
Nenhum certificado carregado. Nenhuma chamada de transmissão.
```

Código de saída 0 significa que **o exercício observou o resultado esperado**, não que a nota foi validada. Resultados inesperados e falhas do runtime encerram com erro. A contagem de schemas é um inventário desta versão, não uma garantia de validade. A primeira operação confere a integridade do runtime.

## Interpretar a validação

O XSD exige `Signature`; por isso o documento sem assinatura falha na validação. `XML_SCHEMA_INVALIDO` não comprova que essa seja a única falha e não significa necessariamente schemas ausentes. Não ignore esse diagnóstico em um fluxo real.

O fluxo completo é gerar → assinar → validar o XML assinado. A validação pública verifica schema e assinatura. Exija sucesso e estado `VALIDADO`, preservando os bytes assinados. Validação local não equivale a autorização fiscal; envio e resposta da SEFAZ são etapas separadas.

## Checklist para preparar o próximo passo

- Ambiente numérico `2`; no modelo de entrada, `Ide.tpAmb: 'taHomologacao'`.
- CNPJ, UF, município e identidade do emitente coerentes com a nota. Para PE, adapte todos os dados relacionados; trocar somente `CE` por `PE` não basta.
- Runtime completo da plataforma, com schemas e serviços da mesma versão. Não há campo público `schemasPath`; não misture arquivos nem desative verificações.
- Emitente, destinatário, itens, códigos fiscais, tributos e totais revisados com o responsável fiscal.
- Série e número controlados. O exemplo não reserva numeração na SEFAZ.
- A1 adequado, válido e correspondente ao emitente, com entrada protegida de credenciais.

A API 0.1.2 aceita `certificado: { pfx: bytesDoA1, senha: senhaSegura }` ou `{ arquivo: caminhoLocal, senha: senhaSegura }`. `pfx` é `Uint8Array`/`Buffer`, não caminho nem texto base64. Os nomes são apenas placeholders; nada disso é executado neste exercício. Não grave senha no código, Git, argumentos ou vídeo. `criarEmissor` sozinho não comprova o funcionamento do A1.

## O que foi testado

Em 14/10/2026: preflight executado e repetido em Linux x64, SDK/runtime 0.1.2; geração local, ambiente 2, ausência de assinatura e falha de schema esperada. Teste automatizado verifica essas saídas e ausência de arquivos criados.

Não testados nesta aula: Windows, A1 real, assinatura real, validação do documento assinado, transmissão, consulta ou autorização. Os painéis do vídeo são didáticos e reproduzem a saída real do preflight; não são capturas de editor Windows.

Fontes: `docs/API.md`, `docs/CLI.md`, `native/NativeMotor.pas` do pacote 0.1.2 e `schemas/leiauteNFe_v4.00.xsd` do runtime correspondente. [Documentação do SDK](https://miltonjunior.dev.br/acbr-node/) e [fonte do SDK](https://github.com/cosmemilton/acbr-node).
