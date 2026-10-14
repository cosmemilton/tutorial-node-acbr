# Aula 3 — Ubuntu / WSL2

Use Ubuntu 24.04 x64/glibc e Node.js 22.12+ dentro do Linux. Se ainda não tiver WSL2, siga a [instalação oficial da Microsoft](https://learn.microsoft.com/windows/wsl/install); instalar WSL pode exigir administrador e reinicialização.

Na raiz do checkout, dentro do terminal Ubuntu:

```sh
uname -m
node --version
node -p "process.platform + ' ' + process.arch"
npm ci --ignore-scripts --no-audit --no-fund
npm run verificar
npm ls cosmemilton-acbr-node cosmemilton-acbr-node-linux-x64
npx --no-install acbr-node --help
npm run aula5
```

Esperado: `x86_64`, `linux x64`, SDK/runtime 0.1.2 e XML local. Use instalação própria do Node no Linux e mantenha checkout/dependências separados do Windows. Não reutilize o mesmo `node_modules` entre plataformas.

Não são necessários compiladores para consumir o runtime. `init`, `source update`, `generate` e `build` pertencem ao fluxo de reconstrução e não são passos obrigatórios deste tutorial.

Nesta entrega os exemplos rodaram em Debian 13 x64/glibc, Node 24.19.0. Isso não é um teste novo da instalação de WSL2 ou Ubuntu 24.04. Consulte [validação](../docs/VALIDACAO.md).
