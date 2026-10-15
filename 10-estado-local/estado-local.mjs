// Estado da APLICAÇÃO, criado para esta aula. Não é API do SDK.
// Somente dados sintéticos; um processo/escritor por diretório.
import {
  closeSync, fsyncSync, mkdirSync, openSync, readFileSync,
  renameSync, unlinkSync, writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

const ESTADOS = new Set([
  'NOVO', 'TENTATIVA_INICIADA', 'PENDENTE', 'INDETERMINADO',
  'AUTORIZADO_SIMULADO', 'REJEITADO_SIMULADO',
]);
const RESULTADOS = Object.freeze({
  pendente: 'PENDENTE', timeout: 'INDETERMINADO',
  autorizado: 'AUTORIZADO_SIMULADO', rejeitado: 'REJEITADO_SIMULADO',
});
const EM_CONFERENCIA = new Set(['TENTATIVA_INICIADA', 'PENDENTE', 'INDETERMINADO']);
const falhar = (codigo) => { throw new Error(codigo); };

function caminho(base, ambiente, id) {
  if (![1, 2].includes(ambiente) || !/^demo-[a-z0-9-]{1,40}$/.test(id)) {
    falhar('IDENTIFICACAO_SINTETICA_INVALIDA');
  }
  return join(base, `ambiente-${ambiente}`, `${id}.json`);
}

function validar(registro, ambiente, id) {
  const campos = ['versao', 'ambiente', 'id', 'estado', 'tentativas'];
  if (!registro || typeof registro !== 'object' || Array.isArray(registro)
      || Object.keys(registro).length !== campos.length
      || !campos.every((campo) => Object.hasOwn(registro, campo))
      || registro.versao !== 1 || registro.ambiente !== ambiente || registro.id !== id
      || !ESTADOS.has(registro.estado)
      || registro.tentativas !== (registro.estado === 'NOVO' ? 0 : 1)) {
    falhar('ESTADO_INVALIDO_CONFERIR_MANUALMENTE');
  }
  return registro;
}

function gravarDescritor(fd, registro) {
  try {
    writeFileSync(fd, `${JSON.stringify(registro, null, 2)}\n`, 'utf8');
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
}

function salvar(base, registro) {
  const destino = caminho(base, registro.ambiente, registro.id);
  const temporario = `${destino}.${randomUUID()}.tmp`;
  try {
    gravarDescritor(openSync(temporario, 'wx', 0o600), registro);
    renameSync(temporario, destino);
  } catch {
    falhar('FALHA_DE_PERSISTENCIA_CONFERIR_MANUALMENTE');
  } finally {
    try { unlinkSync(temporario); } catch { /* Pode já ter sido renomeado. */ }
  }
}

export function criarRegistro(base, ambiente, id) {
  const destino = caminho(base, ambiente, id);
  const registro = { versao: 1, ambiente, id, estado: 'NOVO', tentativas: 0 };
  mkdirSync(join(base, `ambiente-${ambiente}`), { recursive: true, mode: 0o700 });
  let fd;
  try {
    fd = openSync(destino, 'wx', 0o600); // Nunca substitui um registro existente.
  } catch (erro) {
    falhar(erro.code === 'EEXIST' ? 'REGISTRO_JA_EXISTE' : 'FALHA_DE_PERSISTENCIA');
  }
  try { gravarDescritor(fd, registro); } catch { falhar('FALHA_DE_PERSISTENCIA'); }
  return registro;
}

export function lerRegistro(base, ambiente, id) {
  const arquivo = caminho(base, ambiente, id);
  let texto;
  try { texto = readFileSync(arquivo, 'utf8'); } catch (erro) {
    falhar(erro.code === 'ENOENT' ? 'REGISTRO_AUSENTE_CONFERIR_MANUALMENTE' : 'FALHA_DE_LEITURA');
  }
  let registro;
  try { registro = JSON.parse(texto); } catch { falhar('ESTADO_INVALIDO_CONFERIR_MANUALMENTE'); }
  return validar(registro, ambiente, id);
}

export function tentarSimulacao(base, ambiente, id, cenario) {
  const atual = lerRegistro(base, ambiente, id);
  if (atual.estado !== 'NOVO') return { bloqueado: true, registro: atual };
  if (!Object.hasOwn(RESULTADOS, cenario) && cenario !== 'interrompido') {
    falhar('CENARIO_INVALIDO');
  }
  const iniciado = { ...atual, estado: 'TENTATIVA_INICIADA', tentativas: 1 };
  salvar(base, iniciado); // Persistir ANTES da etapa que poderia ter efeito externo.

  // Apenas um resultado escolhido no código. NÃO há envio nem chamada do SDK.
  if (cenario === 'interrompido') return { bloqueado: false, registro: iniciado };
  const registro = { ...iniciado, estado: RESULTADOS[cenario] };
  salvar(base, registro);
  return { bloqueado: false, registro };
}

export function conferirSimulacao(base, ambiente, id, cenario) {
  const atual = lerRegistro(base, ambiente, id);
  if (!EM_CONFERENCIA.has(atual.estado) || !Object.hasOwn(RESULTADOS, cenario)) {
    falhar('CONFERENCIA_SIMULADA_INVALIDA');
  }
  // Conferência FICTÍCIA: não consulta situação fiscal e nunca reabre NOVO.
  const registro = { ...atual, estado: RESULTADOS[cenario] };
  salvar(base, registro);
  return registro;
}
