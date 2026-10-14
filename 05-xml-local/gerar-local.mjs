// Demonstração técnica local. Dados sintéticos. NÃO TRANSMITIR.
import { writeFile } from 'node:fs/promises';
import { criarEmissor, TNFe, diagnosticarErro, diagnosticarResultado } from 'cosmemilton-acbr-node';
import { nota } from './nota-sintetica.mjs';

let emissor;
try {
  emissor = criarEmissor({
    cnpj: '11222333000181',
    uf: 'CE',
    modelo: 55,
    ambiente: 2
  });
  const resultado = await emissor.gerarXml(new TNFe(nota));
  const diagnostico = resultado.diagnostico
    ?? diagnosticarResultado(resultado, 'gerarXml');
  console.log(JSON.stringify({
    sucesso: resultado.sucesso,
    estado: resultado.estado,
    diagnostico
  }, null, 2));

  if (resultado.sucesso !== true || resultado.estado !== 'XML_GERADO'
      || typeof resultado.xmlBase64 !== 'string' || !resultado.xmlBase64) {
    process.exitCode = 1;
  } else {
    const bytes = Buffer.from(resultado.xmlBase64, 'base64');
    const texto = bytes.toString('utf8');
    // Inspeção limitada; não valida schema nem regras fiscais.
    const temNFe = /<(?:[A-Za-z_][\w.-]*:)?NFe(?:\s|>)/.test(texto);
    const temAssinatura = /<(?:[A-Za-z_][\w.-]*:)?Signature(?:\s|>)/.test(texto);
    const temProtocolo = /<(?:[A-Za-z_][\w.-]*:)?(?:nfeProc|protNFe)(?:\s|>)/.test(texto);
    if (!temNFe || temAssinatura || temProtocolo) {
      throw new Error('A saída não corresponde ao exercício local sem assinatura.');
    }
    const arquivo = 'nota-local-sintetica-' + Date.now() + '.xml';
    await writeFile(arquivo, bytes, { flag: 'wx' });
    console.log(JSON.stringify({
      arquivo,
      bytes: bytes.length,
      contemNFe: temNFe,
      contemSignature: temAssinatura,
      contemProtocolo: temProtocolo
    }, null, 2));
  }
} catch (erro) {
  console.error(JSON.stringify(diagnosticarErro(erro), null, 2));
  process.exitCode = 1;
} finally {
  try {
    await emissor?.fechar();
  } catch (erro) {
    console.error(JSON.stringify(diagnosticarErro(erro), null, 2));
    process.exitCode = 1;
  }
}
