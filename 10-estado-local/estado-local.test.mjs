import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { syncBuiltinESMExports } from 'node:module';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { criarRegistro, lerRegistro, tentarSimulacao, conferirSimulacao } from './estado-local.mjs';

const app = resolve(import.meta.dirname, 'app.mjs');
const id = 'demo-teste';
function contexto(t) {
  const cwd = fs.mkdtempSync(join(tmpdir(), 'aula10-teste-'));
  t.after(() => fs.rmSync(cwd, { recursive: true, force: true }));
  return { cwd, base: join(cwd, 'saida', 'aula10') };
}
const cli = (cwd, args) => spawnSync(process.execPath, [app, ...args], { cwd, encoding: 'utf8', timeout: 5000 });

for (const [cenario, esperado] of [
  ['pendente', 'PENDENTE'], ['timeout', 'INDETERMINADO'],
  ['interrompido', 'TENTATIVA_INICIADA'], ['autorizado', 'AUTORIZADO_SIMULADO'],
  ['rejeitado', 'REJEITADO_SIMULADO'],
]) {
  test(`${cenario}: persiste uma tentativa e bloqueia todas as repetições`, (t) => {
    const { base } = contexto(t);
    assert.equal(criarRegistro(base, 2, id).estado, 'NOVO');
    const primeira = tentarSimulacao(base, 2, id, cenario);
    assert.equal(primeira.bloqueado, false);
    assert.equal(primeira.registro.estado, esperado);
    for (const repeticao of ['autorizado', 'timeout', 'pendente']) {
      assert.equal(tentarSimulacao(base, 2, id, repeticao).bloqueado, true);
      assert.deepEqual(lerRegistro(base, 2, id), primeira.registro);
    }
    assert.equal(primeira.registro.tentativas, 1);
  });
}

test('reinício real: novos processos preservam tentativa iniciada e bloqueiam repetição', (t) => {
  const { cwd } = contexto(t);
  assert.equal(cli(cwd, ['criar', id, '2']).status, 0);
  const primeira = cli(cwd, ['tentar', id, '2', 'interrompido']);
  assert.equal(primeira.status, 0, primeira.stderr);
  assert.match(primeira.stdout, /TENTATIVA_INICIADA/);
  const reinicio = cli(cwd, ['estado', id, '2']);
  assert.equal(reinicio.status, 0);
  assert.match(reinicio.stdout, /TENTATIVA_INICIADA.*tentativas=1/);
  const repeticao = cli(cwd, ['tentar', id, '2', 'autorizado']);
  assert.equal(repeticao.status, 2);
  assert.match(repeticao.stdout, /BLOQUEADO/);
  assert.match(repeticao.stdout, /TENTATIVA_INICIADA.*tentativas=1/);
});

test('pendência e incerteza também sobrevivem a novos processos', (t) => {
  const { cwd } = contexto(t);
  for (const cenario of ['pendente', 'timeout']) {
    const nome = `demo-${cenario}`;
    assert.equal(cli(cwd, ['criar', nome, '2']).status, 0);
    assert.equal(cli(cwd, ['tentar', nome, '2', cenario]).status, 0);
    assert.equal(cli(cwd, ['tentar', nome, '2', 'autorizado']).status, 2);
  }
});

test('ambientes 1 e 2 têm registros separados, ambos fictícios', (t) => {
  const { base } = contexto(t);
  criarRegistro(base, 2, id);
  tentarSimulacao(base, 2, id, 'timeout');
  criarRegistro(base, 1, id);
  assert.equal(lerRegistro(base, 1, id).estado, 'NOVO');
  assert.equal(lerRegistro(base, 2, id).estado, 'INDETERMINADO');
});

test('registro do ambiente errado é recusado, nunca reinterpretado', (t) => {
  const { base } = contexto(t);
  const registro = criarRegistro(base, 2, id);
  criarRegistro(base, 1, id);
  fs.writeFileSync(join(base, 'ambiente-1', `${id}.json`), JSON.stringify(registro));
  assert.throws(() => tentarSimulacao(base, 1, id, 'autorizado'), /ESTADO_INVALIDO/);
  assert.equal(lerRegistro(base, 2, id).estado, 'NOVO');
});

test('falha ao persistir impede avançar ao resultado simulado', (t) => {
  const { cwd, base } = contexto(t);
  criarRegistro(base, 2, id);
  const outro = join(cwd, 'outro');
  fs.mkdirSync(outro);
  const r = spawnSync(process.execPath, [
    '--permission', '--allow-fs-read=*', `--allow-fs-write=${outro}`,
    app, 'tentar', id, '2', 'autorizado',
  ], { cwd, encoding: 'utf8', timeout: 5000 });
  assert.equal(r.status, 2);
  assert.match(r.stderr, /FALHA_DE_PERSISTENCIA/);
  assert.equal(lerRegistro(base, 2, id).estado, 'NOVO');
  assert.equal(lerRegistro(base, 2, id).tentativas, 0);
});

