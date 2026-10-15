# Aula 9 — Da assinatura ao retorno de homologação

Material complementar do SDK **cosmemilton-acbr-node 0.1.2**. O exercício executável é uma **SIMULAÇÃO DIDÁTICA**, criada do zero: usa somente estados, códigos de retorno públicos e indicadores booleanos. Não importa o SDK, não lê documentos ou configuração, não carrega certificado, não faz rede e não grava arquivos. Não contém uma nota fiscal de teste para transmitir.

**Não transmita as fixtures das aulas anteriores, nem mesmo em homologação.** O cenário `autorizado_simulado` não comprova autorização fiscal. Nenhum dado da execução privada foi copiado para os exemplos.

## Executar

Na raiz do repositório, com Node.js 22.12 ou superior:

```sh
node 09-homologacao/demonstracao.mjs
node --test test/homologacao-fluxo.test.mjs
```

Esses dois comandos funcionam sem `npm install` e sem o runtime nativo. Para executar também os testes das aulas anteriores, instale as dependências conforme o [README principal](../README.md) e rode `npm test`.

A saída inclui:

```text
SIMULAÇÃO DIDÁTICA | dados criados do zero | nenhuma operação fiscal real
Fluxo conceitual: gerar -> assinar -> validar -> transmitir (com autorização explícita)
Sem autorização representada: aguardar_autorizacao_explicita
Cenário simulado autorizado: autorizado_simulado
Cenário simulado pendente: conferir_situacao_sem_retransmitir
Cenário simulado indeterminado: conferir_situacao_sem_retransmitir
Cenário simulado rejeitado: revisar_diagnostico_sem_retransmitir
Cenário simulado inconsistente: conferir_situacao_sem_retransmitir
```

O código de saída 0 informa que o programa didático terminou. Os resultados acima foram escolhidos no código, não recebidos da SEFAZ.

## O fluxo real, separado do exercício

A [aula 8](../08-homologacao/README.md) demonstrou geração local e a falha esperada ao validar XML sem assinatura. Para um documento real, a sequência é:

1. **Gerar:** conferir `sucesso === true`, `estado === 'XML_GERADO'` e a presença do XML retornado.
2. **Assinar:** usar o A1 adequado em ambiente privado. Conferir `sucesso === true`, `estado === 'ASSINADO'` e o XML assinado retornado; persistir esses bytes com proteção de acesso.
3. **Validar o XML assinado:** exigir `sucesso === true` e `estado === 'VALIDADO'`. O método `validar` não precisa devolver outro XML: preserve o documento assinado já obtido. Validação local não é autorização de uso.
4. **Transmitir somente com autorização explícita do responsável:** confirmar ambiente `2`, documento e numeração revisados, identidade coerente e bytes assinados preservados. Uma autorização para o tutorial não é autorização para enviar qualquer documento. A demonstração nunca chama essa operação, mesmo quando recebe `autorizacaoExplicita: true`.
5. **Interpretar o retorno e conferir a correlação:** cruzar sucesso, estado, código, identidade do documento, ambiente e protocolo antes de concluir. Guardar documentos e evidências localmente com acesso restrito.

O SDK recebe XML UTF-8 nas operações `assinar`, `validar` e `transmitir`; o campo `xmlBase64`, quando presente na resposta, carrega os bytes retornados. Não substitua o XML assinado por uma versão reformatada, alterada ou regenerada. Nem todo `xmlBase64` contém um `nfeProc`: confira o tipo de resposta efetivamente recebido.

Esta aula ensina a sequência e os critérios. Não fornece uma implementação de assinatura, envio, armazenamento fiscal ou conferência criptográfica.

## Sucesso não é sinônimo de autorização

