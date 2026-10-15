import {
  criarCenarioSimulado, representarEstruturaSimulada, simularFluxo,
} from './fluxo-simulado.mjs';

console.log('SIMULAÇÃO DIDÁTICA | dados criados do zero | nenhuma operação fiscal real');
console.log('Fluxo conceitual: gerar -> assinar -> validar -> transmitir (com autorização explícita)');
console.log('Sem autorização representada:', simularFluxo(criarCenarioSimulado()).decisao);
for (const nome of ['autorizado', 'pendente', 'indeterminado', 'rejeitado', 'inconsistente']) {
  const resultado = simularFluxo(criarCenarioSimulado(nome), { autorizacaoExplicita: true });
  console.log(`Cenário simulado ${nome}: ${resultado.decisao}`);
}
console.log('Estrutura apenas ilustrativa:', JSON.stringify(representarEstruturaSimulada()));
console.log('O exercício não comprova assinatura, validação, transmissão ou autorização real.');
