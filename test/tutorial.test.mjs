import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { criarNota } from '../07-aplicacao/nota-sintetica.mjs';
import { gerarXmlLocal } from '../07-aplicacao/servico-xml.mjs';

const root = resolve(import.meta.dirname, '..');
test('fixture nova não compartilha a alteração de data', () => {
  assert.ok(criarNota('data-invalida').Ide.dEmi.endsWith('Z'));
  assert.ok(!criarNota().Ide.dEmi.endsWith('Z'));
});
test('falha na criação vira diagnóstico sem XML', async () => {
  const r = await gerarXmlLocal(criarNota(), () => { throw new Error('Falha de inicialização simulada'); });
  assert.equal(r.sucesso, false); assert.equal(r.xml, undefined); assert.ok(r.diagnostico.codigo);
});
test('data inválida ainda fecha o emissor', async () => {
  let fechado = 0;
  const r = await gerarXmlLocal(criarNota('data-invalida'), () => ({
    gerarXml() { assert.fail('não deve gerar com data inválida'); },
    async fechar() { fechado++; }
  }));
  assert.equal(r.sucesso, false); assert.equal(r.diagnostico.codigo, 'DATA_HORA_INVALIDA'); assert.equal(fechado, 1);
});
test('falha ao fechar descarta bytes de uma geração bem-sucedida', async () => {
  const r = await gerarXmlLocal(criarNota(), () => ({
    async gerarXml() { return { sucesso: true, estado: 'XML_GERADO', xmlBase64: Buffer.from('<NFe></NFe>').toString('base64'), diagnostico: { codigo: 'TESTE' } }; },
    async fechar() { throw new Error('Falha de fechamento simulada'); }
  }));
  assert.equal(r.sucesso, false); assert.equal(r.xml, undefined);
});
test('resultado sem XML não é sucesso', async () => {
  const r = await gerarXmlLocal(criarNota(), () => ({
    async gerarXml() { return { sucesso: true, estado: 'XML_GERADO', diagnostico: { codigo: 'TESTE' } }; }, async fechar() {}
  }));
  assert.equal(r.sucesso, false); assert.equal(r.xml, undefined);
});
test('CLI resolve enum e coleção e rejeita campo inexistente', () => {
  const cli = join(root, 'node_modules/cosmemilton-acbr-node/dist/cli.js');
  for (const field of ['Ide.tpNF', 'Det[].Imposto.PIS.CST']) {
    const r = spawnSync(process.execPath, [cli, 'help', 'TAG', field, '--json'], { encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr); assert.equal(JSON.parse(r.stdout).sdkVersion, '0.1.2');
  }
  const r = spawnSync(process.execPath, [cli, 'help', 'TAG', 'CampoInexistente'], { encoding: 'utf8' });
  assert.notEqual(r.status, 0); assert.match(r.stderr + r.stdout, /campo não existe/);
});
for (const script of ['05-xml-local/gerar-local.mjs', '06-diagnostico/tratar-erro-local.mjs', '07-aplicacao/app.mjs']) {
  test('runtime real: ' + script, async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'acbr-tutorial-'));
    try {
      const scenarios = script.startsWith('05') ? [[]] : [[], ['data-invalida'], []];
      let count = 0;
      for (const args of scenarios) {
        const r = spawnSync(process.execPath, [join(root, script), ...args], { cwd, encoding: 'utf8', timeout: 20000 });
        assert.equal(r.status, args.length ? 1 : 0, r.stderr + r.stdout);
        if (args.length) assert.match(r.stdout + r.stderr, /DATA_HORA_INVALIDA/);
        else { count++; assert.match(r.stdout, /XML_GERADO/); }
        const files = (await readdir(cwd)).filter(f => f.endsWith('.xml'));
        assert.equal(files.length, count);
        for (const f of files) {
          const xml = await readFile(join(cwd, f), 'utf8');
          assert.match(xml, /<NFe[ >]/); assert.doesNotMatch(xml, /<(?:Signature|nfeProc|protNFe)[ >]/);
        }
      }
    } finally { await rm(cwd, { recursive: true, force: true }); }
  });
}
