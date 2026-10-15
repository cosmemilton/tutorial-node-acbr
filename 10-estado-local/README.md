# Aula 10 — Estado da aplicação e checklist final

Encerramento da série Node + ACBr. Este exercício foi criado do zero e usa **somente identificadores sintéticos, estados e resultados escolhidos no código**. Não importa o SDK, não usa certificado, não lê XML, não faz rede, não transmite e não consulta situação fiscal. Pode rodar sem `npm install`.

Os estados `NOVO`, `TENTATIVA_INICIADA` e os demais rótulos abaixo são **da aplicação didática**, não uma nova API nem uma garantia fornecida pelo SDK `cosmemilton-acbr-node 0.1.2`. `AUTORIZADO_SIMULADO` não significa autorização de uso. O exercício não reproduz uma resposta completa do SDK.

## Executar

Na raiz do repositório, com Node.js 22.12 ou superior:

```sh
node 10-estado-local/demonstracao.mjs
node --test 10-estado-local/estado-local.test.mjs
```

`demonstracao.mjs` é um alias para `demo.mjs`. A demonstração cria uma pasta temporária nova, executa os cenários e remove somente essa pasta ao terminar. A saída é:

```text
SIMULAÇÃO DIDÁTICA | estado da aplicação | nenhuma operação fiscal
pendente: PENDENTE | tentativas=1
Repetição: BLOQUEADA | nenhum reenvio
timeout: INDETERMINADO | tentativas=1
Repetição: BLOQUEADA | nenhum reenvio
interrompido: TENTATIVA_INICIADA | tentativas=1
Repetição: BLOQUEADA | nenhum reenvio
Arquivo reaberto: INDETERMINADO | tentativas=1
Conferência fictícia: AUTORIZADO_SIMULADO | tentativas=1
Isolamento: ambiente 1=NOVO | ambiente 2=AUTORIZADO_SIMULADO
Ambos os ambientes são simulados. Código de saída 0 não é autorização fiscal.
```

A linha "Arquivo reaberto" demonstra uma nova leitura no mesmo processo. **Os testes de reinício lançam processos Node separados** e verificam que uma nova execução mantém o bloqueio. O código de saída 0 significa apenas que a demonstração terminou.

## Experimento persistente em processos separados

A CLI grava apenas JSON sintético em `saida/aula10`, abaixo do diretório de trabalho. Essa pasta já é ignorada pelo Git. Execute os comandos abaixo, um de cada vez, sempre na mesma raiz:

```sh
node 10-estado-local/app.mjs criar demo-reinicio 2
node 10-estado-local/app.mjs tentar demo-reinicio 2 interrompido
node 10-estado-local/app.mjs estado demo-reinicio 2
node 10-estado-local/app.mjs tentar demo-reinicio 2 autorizado
```

O último comando é **bloqueado com código de saída 2**. A tentativa continua em `TENTATIVA_INICIADA`, com contador 1. Nenhum comando faz envio. `interrompido` é um cenário que deixa a tentativa registrada sem um resultado final; não derruba o processo nem simula fisicamente uma falha de energia.

O comando `criar` usa criação exclusiva: rodá-lo novamente para o mesmo identificador e ambiente falha, sem apagar o estado. Não exclua nem altere o arquivo para "desbloquear" uma operação real. A CLI não cria automaticamente registros ausentes. Para repetir um exercício novo, escolha outro identificador sintético que comece com `demo-`.

Para demonstrar uma conferência inteiramente fictícia:

```sh
node 10-estado-local/app.mjs conferir demo-reinicio 2 autorizado
node 10-estado-local/app.mjs estado demo-reinicio 2
```

Isso registra `AUTORIZADO_SIMULADO` mantendo o contador 1. O comando **não verifica nenhuma evidência, não consulta a SEFAZ e não autoriza qualquer documento**. Em uma integração real, a conferência deve validar evidências correspondentes ao documento original e ao ambiente correto antes de registrar uma decisão.

## Regra principal

```js
const atual = lerRegistro(base, ambiente, id);
if (atual.estado !== 'NOVO') return { bloqueado: true, registro: atual };

const iniciado = { ...atual, estado: 'TENTATIVA_INICIADA', tentativas: 1 };
salvar(base, iniciado); // Antes da etapa simulada.
```

