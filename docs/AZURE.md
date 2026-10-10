# Publicação no Azure

O mesmo `dist/` serve para Azure Static Web Apps e para site estático no Azure Storage. O Azure Storage Account é a “conta de armazenamento” citada no pedido.

## Antes de publicar

1. Confira os quatro nomes já incluídos em `GRUPO.md`.
2. Execute `npm ci` na raiz.
3. Execute `npm run check` e confira o resultado.
4. Execute `npm run preview` e abra `http://localhost:4173` para conferir o visual no seu navegador.
5. Verifique treinos, sessões, menu móvel e recarga das rotas.
6. Crie um repositório no GitHub e envie o código, inclusive `package-lock.json`, `docs/`, os três apps e os workflows.
7. Não envie `node_modules`, tokens, arquivos `.env` ou dados pessoais de teste.

O build produz uma pasta `dist/` com todos os aplicativos. Não publique `apps/shell/dist` sozinho: essa pasta ainda não contém os dois remotes copiados pelo script de montagem.

## Alternativa A — Azure Static Web Apps com GitHub Actions

### 1. Criar o recurso

1. Acesse o portal do Azure.
2. Procure **Static Web Apps / Aplicativos Web Estáticos**.
3. Crie o recurso na assinatura e no grupo de recursos apropriados.
4. Defina um nome, por exemplo `fitforge-frontend`.
5. Selecione plano e região disponíveis para sua assinatura. Confira os custos apresentados pelo portal.
6. Para usar o workflow manual deste repositório, selecione a origem de implantação **Other / Outros**, quando disponível, evitando criar outro workflow de deploy automático.
7. Revise e crie.

Se você escolher integração GitHub pelo portal, ele pode gerar um segundo workflow. Use uma única estratégia de publicação: o workflow manual incluído ou o workflow gerado adaptado. Não deixe dois deploys concorrentes apontando para o mesmo recurso.

### 2. Configurar o token

1. Abra o Static Web App criado.
2. Encontre **Manage deployment token / Gerenciar token de implantação**.
3. Copie o token.
4. No repositório GitHub, abra **Settings → Secrets and variables → Actions**.
5. Crie um repository secret chamado exatamente:

```text
AZURE_STATIC_WEB_APPS_API_TOKEN
```

6. Cole o token como valor do secret. Não o coloque no README nem no código.

### 3. Executar a publicação

1. Confira se a branch com o código está no GitHub.
2. Abra **Actions**.
3. Selecione **Publicar no Azure Static Web Apps**.
4. Clique em **Run workflow** e escolha a branch.
5. Acompanhe instalação, testes, build, integração e upload.
6. Abra a URL fornecida pelo recurso Azure.

O arquivo `.github/workflows/azure-static-web-apps.yml` usa:

```yaml
app_location: dist
api_location: ""
output_location: ""
skip_app_build: true
```

O build já é executado por `npm run build` em uma etapa anterior. Com `skip_app_build: true`, `app_location` aponta para os artefatos prontos; `output_location` fica vazio. Não configure a ação para compilar novamente somente o shell.

O workflow é **manual** para que você publique quando estiver pronto. O workflow `ci.yml` roda verificação em push para `main` e pull requests, sem criar recursos Azure. Se quiser publicação automática após a configuração, altere o gatilho de deploy para push na branch escolhida e remova workflows duplicados.

### 4. Configuração do Static Web Apps

`staticwebapp.config.json` é copiado automaticamente para `dist/` e contém:

- MIME type JavaScript adequado.
- `X-Content-Type-Options: nosniff`.
- Política de referrer.
- `Cache-Control: no-cache` para `index.html` e os dois manifests remotos.
- Fallback para `index.html`, excluindo arquivos JS/CSS/JSON e pastas dos remotes.

Essa exclusão é importante: um `remoteEntry.js` que não existe deve resultar em erro de recurso, e não receber HTML no lugar de JavaScript.

### 5. Conferir depois do deploy

1. Abra o aplicativo pela URL HTTPS do Azure.
2. No DevTools → Network, confirme status 200 para:
   - `mfe-workouts/remoteEntry.js`;
   - `mfe-progress/remoteEntry.js`;
   - os chunks solicitados em seguida.
3. Confira que esses recursos retornam JavaScript, não `<!doctype html>`.
4. Crie uma ficha e uma sessão, recarregue e confira a persistência.
5. Abra `#/workouts` e `#/progress` diretamente.
6. Confira a versão móvel.
7. O workflow verifica a URL real retornada pelo deploy e atualiza o README no repositório. Se a branch estiver protegida, faça a atualização local descrita abaixo.

## Alternativa B — Azure Storage Account

### 1. Criar a conta

1. No portal, procure **Storage accounts / Contas de armazenamento**.
2. Crie uma conta compatível com hospedagem de site estático, por exemplo **StorageV2**.
3. Defina assinatura, grupo de recursos, nome globalmente único e região disponível.
4. Escolha redundância e demais opções conforme a necessidade do trabalho e os custos exibidos.
5. Revise e crie.

### 2. Ativar hospedagem estática

1. Abra a conta.
2. Procure **Static website / Site estático**.
3. Habilite a opção.
4. Informe **Index document name**: `index.html`.
5. Deixe documento de erro sem um HTML que mascare arquivos JS inexistentes. Este app usa rotas hash, então não depende de uma página 404 funcionando como roteador.
6. Salve.
7. Copie o **Primary endpoint / Ponto de extremidade primário** do site estático.

O Azure cria o contêiner `$web`. O endpoint de site estático é a URL destinada a servir o aplicativo; não use uma URL de um blob individual como endereço principal do app.

