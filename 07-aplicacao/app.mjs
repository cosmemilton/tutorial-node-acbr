import { writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { diagnosticarErro } from 'cosmemilton-acbr-node';
import { criarNota } from './nota-sintetica.mjs';
import { gerarXmlLocal } from './servico-xml.mjs';

const cenario = process.argv[2] ?? 'sucesso';
if (!['sucesso', 'data-invalida'].includes(cenario)) {
  console.error('Uso: node 07-aplicacao/app.mjs [sucesso|data-invalida]');
  process.exitCode = 1;
} else {
  const { xml, ...resultado } = await gerarXmlLocal(criarNota(cenario));
  console.log(JSON.stringify(resultado, null, 2));
  console.log('Mensagem ao usuário: ' + resultado.diagnostico.mensagem);
  console.log('Próximo passo: ' + resultado.diagnostico.acao);
  if (!resultado.sucesso) process.exitCode = 1;
  else {
    try {
      const arquivo = `nota-local-video7-${randomUUID()}.xml`;
      await writeFile(arquivo, xml, { flag: 'wx' });
      console.log(JSON.stringify({ arquivo, bytes: xml.length }));
    } catch (erro) {
      console.error(JSON.stringify(diagnosticarErro(erro), null, 2));
      process.exitCode = 1;
    }
  }
}
