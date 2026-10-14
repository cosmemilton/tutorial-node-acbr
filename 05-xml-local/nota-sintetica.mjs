/* Dados sintéticos da fixture pública. NÃO TRANSMITIR. */
// Fonte: https://github.com/cosmemilton/acbr-node/blob/main/test/native-fixtures.mjs
// Git blob: 951e1a118d36da5a64dbe9ea0692ceac775c2390
const CNPJ = '11222333000181';
export function objetoDocumento(modelo=55){
 const day=new Date().toISOString().slice(0,10);
 return{
  infNFe:{Versao:'4.00'},
  Ide:{cUF:23,cNF:12345678,natOp:'VENDA TESTE OFFLINE',modelo,serie:1,nNF:1,dEmi:day+'T12:00:00',tpNF:'tnSaida',idDest:'doInterna',cMunFG:2304400,tpImp:modelo===65?'tiNFCe':'tiRetrato',tpEmis:'teNormal',tpAmb:'taHomologacao',finNFe:'fnNormal',indFinal:'cfConsumidorFinal',indPres:'pcPresencial',procEmi:'peAplicativoContribuinte',verProc:'ACBR-NODE-OFFLINE'},
  Emit:{CNPJCPF:CNPJ,xNome:'Café São José TESTE SINTÉTICO SEM VALOR FISCAL',IE:'123456789',CRT:'crtSimplesNacional',EnderEmit:{xLgr:'RUA TESTE',nro:'1',xBairro:'TESTE',cMun:2304400,xMun:'FORTALEZA',UF:'CE',CEP:60000000,cPais:1058,xPais:'BRASIL'}},
  Dest:{CNPJCPF:'12345678909',xNome:'NF-E EMITIDA EM AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL',indIEDest:'inNaoContribuinte',EnderDest:{xLgr:'RUA TESTE',nro:'2',xBairro:'TESTE',cMun:2304400,xMun:'FORTALEZA',UF:'CE',CEP:60000000,cPais:1058,xPais:'BRASIL'}},
  Det:[{Prod:{nItem:1,cProd:'TESTE',cEAN:'SEM GTIN',xProd:'Café São José PRODUTO SINTÉTICO OFFLINE',NCM:'22021000',CFOP:'5102',uCom:'UN',qCom:'1',vUnCom:'10',vProd:'10',cEANTrib:'SEM GTIN',uTrib:'UN',qTrib:'1',vUnTrib:'10',IndTot:'itSomaTotalNFe'},Imposto:{ICMS:{orig:'oeNacional',CSOSN:'csosn102'},PIS:{CST:'pis07'},COFINS:{CST:'cof07'}}}],
  Total:{ICMSTot:{vProd:'10',vNF:'10'}},Transp:{modFrete:'mfSemFrete'},pag:[{tPag:'fpDinheiro',indPag:'ipVista',vPag:'10'}]
 };
}

export const nota = objetoDocumento(55);