### 3. Fazer upload preservando subpastas

1. Execute `npm run build` localmente.
2. Abra `$web` no Azure Storage Explorer ou outra ferramenta que preserve a estrutura das pastas.
3. Envie **o conteúdo de `dist/`**, não a pasta `dist` como nível extra.
4. Confirme que existem diretamente na raiz:
   - `index.html`;
   - chunks do shell;
   - a pasta `mfe-workouts`;
   - a pasta `mfe-progress`.
5. Dentro de cada pasta de MFE, confira `remoteEntry.js` e todos os demais chunks.
6. Confira `Content-Type: application/javascript` nos arquivos `.js` e `text/html` no HTML.

Se o upload pelo portal não preservar pastas, use Storage Explorer ou o comando abaixo. Não mova os chunks dos remotes para a raiz: o runtime os procura em sua própria pasta.

### 4. Upload com Azure CLI (opcional)

Instale a Azure CLI e execute no terminal Bash ou PowerShell, dentro do projeto:

```bash
az login
az account show
az storage blob upload-batch --account-name NOME_DA_CONTA --destination '$web' --source dist --overwrite --auth-mode login
```

Substitua `NOME_DA_CONTA` pelo nome real. O valor `'$web'` deve permanecer entre aspas simples para não ser interpretado como variável do shell. No Prompt de Comando do Windows (cmd.exe), use `"$web"` em vez de aspas simples.

O comando pressupõe que sua identidade já tem autorização de escrita nos blobs, por exemplo o papel apropriado de acesso a dados de blobs. Se houver erro de autorização, confira a identidade e as permissões no recurso; não publique uma chave da conta no repositório.

### 5. Cache no Storage

O Storage **não interpreta `staticwebapp.config.json`**. Os headers dessa configuração pertencem ao Static Web Apps.

Defina propriedades de cache dos blobs pela ferramenta de upload ou pelo portal. Exemplo Bash/PowerShell para os manifests e o HTML:

```bash
az storage blob update --account-name NOME_DA_CONTA --container-name '$web' --name index.html --content-cache-control 'no-cache' --content-type 'text/html' --auth-mode login
az storage blob update --account-name NOME_DA_CONTA --container-name '$web' --name mfe-workouts/remoteEntry.js --content-cache-control 'no-cache' --content-type 'application/javascript' --auth-mode login
az storage blob update --account-name NOME_DA_CONTA --container-name '$web' --name mfe-progress/remoteEntry.js --content-cache-control 'no-cache' --content-type 'application/javascript' --auth-mode login
```

O site estático do Storage não oferece configuração de CORS por esse recurso nem configuração direta de headers HTTP personalizados. Hospedar shell e remotes na **mesma origem**, como neste projeto, evita depender de integração entre origens. Para requisitos adicionais de domínio/headers/cache, avalie uma camada apropriada de entrega, conforme documentação Azure.

### 6. Testar e registrar a URL

Use o endpoint primário HTTPS do site estático. Faça os mesmos testes da alternativa A e preencha a URL real no README. Os dados continuam locais ao navegador, mesmo com a interface hospedada na nuvem.

## Atualizações sem quebra de chunks

Para deploys manuais posteriores:

1. Gere o novo `dist/`.
2. Envie primeiro todos os chunks com hash, preservando temporariamente versões anteriores.
3. Substitua os manifests `remoteEntry.js` e depois o HTML do shell.
4. Revalide o cache dos manifests/HTML.
5. Teste as duas áreas.
6. Remova chunks antigos somente após uma janela de compatibilidade adequada.

Apagar todos os chunks antes de enviar a versão nova pode interromper usuários que estavam com a página aberta. O build local limpa suas pastas de saída; o upload remoto não precisa apagar os arquivos antigos imediatamente.

## Finalizar a entrega acadêmica

- [ ] Os dois módulos funcionam na URL publicada.
- [ ] O README contém o endereço real.
- [ ] `GRUPO.md` contém todos os alunos.
- [ ] O repositório está público ou acessível conforme exigido pelo professor.
- [ ] O link do repositório foi enviado no AVA.
- [ ] Não há URLs localhost usadas pelo shell de produção.

## Documentação oficial consultada

- [Build configuration](https://learn.microsoft.com/en-us/azure/static-web-apps/build-configuration)
- [Static Web Apps configuration](https://learn.microsoft.com/en-us/azure/static-web-apps/configuration)
- [Static website hosting in Azure Storage](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blob-static-website)
- [Host a static website in Azure Storage](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blob-static-website-how-to)

## Registro obrigatório do endereço e conferência final

O workflow inclui a verificação do site e dos dois manifests. Depois do deploy, utiliza o output oficial `static_web_app_url` da ação do Azure e grava a URL real no README. O workflow requer permissão `contents: write` para enviar esse commit. Se regras de proteção da branch bloquearem o push, o deploy pode já ter terminado; atualize o README localmente e envie por pull request.

Para Storage ou atualização manual:

```bash
npm run site:registrar -- --url https://ENDERECO-REAL-DO-SITE/
npm run entrega:verificar
```

A URL deve ser HTTPS e apontar à base do site. O comando só altera o README depois de verificar o HTML do FitForge e JavaScript dos containers `fitforge_workouts` e `fitforge_progress`. As regras de entrega só estarão completas depois da publicação real, nomes completos em GRUPO.md e envio do README com endereço ao repositório.

Output do workflow: [definição oficial da ação Azure](https://github.com/Azure/static-web-apps-deploy/blob/v1/action.yml).
