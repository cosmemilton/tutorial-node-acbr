# Aula 6 — Diagnóstico e recuperação

```sh
npm run aula6
npm run aula6 -- data-invalida
npm run aula6
```

Esperado: códigos 0, 1, 0. O cenário intermediário acrescenta `Z` somente à nota daquela execução. O diagnóstico informa `DATA_HORA_INVALIDA`, campo `TNFe.Ide.dEmi`, mensagem amigável e orientação de data/hora civil `AAAA-MM-DDTHH:mm:ss`, sem Z/offset. Não grava XML nesse cenário. A terceira execução parte de dados novos e gera novamente.

O runner e a fixture foram recuperados da versão corrigida do pacote de captura da aula 6. Adaptação: argumento `data-invalida` no fim da fixture para repetir a falha sem editar o arquivo à mão. O runner mantém o comportamento original.

A criação do emissor fica dentro de `try`; `emissor?.fechar()` permite diagnosticar falhas antes da inicialização completa. O teste automatizado da aula 7 simula falha de criação e de fechamento. Não é necessário estragar a instalação para demonstrar esses caminhos.