- Só `NOVO` permite a primeira tentativa simulada.
- A gravação de `TENTATIVA_INICIADA` acontece antes de escolher o resultado. Se falhar, o fluxo é interrompido.
- `PENDENTE` e `INDETERMINADO` mantêm o bloqueio. Um timeout não prova que nada chegou ao destinatário.
- Se a gravação do resultado falhar, o registro anterior `TENTATIVA_INICIADA` continua exigindo conferência.
- Resultados finais simulados também bloqueiam repetição. **Não há retorno a `NOVO`, reenvio automático ou comando de reset.**
- Arquivo ausente, JSON inválido, identidade ou ambiente incoerente interrompem a execução.
- O identificador e o ambiente fazem parte do registro e do caminho. Os ambientes 1 e 2 são apenas partições sintéticas neste exercício; nenhum deles habilita uma integração fiscal.

## Separação de responsabilidades

- `app.mjs`: argumentos, apresentação e códigos de saída.
- `estado-local.mjs`: regras de transição, leitura e gravação do estado.
- `demo.mjs` e `demonstracao.mjs`: apresentação autocontida dos cenários fictícios.
- `estado-local.test.mjs`: testes automatizados.

Em uma aplicação real, um serviço pode coordenar as etapas e um adaptador pode concentrar as chamadas do SDK. Este exemplo não implementa esse adaptador. O último estado e o contador salvos **não são uma trilha completa de auditoria**.

## Limites importantes

Este arquivo local serve para ensinar **persistência entre reinícios normais de processos**. O exemplo usa operações síncronas, gravação temporária, `fsync` do arquivo e renomeação no mesmo diretório, mas **não garante durabilidade física** diante de queda de energia, falha de armazenamento ou sistema de arquivos. Não há sincronização explícita dos metadados do diretório, banco transacional, bloqueio entre processos, controle distribuído, backup, recuperação automática, assinatura do registro ou defesa contra adulteração. Os modos de acesso solicitados ao sistema de arquivos também não substituem uma política de permissões/ACLs.

**Use apenas um processo/escritor por diretório e não edite os arquivos manualmente.** Dois processos concorrentes podem ler `NOVO` ao mesmo tempo. Apagar, substituir, restaurar um backup antigo ou mover a pasta pode perder o bloqueio. Trocar o identificador não evita duplicidade fiscal. Os testes não simulam falhas físicas nem demonstram segurança em produção.

Antes de uma integração real, são necessários mecanismos adequados de transação, unicidade e concorrência; identidade estável de documento/empresa/ambiente; integridade e correlação das evidências; autorização de operação; tratamento de falhas, recuperação e cópias de segurança; acesso restrito e revisão técnica/fiscal. Não basta copiar este arquivo para obter essas propriedades.

## O que foi testado

18 testes locais cobrem:

- Primeiro resultado pendente, incerto, interrompido, autorizado e rejeitado, sempre sintéticos.
- Repetições bloqueadas sem aumentar o contador.
- Persistência de pendência, incerteza e tentativa em andamento em processos novos.
- Separação dos ambientes e recusa de um registro copiado para o ambiente errado.
- Falha de persistência antes da tentativa e falha ao salvar o resultado posterior.
- Criação repetida, arquivo ausente/corrompido, campos/versão/identidade/contador inválidos.
- Conferência fictícia sem retorno a `NOVO`.
- Saída sanitizada e inspeção dos imports do módulo, sem SDK nem rede.

Verificado em Node.js 24.19.0, Linux x64. Esses testes comprovam somente os comportamentos exercitados; não equivalem a auditoria, validação fiscal, disponibilidade de serviço ou homologação de um produto. Para incluir os testes das aulas anteriores, instale as dependências conforme o [README principal](../README.md) e rode `npm test`.

## Checklist de encerramento

- [ ] Conferir versão instalada, lockfile, documentação e tipos reais antes de usar métodos do SDK.
- [ ] Separar entrada, coordenação, adaptador e persistência conforme o projeto.
- [ ] Interromper o fluxo em falhas locais e tratar o encerramento dos recursos.
- [ ] Guardar intenção e resultado sem confundir sucesso técnico com autorização fiscal.
- [ ] Resolver pendência/resultado desconhecido antes de decidir outra tentativa.
- [ ] Separar ambientes, configurações e evidências; controlar concorrência e unicidade.
- [ ] Preservar os bytes originais, a estrutura e a correlação do documento processado (`nfeProc`) quando houver autorização confirmada; ver os critérios da [aula 9](../09-homologacao/README.md).
- [ ] Restringir acesso a documentos, certificados e credenciais; manter logs sem conteúdo sensível.
- [ ] Testar recuperação e restauração; planejar backups e revisão técnica/fiscal.

O checklist é um roteiro de engenharia, não uma certificação de prontidão para produção. Não publique XML real, certificados, senhas, chaves, protocolos, identidades fiscais ou respostas brutas. A série termina aqui; os limites de cada exemplo continuam valendo.
