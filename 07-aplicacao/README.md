# Aula 7 — Pequena aplicação

```sh
npm run aula7
npm run aula7 -- data-invalida
npm run aula7
```

- `nota-sintetica.mjs`: cria uma nota nova usando a fixture da aula 5.
- `servico-xml.mjs`: abre o emissor, constrói TNFe, gera XML, confere o resultado, converte erros em diagnóstico e aguarda o fechamento.
- `app.mjs`: escolhe o cenário, apresenta mensagem/orientação, decide o código de saída e grava os bytes em arquivo exclusivo.

Esperado: 0/1/0; dois XMLs novos no total. A falha de data não grava arquivo. Se o fechamento falhar, o serviço devolve falha sem bytes e a aplicação não salva. Argumentos desconhecidos também terminam com código 1.

A função de fábrica injetável no serviço existe apenas para testar falhas de inicialização/fechamento sem credenciais ou alterações na instalação. O caminho normal usa `criarEmissor` real. `npm test` também exercita o runtime real e inspeciona os arquivos.

Este é um exemplo equivalente reconstruído do roteiro canônico da aula 7. O fonte exato filmado não estava disponível no material recuperado. Reutiliza a fixture original da aula 5, mantém o contrato descrito (serviço/entrada/dados, sucesso/falha/recuperação, fechamento antes de salvar) e usa UUID no nome para evitar colisões.
