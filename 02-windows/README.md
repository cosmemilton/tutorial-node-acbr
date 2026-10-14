# Aula 2 — Windows x64

Com Node.js 22.12+ x64 instalado, abra PowerShell na raiz deste repositório:

```powershell
node --version
node -p "process.platform + ' ' + process.arch"
npm ci --ignore-scripts --no-audit --no-fund
npm run verificar
npm ls cosmemilton-acbr-node cosmemilton-acbr-node-win32-x64
npx --no-install acbr-node --help
```

Esperado: `win32 x64`, SDK 0.1.2 e funções `TNFe`, `criarEmissor`, `diagnosticarErro` importadas. O runtime Windows também deve estar em 0.1.2. A importação verifica a API JavaScript; a geração da aula 5 exercita o motor nativo.

Se PowerShell bloquear `npm.ps1`, use `npm.cmd` e `npx.cmd`, sem alterar a política de segurança da máquina. Se faltar runtime, confira arquitetura e dependências opcionais; não baixe DLLs avulsas de sites desconhecidos. Não copie `node_modules` do Linux para Windows.

Os comandos Windows estão documentados; esta entrega foi testada em Linux, sem nova execução Windows. Os fontes das aulas 5/6 vieram dos pacotes usados nas capturas Windows.
