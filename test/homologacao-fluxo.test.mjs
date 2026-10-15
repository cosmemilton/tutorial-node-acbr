import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readdir, readFile, rm, copyFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import {
  VERIFICACOES, criarCenarioSimulado, representarEstruturaSimulada,
  analisarRetornoSimulado, simularFluxo,
} from '../09-homologacao/fluxo-simulado.mjs';

const pasta = resolve(import.meta.dirname, '../09-homologacao');
const permitido = { autorizacaoExplicita: true };

test('aula 9: bloqueia antes da representação de envio sem autorização explícita', () => {
  for (const valor of [undefined, false, 'true', 1]) {
    const r = simularFluxo(criarCenarioSimulado(), { autorizacaoExplicita: valor });
    assert.equal(r.decisao, 'aguardar_autorizacao_explicita');
    assert.equal(r.etapas.length, 3);
    assert.equal(r.transmissaoRealExecutada, false);
  }
});

test('aula 9: exige simulação e ambiente numérico 2', () => {
  assert.equal(simularFluxo(null).decisao, 'cenario_simulado_obrigatorio');
  for (const ambiente of [1, '2', null]) {
    const r = simularFluxo(criarCenarioSimulado(), { ...permitido, ambiente });
    assert.equal(r.decisao, 'ambiente_de_homologacao_obrigatorio');
    assert.deepEqual(r.etapas, []);
  }
});

test('aula 9: interrompe cada etapa com falha, estado divergente ou XML ausente', () => {
  for (const etapa of ['geracao', 'assinatura', 'validacao']) {
    for (const alteracao of [{ sucesso: false }, { sucesso: 'true' }, { estado: 'OUTRO' }, null]) {
      const c = criarCenarioSimulado();
      c[etapa] = alteracao === null ? null : { ...c[etapa], ...alteracao };
      assert.equal(simularFluxo(c, permitido).decisao, `interrompido_na_${etapa}`);
    }
  }
  for (const etapa of ['geracao', 'assinatura']) {
    const c = criarCenarioSimulado();
    c[etapa].xmlPresente = false;
    assert.equal(simularFluxo(c, permitido).decisao, `interrompido_na_${etapa}`);
  }
});

test('aula 9: cenário autorizado é rotulado como simulado e preserva a ordem', () => {
  const r = simularFluxo(criarCenarioSimulado(), permitido);
  assert.equal(r.natureza, 'SIMULACAO');
  assert.equal(r.decisao, 'autorizado_simulado');
  assert.deepEqual(r.etapas, [
    'geracao_simulada', 'assinatura_simulada', 'validacao_simulada',
    'retorno_de_transmissao_simulado',
  ]);
  assert.equal(r.transmissaoRealExecutada, false);
  assert.equal(r.retransmissaoAutomatica, false);
});

test('aula 9: sucesso, estado e cStat precisam concordar', () => {
  const c = criarCenarioSimulado();
  for (const retorno of [null, {}, { sucesso: true },
    { ...c.retorno, sucesso: false }, { ...c.retorno, sucesso: 'true' },
    { ...c.retorno, estado: 'PENDENTE' }, { ...c.retorno, cStat: 103 },
    { ...c.retorno, cStat: '100' }, { ...c.retorno, estado: 'REJEITADO', sucesso: false },
  ]) {
    assert.equal(analisarRetornoSimulado(retorno, c.verificacoes), 'conferir_situacao_sem_retransmitir');
  }
  assert.equal(analisarRetornoSimulado({ ...c.retorno, cStat: 150 }, c.verificacoes), 'autorizado_simulado');
});

test('aula 9: qualquer verificação privada ausente ou divergente impede conclusão', () => {
  const c = criarCenarioSimulado();
  for (const campo of VERIFICACOES) {
    for (const valor of [false, undefined, 'true']) {
      const verificacoes = { ...c.verificacoes, [campo]: valor };
      assert.equal(analisarRetornoSimulado(c.retorno, verificacoes), 'conferir_situacao_sem_retransmitir');
    }
  }
  assert.equal(analisarRetornoSimulado(c.retorno, null), 'conferir_situacao_sem_retransmitir');
});

test('aula 9: pendente, indeterminado, rejeitado e inconsistente nunca retransmitem', () => {
  for (const nome of ['pendente', 'indeterminado', 'rejeitado', 'inconsistente']) {
    const r = simularFluxo(criarCenarioSimulado(nome), permitido);
    assert.notEqual(r.decisao, 'autorizado_simulado');
    assert.equal(r.transmissaoRealExecutada, false);
    assert.equal(r.retransmissaoAutomatica, false);
  }
  const c = criarCenarioSimulado();
  assert.equal(analisarRetornoSimulado({ sucesso: false, estado: 'DENEGADO' }, c.verificacoes),
    'revisar_diagnostico_sem_retransmitir');
});

test('aula 9: fixtures novas não compartilham estado e recusam nome desconhecido', () => {
  const c = criarCenarioSimulado();
  c.verificacoes.chaveCorrelacionada = false;
  c.retorno.sucesso = false;
  assert.equal(simularFluxo(criarCenarioSimulado(), permitido).decisao, 'autorizado_simulado');
  assert.throws(() => criarCenarioSimulado('toString'), /CENARIO_DESCONHECIDO/);
  const estrutura = representarEstruturaSimulada();
  assert.equal(estrutura.natureza, 'SIMULACAO');
  assert.equal(estrutura.nfeProc.NFe.assinaturaPresente, true);
  assert.equal(estrutura.nfeProc.protNFe.infProtPresente, true);
});

test('aula 9: executa isolada, sem dependências e sem permissão de gravação', async () => {
  const cwd = await mkdtemp(join(tmpdir(), 'acbr-aula9-'));
  try {
    for (const nome of ['demonstracao.mjs', 'fluxo-simulado.mjs']) {
      await copyFile(join(pasta, nome), join(cwd, nome));
      const fonte = await readFile(join(pasta, nome), 'utf8');
      assert.doesNotMatch(fonte, /cosmemilton-acbr-node|node:(?:fs|http|https|net|tls|child_process)/);
      assert.doesNotMatch(fonte, /\bfetch\s*\(|\.(?:assinar|transmitir|consultar)\s*\(/);
      assert.doesNotMatch(fonte, /\b\d{14,}\b|BEGIN (?:PRIVATE KEY|CERTIFICATE)/);
    }
    const antes = (await readdir(cwd)).sort();
    const permissionFlag = process.allowedNodeEnvironmentFlags.has('--permission')
      ? '--permission' : '--experimental-permission';
    const r = spawnSync(process.execPath, [
      permissionFlag, `--allow-fs-read=${cwd}`, join(cwd, 'demonstracao.mjs'),
    ], { cwd, encoding: 'utf8', timeout: 10000 });
    assert.equal(r.status, 0, r.stderr + r.stdout);
    assert.match(r.stdout, /SIMULAÇÃO DIDÁTICA/);
    assert.match(r.stdout, /autorizado: autorizado_simulado/);
    assert.match(r.stdout, /pendente: conferir_situacao_sem_retransmitir/);
    assert.match(r.stdout, /inconsistente: conferir_situacao_sem_retransmitir/);
    assert.match(r.stdout, /não comprova assinatura, validação, transmissão ou autorização real/);
    assert.deepEqual((await readdir(cwd)).sort(), antes);
  } finally { await rm(cwd, { recursive: true, force: true }); }
});
