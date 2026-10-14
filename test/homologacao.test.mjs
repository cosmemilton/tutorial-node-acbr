import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readdir, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
const script = resolve(import.meta.dirname, '../08-homologacao/preflight.mjs');
test('aula 8: preflight local observa falha de schema sem assinatura e não grava arquivos', async () => {
  const cwd = await mkdtemp(join(tmpdir(), 'acbr-aula8-'));
  try {
    const result = spawnSync(process.execPath, [script], { cwd, encoding: 'utf8', timeout: 20000 });
    assert.equal(result.status, 0, result.stderr + result.stdout);
    assert.match(result.stdout, /SDK: 0\.1\.2/);
    assert.match(result.stdout, /HOMOLOGAÇÃO \| CE \| modelo 55/);
    assert.match(result.stdout, /XML_GERADO \| tpAmb=2 \| sem assinatura/);
    assert.match(result.stdout, /XML_SCHEMA_INVALIDO/);
    assert.match(result.stdout, /Status desta operação: nao_enviado/);
    assert.deepEqual(await readdir(cwd), []);
  } finally { await rm(cwd, { recursive: true, force: true }); }
});
test('aula 8: fonte não chama operação fiscal nem configura certificado', async () => {
  const source = await readFile(script, 'utf8');
  assert.doesNotMatch(source, /\.(?:transmitir|assinar|consultar|cancelar|cartaCorrecao|inutilizar)\s*\(/);
  assert.doesNotMatch(source, /certificado\s*:/);
});