- `sucesso: true` também aparece em operações locais. Sempre confira o `estado` esperado da operação.
- Para a transmissão de NF-e tratada aqui, o motor 0.1.2 classifica `cStat` 100 ou 150 como `AUTORIZADO` e exige identidade/protocolo. Isso não dispensa correlação com o documento enviado e o ambiente.
- `PENDENTE`, recibo de lote, lote processado isoladamente e `INDETERMINADO` não comprovam autorização da nota. Consulte a situação usando a identidade correta antes de decidir um novo envio.
- Timeout ou interrupção após possível início de envio não provam que nada foi transmitido. Não repita automaticamente.
- `REJEITADO` ou `DENEGADO` exigem leitura do diagnóstico e tratamento adequado; não há reenvio automático neste exemplo.
- Retorno contraditório ou evidência incompleta também exige conferência. O cenário `inconsistente` demonstra `sucesso: true`, `AUTORIZADO` e `cStat: 100` com uma correlação marcada como falsa.

No SDK, `diagnostico.statusEnvio` descreve **a operação atual**. `nao_enviado` não prova ausência de envios anteriores. Prefira o diagnóstico sanitizado para telas e logs; não imprima o resultado bruto, XML, chave, protocolo ou erros brutos.

## O que é o nfeProc

Conceitualmente, o documento processado reúne:

```text
nfeProc (versão 4.00)
  NFe: documento assinado
  protNFe: protocolo correspondente
    infProt: dados de identificação, ambiente e situação
```

`representarEstruturaSimulada()` retorna apenas um desenho lógico em JavaScript com nomes de elementos e indicadores de presença. Ele não é XML, não é uma entrada aceita pelo SDK, não passa em XSD e não representa um documento autorizado.

No fluxo real, verifique em ambiente privado:

- Presença e estrutura de `nfeProc`, `NFe` e `protNFe`.
- A chave do documento assinado, a chave do protocolo e a identidade da resposta referem-se à mesma nota.
- O protocolo recebido corresponde ao protocolo guardado no documento processado.
- O ambiente é homologação no documento, no protocolo e na configuração.
- A assinatura é válida e o conteúdo assinado foi preservado. Não compare o hash do envelope inteiro ao hash da NF-e isolada: são artefatos diferentes.
- O arquivo salvo corresponde aos bytes esperados para aquele artefato, com hash conferido, e o `nfeProc` passa no schema aplicável da mesma versão.

Hash confirma integridade dos bytes comparados; XSD confirma estrutura. Nenhum deles, isoladamente, comprova autorização fiscal ou substitui a assinatura e a correlação do retorno.

Os campos `chaveCorrelacionada`, `protocoloCorrelacionado`, `hashConferido` e semelhantes são **booleans fictícios do exercício**. `xmlPresente` é outro indicador didático. Não são campos da API 0.1.2 nem verificadores reais. Todos podem ser escritos como `true` sem possuir qualquer evidência: por isso este código não pode decidir a situação de um documento real.

## O que foi verificado

O exercício cobre: ordem das etapas; bloqueio sem autorização representada; ambiente 2; falhas locais; estados/códigos contraditórios; ausência de cada verificação; pendência; resultado indeterminado; rejeição; isolamento das fixtures; execução sem dependências e sem arquivos novos. Os testes usam o modelo de permissões do Node para bloquear gravações e revisam os imports; não substituem uma auditoria de segurança.

Em um ensaio privado separado que motivou esta aula, foi confirmado: assinatura e validação do XML assinado; uma única transmissão manual em ambiente 2; resposta `AUTORIZADO` com `cStat: 100`; ausência de pendência ou retransmissão; e `nfeProc` salvo com correlação, hash e XSD conferidos localmente. Esse resumo não publica o documento nem suas evidências privadas, e não é reproduzido pela simulação.

Nenhum XML real, certificado, credencial, identidade fiscal, chave de acesso, número de protocolo, assinatura, QR ou caminho privado pertence ao material público. O exemplo não foi validado como aplicação de emissão e não deve ser adaptado para produção sem revisão técnica e fiscal.

## Referências da versão

Contrato consultado no pacote npm 0.1.2: `docs/API.md`, `dist/types/src/types.d.ts` e `native/NativeMotor.pas`. Consulte a [documentação do SDK](https://miltonjunior.dev.br/acbr-node/), o [código-fonte](https://github.com/cosmemilton/acbr-node) e o [pacote fixado em 0.1.2](https://www.npmjs.com/package/cosmemilton-acbr-node/v/0.1.2). Os nomes de etapas são compatíveis com essa versão; os cenários públicos são mocks parciais, não respostas completas do SDK.
