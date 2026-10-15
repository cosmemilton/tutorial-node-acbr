// CLI sintética. Logs contêm apenas rótulos definidos pela aplicação.
import { join } from 'node:path';
import { criarRegistro, lerRegistro, tentarSimulacao, conferirSimulacao } from './estado-local.mjs';

const [comando, id, ambienteTexto, cenario, ...extras] = process.argv.slice(2);
const base = join(process.cwd(), 'saida', 'aula10');
try {
  if (!['1', '2'].includes(ambienteTexto) || extras.length) throw new Error('USO_INVALIDO');
  const ambiente = Number(ambienteTexto);
  let registro;
  if (comando === 'criar' && cenario === undefined) registro = criarRegistro(base, ambiente, id);
  else if (comando === 'estado' && cenario === undefined) registro = lerRegistro(base, ambiente, id);
  else if (comando === 'tentar') {
    const resultado = tentarSimulacao(base, ambiente, id, cenario);
    registro = resultado.registro;
    if (resultado.bloqueado) {
      console.log('BLOQUEADO | tentativa já registrada | nenhum reenvio');
      process.exitCode = 2;
    }
  } else if (comando === 'conferir') registro = conferirSimulacao(base, ambiente, id, cenario);
  else throw new Error('USO_INVALIDO');
  console.log(`SIMULAÇÃO | ambiente=${registro.ambiente} | estado=${registro.estado} | tentativas=${registro.tentativas}`);
} catch (erro) {
  // Mensagens da camada local são códigos fixos; erros de SO não são impressos.
  const codigo = /^[A-Z_]+$/.test(erro.message) ? erro.message : 'FALHA_LOCAL';
  console.error(`BLOQUEADO | ${codigo} | nenhuma operação fiscal`);
  process.exitCode = 2;
}