test('falha ao salvar resultado preserva TENTATIVA_INICIADA e bloqueia repetição', (t) => {
  const { base } = contexto(t);
  criarRegistro(base, 2, id);
  const renomear = fs.renameSync;
  let chamadas = 0;
  const simulacao = t.mock.method(fs, 'renameSync', (...args) => {
    if (++chamadas === 2) throw new Error('Falha de disco fictícia');
    return renomear(...args);
  });
  syncBuiltinESMExports();
  try {
    assert.throws(() => tentarSimulacao(base, 2, id, 'autorizado'), /FALHA_DE_PERSISTENCIA/);
  } finally {
    simulacao.mock.restore();
    syncBuiltinESMExports();
  }
  assert.equal(lerRegistro(base, 2, id).estado, 'TENTATIVA_INICIADA');
  assert.equal(tentarSimulacao(base, 2, id, 'autorizado').bloqueado, true);
});

test('criar novamente não apaga o histórico nem reabre NOVO', (t) => {
  const { base } = contexto(t);
  criarRegistro(base, 2, id);
  tentarSimulacao(base, 2, id, 'timeout');
  assert.throws(() => criarRegistro(base, 2, id), /REGISTRO_JA_EXISTE/);
  assert.equal(lerRegistro(base, 2, id).estado, 'INDETERMINADO');
});

test('arquivo ausente ou JSON corrompido bloqueia, sem recriação automática', (t) => {
  const { base } = contexto(t);
  assert.throws(() => tentarSimulacao(base, 2, id, 'autorizado'), /REGISTRO_AUSENTE/);
  criarRegistro(base, 2, id);
  fs.writeFileSync(join(base, 'ambiente-2', `${id}.json`), '{');
  assert.throws(() => tentarSimulacao(base, 2, id, 'autorizado'), /ESTADO_INVALIDO/);
});

test('identidade, versão, estado, contador e campos inesperados são validados', (t) => {
  const { base } = contexto(t);
  const original = criarRegistro(base, 2, id);
  for (const alteracao of [
    { id: 'demo-outro' }, { versao: 2 }, { estado: 'AUTORIZADO' },
    { tentativas: 1 }, { extra: 'nao-permitido' },
  ]) {
    fs.writeFileSync(join(base, 'ambiente-2', `${id}.json`), JSON.stringify({ ...original, ...alteracao }));
    assert.throws(() => tentarSimulacao(base, 2, id, 'autorizado'), /ESTADO_INVALIDO/);
  }
});

test('identificação inválida e cenário inválido não criam uma tentativa', (t) => {
  const { base } = contexto(t);
  for (const [ambiente, nome] of [[3, id], [2, '../demo-teste'], [2, 'documento-real']]) {
    assert.throws(() => criarRegistro(base, ambiente, nome), /IDENTIFICACAO_SINTETICA_INVALIDA/);
  }
  criarRegistro(base, 2, id);
  assert.throws(() => tentarSimulacao(base, 2, id, 'desconhecido'), /CENARIO_INVALIDO/);
  assert.equal(lerRegistro(base, 2, id).estado, 'NOVO');
});

test('conferência fictícia atualiza estado sem reenviar e não retorna a NOVO', (t) => {
  const { base } = contexto(t);
  criarRegistro(base, 2, id);
  assert.throws(() => conferirSimulacao(base, 2, id, 'autorizado'), /CONFERENCIA_SIMULADA_INVALIDA/);
  tentarSimulacao(base, 2, id, 'timeout');
  assert.equal(conferirSimulacao(base, 2, id, 'pendente').estado, 'PENDENTE');
  assert.throws(() => conferirSimulacao(base, 2, id, 'novo'), /CONFERENCIA_SIMULADA_INVALIDA/);
  const final = conferirSimulacao(base, 2, id, 'autorizado');
  assert.equal(final.estado, 'AUTORIZADO_SIMULADO');
  assert.equal(final.tentativas, 1);
  assert.equal(tentarSimulacao(base, 2, id, 'autorizado').bloqueado, true);
});

test('logs de falhas não repetem argumentos arbitrários nem caminhos de disco', (t) => {
  const { cwd } = contexto(t);
  const r = cli(cwd, ['criar', '../entrada-nao-publicavel', '2']);
  assert.equal(r.status, 2);
  assert.doesNotMatch(r.stdout + r.stderr, /entrada-nao-publicavel/);
  assert.ok(!(r.stdout + r.stderr).includes(cwd));
});

test('módulo de estado importa apenas fs, path e crypto; não usa SDK nem rede', () => {
  const fonte = fs.readFileSync(resolve(import.meta.dirname, 'estado-local.mjs'), 'utf8');
  const imports = [...fonte.matchAll(/from\s+['"]([^'"]+)['"]/g)].map((m) => m[1]).sort();
  assert.deepEqual(imports, ['node:crypto', 'node:fs', 'node:path']);
  assert.doesNotMatch(fonte, /\bfetch\s*\(|\bimport\s*\(|\brequire\s*\(/);
});
