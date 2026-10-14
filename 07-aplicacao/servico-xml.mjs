// Exemplo equivalente ao roteiro da aula 7, reconstruído para este repositório.
import { criarEmissor, TNFe, diagnosticarErro, diagnosticarResultado } from 'cosmemilton-acbr-node';

export async function gerarXmlLocal(nota, factory = criarEmissor) {
  let emissor;
  let resposta;
  try {
    emissor = factory({ cnpj: '11222333000181', uf: 'CE', modelo: 55, ambiente: 2 });
    const resultado = await emissor.gerarXml(new TNFe(nota));
    const diagnostico = resultado.diagnostico ?? diagnosticarResultado(resultado, 'gerarXml');
    if (resultado.sucesso !== true || resultado.estado !== 'XML_GERADO'
        || typeof resultado.xmlBase64 !== 'string' || !resultado.xmlBase64) {
      resposta = { sucesso: false, estado: resultado.estado, diagnostico };
    } else {
      const xml = Buffer.from(resultado.xmlBase64, 'base64');
      const texto = xml.toString('utf8');
      if (!/<(?:[A-Za-z_][\w.-]*:)?NFe(?:\s|>)/.test(texto)
          || /<(?:[A-Za-z_][\w.-]*:)?(?:Signature|nfeProc|protNFe)(?:\s|>)/.test(texto)) {
        throw new Error('A saída não corresponde ao exercício local sem assinatura.');
      }
      resposta = { sucesso: true, estado: resultado.estado, diagnostico, xml };
    }
  } catch (erro) {
    resposta = { sucesso: false, diagnostico: diagnosticarErro(erro) };
  } finally {
    try {
      await emissor?.fechar();
    } catch (erro) {
      // O aplicativo só recebe os bytes depois de confirmar o fechamento.
      resposta = { sucesso: false, diagnostico: diagnosticarErro(erro) };
    }
  }
  return resposta;
}
