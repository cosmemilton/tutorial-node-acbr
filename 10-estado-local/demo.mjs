// Demonstração autocontida, com diretório temporário novo e remoção ao terminar.
// A persistência entre processos é testada em estado-local.test.mjs.
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { criarRegistro, lerRegistro, tentarSimulacao, conferirSimulacao } from './estado-local.mjs';

const base = mkdtempSync(join(tmpdir(), 'aula10-sintetica-'));
try {
  console.log('SIMULAÇÃO DIDÁTICA | estado da aplicação | nenhuma operação fiscal');
  for (const [id, cenario] of [['demo-pendente', 'pendente'], ['demo-incerto', 'timeout'], ['demo-interrompido', 'interrompido']]) {
    criarRegistro(base, 2, id);
    const { registro } = tentarSimulacao(base, 2, id, cenario);
    console.log(`${cenario}: ${registro.estado} | tentativas=${registro.tentativas}`);
    const repeticao = tentarSimulacao(base, 2, id, 'autorizado');
    console.log(`Repetição: ${repeticao.bloqueado ? 'BLOQUEADA' : 'permitida'} | nenhum reenvio`);
  }
  const relido = lerRegistro(base, 2, 'demo-incerto');
  console.log(`Arquivo reaberto: ${relido.estado} | tentativas=${relido.tentativas}`);
  const conferido = conferirSimulacao(base, 2, 'demo-incerto', 'autorizado');
  console.log(`Conferência fictícia: ${conferido.estado} | tentativas=${conferido.tentativas}`);
  criarRegistro(base, 1, 'demo-incerto');
  console.log(`Isolamento: ambiente 1=${lerRegistro(base, 1, 'demo-incerto').estado} | ambiente 2=${lerRegistro(base, 2, 'demo-incerto').estado}`);
  console.log('Ambos os ambientes são simulados. Código de saída 0 não é autorização fiscal.');
} finally {
  rmSync(base, { recursive: true, force: true });
}
