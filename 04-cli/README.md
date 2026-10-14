# Aula 4 — Consultar o contrato

Depois de `npm ci`, execute na raiz:

```sh
npx --no-install acbr-node --help
npx --no-install acbr-node help TAG Ide.tpNF
npx --no-install acbr-node help TAG 'Det[].Imposto.PIS.CST' --json
npx --no-install acbr-node help TAG 'Det[].Prod.vProd' --json
npx --no-install acbr-node help TAG CampoInexistente
```

Aspas preservam `[]` no Bash e PowerShell. O último comando falha intencionalmente, com código diferente de zero e “O campo não existe nesse objeto do contrato.”

`Ide.tpNF` é um enum com `tnEntrada`/`tnSaida`. `Det[]` indica uma coleção; o help resolve o tipo do campo de cada item. `vProd` usa string decimal; não substitua valores monetários por cálculos binários imprecisos. Em JSON, confira `sdkVersion: 0.1.2`, tipo de entrada, valores e caminho resolvido.

O help consulta o contrato instalado, offline, sem certificado ou runtime. Ele explica o formato da API e não determina enquadramento tributário nem valida as regras fiscais do documento.
