// Reutiliza a fixture pública da aula 5; cada chamada cria dados novos.
import { objetoDocumento } from '../05-xml-local/nota-sintetica.mjs';
export function criarNota(cenario = 'sucesso') {
  const nota = objetoDocumento(55);
  if (cenario === 'data-invalida') nota.Ide.dEmi += 'Z';
  return nota;
}
