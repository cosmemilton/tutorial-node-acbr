// Aula 8: conferência estritamente local. Dados sintéticos. NÃO TRANSMITIR.
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { criarEmissor, TNFe, diagnosticarResultado } from 'cosmemilton-acbr-node';
import { nota } from '../05-xml-local/nota-sintetica.mjs';
const require = createRequire(import.meta.url);
const sdk = require('cosmemilton-acbr-node/package.json');
const runtimePkg = `cosmemilton-acbr-node-${process.platform}-${process.arch}`;
const runtimeRoot = path.join(path.dirname(require.resolve(`${runtimePkg}/package.json`)), 'runtime');
const manifest = JSON.parse(await readFile(path.join(runtimeRoot, 'manifest.json'), 'utf8'));
const schemas = Object.keys(manifest.files).filter(p => p.startsWith('schemas/'));
console.log(`SDK: ${sdk.version} | Plataforma: ${process.platform} ${process.arch}`);
console.log(`Schemas no manifesto: ${schemas.length}`);
const config = { cnpj: '11222333000181', uf: 'CE', modelo: 55, ambiente: 2 };
if (config.ambiente !== 2 || nota.Ide.tpAmb !== 'taHomologacao') throw new Error('Homologação obrigatória.');
if (nota.Emit.CNPJCPF !== config.cnpj || nota.Emit.EnderEmit.UF !== config.uf) throw new Error('Identidade divergente.');
console.log('Configuração e fixture: HOMOLOGAÇÃO | CE | modelo 55');
const emissor = criarEmissor(config);
try {
  const resultado = await emissor.gerarXml(new TNFe(nota));
  if (!resultado.sucesso || resultado.estado !== 'XML_GERADO') throw new Error('Geração local falhou.');
  const xml = Buffer.from(resultado.xmlBase64, 'base64').toString('utf8');
  if (!xml.includes('<tpAmb>2</tpAmb>') || /<(Signature|protNFe)[ >]/.test(xml)) throw new Error('Saída inesperada.');
  console.log('Geração local: XML_GERADO | tpAmb=2 | sem assinatura');
  const validacao = await emissor.validar(xml);
  const d = validacao.diagnostico ?? diagnosticarResultado(validacao, 'validar');
  console.log(`Validação do documento sem assinatura: ${d.codigo}`);
  console.log(`Status desta operação: ${d.statusEnvio}`);
  if (validacao.sucesso !== false || d.codigo !== 'XML_SCHEMA_INVALIDO'
      || d.statusEnvio !== 'nao_enviado') {
    throw new Error('Resultado diferente do esperado para este exercício sem assinatura.');
  }
  console.log('Nenhum certificado carregado. Nenhuma chamada de transmissão.');
} finally { await emissor.fechar(); }
