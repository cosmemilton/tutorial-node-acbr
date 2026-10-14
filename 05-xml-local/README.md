# Aula 5 — XML local

```sh
npm run aula5
```

`nota-sintetica.mjs` contém a fixture pública sintética. `gerar-local.mjs` cria o emissor em ambiente 2, constrói `TNFe`, aguarda `gerarXml`, verifica sucesso/estado/conteúdo, salva um arquivo novo e fecha o emissor no `finally`.

Esperado: `sucesso: true`, `estado: XML_GERADO`, diagnóstico `ETAPA_LOCAL_CONCLUIDA` e `nota-local-sintetica-<tempo>.xml`. A inspeção limitada exige NFe e rejeita assinatura/protocolo. Não substitui validação XML/schema ou regras fiscais.

Estes dois arquivos foram recuperados do pacote de captura da aula 5, sem mudança funcional. A data usa o dia UTC da execução com hora civil fixa 12:00:00 para o exercício. Não é um relógio de emissão de produção. A fixture não deve ser transmitida, mesmo em homologação.

No exemplo original, a gravação acontece antes do fechamento; se o fechamento falhar, o código será 1 mas o arquivo pode existir. A [aula 7](../07-aplicacao/README.md) concentra o ciclo de vida no serviço e só libera bytes após o fechamento.
