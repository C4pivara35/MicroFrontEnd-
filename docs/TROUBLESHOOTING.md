# Diagnóstico de problemas

## A tela aparece e depois fica vazia ou só com o fundo

Esse sintoma frequentemente indica erro JavaScript após a montagem inicial, falha no carregamento de remote/chunk ou incompatibilidade de dependências. A cor do fundo, sozinha, não identifica a causa.

1. Abra DevTools (`F12`) e consulte **Console**. Copie a primeira mensagem de erro, não somente os erros seguintes.
2. Em **Network**, filtre `remoteEntry`.
3. No desenvolvimento, confira:
   - `http://localhost:5001/remoteEntry.js`;
   - `http://localhost:5002/remoteEntry.js`.
4. Confirme que os três servidores estão ativos e o terminal não apresenta falha de compilação.
5. Recarregue o shell pela porta **5000**.
6. Em produção, use `npm run build` e sirva o `dist/` montado, não somente o build do shell.
7. Confira status e conteúdo de cada remote/chunk: JavaScript esperado, não uma página HTML.
8. Confira o nome do container e as versões singleton de React em todos os apps.

Este projeto contém limites de erro por módulo para apresentar uma mensagem em vez de derrubar toda a interface. Ainda é necessário consultar o Console quando um módulo estiver indisponível.

| Erro observado | Causa provável | Ação |
| --- | --- | --- |
| `ERR_CONNECTION_REFUSED` | Remote parado ou porta errada | Executar `npm run dev` na raiz e conferir as três portas |
| `ScriptExternalLoadError` | Download do remote falhou | Abrir a URL do remoteEntry e conferir Network |
| `Unexpected token '<'` | HTML recebido como JavaScript | Verificar pasta de deploy, MIME e rewrite/fallback |
| `ChunkLoadError` | Chunk ausente ou cache de versão antiga | Enviar todos os chunks e revalidar o manifest |
| `Shared module is not available for eager consumption` | Entrada síncrona antes do share scope | Preservar `import('./bootstrap')` |
| `Invalid hook call` | React duplicado ou versões incompatíveis | Manter singleton e mesma versão; reinstalar pelo lockfile |
| `Unsatisfied version` | Versões estritas de React diferentes | Alinhar React/ReactDOM de shell e remotes |
| Container ausente | Nome da federação diferente do esperado | Conferir `fitforge_workouts`/`fitforge_progress` e loader |

## npm não encontra o package.json

Você abriu o terminal fora da pasta raiz do projeto. Entre em `fitforge-federation`, onde estão `README.md` e `package.json`, e execute `npm ci`.

## Porta ocupada

O projeto usa portas 5000, 5001 e 5002. Encerre a instância antiga do projeto. Se precisar mudar uma porta, altere **também** sua referência no shell em `scripts/webpack.common.cjs`; não altere somente o devServer do remote.

No PowerShell, você pode identificar listeners sem encerrá-los automaticamente:

```powershell
Get-NetTCPConnection -LocalPort 5000,5001,5002 -State Listen
```

## Dados desaparecem quando abro outra URL

localStorage é associado à origem: protocolo, host e porta. `localhost:5000`, `localhost:5001`, `localhost:4173` e o domínio Azure são espaços diferentes. O app completo deve ser usado pelo shell. A exportação CSV guarda uma cópia do histórico; não implementa importação/restauração automática.

## Dados locais inválidos

O app preserva o conteúdo e apresenta erro. Para analisar sem sobrescrever:

1. DevTools → Application/Storage → Local Storage → origem do site.
2. Copie o valor da chave afetada para um arquivo antes de qualquer intervenção.
3. Confira se o valor tem `{ "version": 1, "items": [...] }` e os campos esperados.
4. Restaure manualmente um valor conhecido válido, ou remova **somente a chave afetada**, se você decidiu descartar seus dados.

Não limpe todo o armazenamento como primeira tentativa. Remover a chave de fichas faz os exemplos reaparecerem; remover a chave de sessões reinicia o histórico vazio.

## Não consigo registrar sessão na porta 5002

A página isolada do MFE de progresso demonstra a renderização e lê seu armazenamento daquela origem. A lista de fichas é recebida do shell por props. Use `http://localhost:5000/#/progress` para a integração completa; não há busca direta da porta 5002 no armazenamento da porta 5001.

## Produção funciona localmente, mas quebra no Azure

- Confirme que publicou o conteúdo do `dist/` raiz.
- Confirme as pastas `mfe-workouts` e `mfe-progress`.
- Não inclua um nível extra `dist/` no contêiner `$web`.
- Confira MIME de arquivos `.js`.
- Faça uma recarga sem cache e verifique manifests antigos.
- No Storage, use o endpoint **de site estático**.
- No Static Web Apps, mantenha `skip_app_build: true` no workflow preparado.
- Não remova arquivos de fallback das dependências compartilhadas.
- Não abra os HTML pelo protocolo `file://`.
