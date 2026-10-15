// SIMULAÇÃO DIDÁTICA: objetos novos, sem XML, SDK, certificado, rede ou arquivos.
// Não use estas funções para decidir a situação fiscal de um documento real.
export const VERIFICACOES = Object.freeze([
  'nfeProcPresente', 'nfePresente', 'protNFePresente',
  'assinaturaVerificada', 'chaveCorrelacionada', 'protocoloCorrelacionado',
  'ambienteCorrelacionado', 'bytesAssinadosPreservados',
  'hashConferido', 'schemaVerificado',
]);

export function criarCenarioSimulado(nome = 'autorizado') {
  const resultados = {
    autorizado: { sucesso: true, estado: 'AUTORIZADO', cStat: 100 },
    pendente: { sucesso: false, estado: 'PENDENTE', cStat: 103 },
    indeterminado: { sucesso: false, estado: 'INDETERMINADO' },
    rejeitado: { sucesso: false, estado: 'REJEITADO', cStat: 225 },
    inconsistente: { sucesso: true, estado: 'AUTORIZADO', cStat: 100 },
  };
  if (!Object.hasOwn(resultados, nome)) throw new Error('CENARIO_DESCONHECIDO');
  const verificacoes = Object.fromEntries(VERIFICACOES.map(campo => [campo, true]));
  if (nome === 'inconsistente') verificacoes.chaveCorrelacionada = false;
  return {
    natureza: 'SIMULACAO',
    geracao: { sucesso: true, estado: 'XML_GERADO', xmlPresente: true },
    assinatura: { sucesso: true, estado: 'ASSINADO', xmlPresente: true },
    validacao: { sucesso: true, estado: 'VALIDADO' },
    retorno: { ...resultados[nome] },
    verificacoes,
  };
}

export function representarEstruturaSimulada() {
  // Desenho lógico com indicadores, NÃO é XML nem objeto de entrada do SDK.
  return {
    natureza: 'SIMULACAO',
    nfeProc: {
      versao: '4.00',
      NFe: { presente: true, assinaturaPresente: true },
      protNFe: { presente: true, infProtPresente: true },
    },
  };
}

export function analisarRetornoSimulado(retorno, verificacoes = {}) {
  const r = retorno ?? {};
  const evidencias = verificacoes ?? {};
  const codigoAutorizacao = r.cStat === 100 || r.cStat === 150;
  if (r.sucesso === true && r.estado === 'AUTORIZADO' && codigoAutorizacao &&
      VERIFICACOES.every(campo => evidencias[campo] === true)) {
    return 'autorizado_simulado';
  }
  // Mesmo cStat=100 não basta se estado, sucesso ou correlação divergirem.
  if (r.estado === 'PENDENTE' || r.estado === 'INDETERMINADO' ||
      r.estado === 'AUTORIZADO' || codigoAutorizacao) {
    return 'conferir_situacao_sem_retransmitir';
  }
  if (r.sucesso === false && (r.estado === 'REJEITADO' || r.estado === 'DENEGADO')) {
    return 'revisar_diagnostico_sem_retransmitir';
  }
  return 'conferir_situacao_sem_retransmitir';
}

export function simularFluxo(cenario, { autorizacaoExplicita = false, ambiente = 2 } = {}) {
  const etapas = [];
  const concluir = decisao => ({
    natureza: 'SIMULACAO', etapas, decisao, transmissaoRealExecutada: false,
    retransmissaoAutomatica: false,
  });
  if (cenario?.natureza !== 'SIMULACAO') return concluir('cenario_simulado_obrigatorio');
  if (ambiente !== 2) return concluir('ambiente_de_homologacao_obrigatorio');
  for (const [nome, estado, exigirXml] of [
    ['geracao', 'XML_GERADO', true],
    ['assinatura', 'ASSINADO', true],
    ['validacao', 'VALIDADO', false],
  ]) {
    const resultado = cenario[nome];
    if (resultado?.sucesso !== true || resultado.estado !== estado ||
        (exigirXml && resultado.xmlPresente !== true)) {
      return concluir(`interrompido_na_${nome}`);
    }
    etapas.push(`${nome}_simulada`);
  }
  // Permissão representada só para ensinar a barreira. Nunca dispara um envio.
  if (autorizacaoExplicita !== true) return concluir('aguardar_autorizacao_explicita');
  etapas.push('retorno_de_transmissao_simulado');
  return concluir(analisarRetornoSimulado(cenario.retorno, cenario.verificacoes));
}
