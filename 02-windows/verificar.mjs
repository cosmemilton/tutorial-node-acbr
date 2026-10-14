import { createRequire } from 'node:module';
import { TNFe, criarEmissor, diagnosticarErro } from 'cosmemilton-acbr-node';
const require = createRequire(import.meta.url);
const sdk = require('cosmemilton-acbr-node/package.json');
console.log(JSON.stringify({ node: process.version, plataforma: process.platform, arquitetura: process.arch, sdk: sdk.version, TNFe: typeof TNFe, criarEmissor: typeof criarEmissor, diagnosticarErro: typeof diagnosticarErro }, null, 2));
