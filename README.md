# FitForge — app de treino com React + Module Federation

Link para o site : https://orange-glacier-0887de110.2.azurestaticapps.net/

Aplicativo acadêmico de academia, com interface responsiva em **cinza escuro e laranja**, construído como um **shell e dois microfrontends reais**. O shell carrega os módulos de treino e progresso em tempo de execução com **Webpack 5 Module Federation**.

## Endereço publicado

**Status: publicação pendente.** Este trabalho só estará completo após a publicação real e o registro da URL. O workflow do Static Web Apps registra a URL após verificar o site e os dois manifests; para Storage, use `npm run site:registrar -- --url https://ENDERECO-REAL/`.

## Comece aqui

1. Clone este repositório ou extraia a pasta `fitforge-federation` do ZIP.
2. Instale o Node.js **22 LTS ou superior**, com npm 10 ou superior.
3. Abra o terminal **dentro da pasta que contém este README e o package.json raiz**.
4. Execute:

```bash
npm ci
npm run dev
```

5. Espere os três servidores indicarem que estão prontos.
6. Abra **http://localhost:5000**. Use essa URL para navegar pelo aplicativo completo.

Os comandos funcionam no PowerShell, Prompt de Comando, Bash e terminal do VS Code. Não é necessário XAMPP, banco de dados, Docker nem API.

| Aplicativo | Porta | Responsabilidade |
| --- | --- | --- |
| Shell | 5000 | Layout, navegação, visão geral e integração |
| MFE de treinos | 5001 | Fichas e exercícios |
| MFE de progresso | 5002 | Sessões, histórico e indicadores |

`npm run dev` inicia os três processos ao mesmo tempo. `Ctrl+C` encerra o conjunto. Caso uma porta esteja ocupada, encerre o processo que a utiliza antes de iniciar; a porta não muda silenciosamente.

## Funcionalidades

### 1. Meus treinos — CRUD completo de fichas

- Criar uma ficha com nome, descrição opcional e dias da semana.
- Inserir de 1 a 30 exercícios por ficha.
- Definir grupo muscular, séries, repetições, carga e descanso por exercício.
- Visualizar o resumo e expandir a lista de exercícios.
- Editar a ficha inteira e seus exercícios.
- Duplicar uma ficha para criar uma variação sem alterar a original.
- Excluir com confirmação.
- Buscar por nome e filtrar por dia.
- Abrir o registro de sessão com a ficha já selecionada.

### 2. Meu progresso — CRUD completo de sessões

- Registrar uma sessão já realizada, vinculando-a a uma ficha.
- Informar data, duração, esforço percebido de 1 a 10 e observações.
- Informar peso corporal opcional, sem tornar esse dado obrigatório.
- Consultar, editar e excluir sessões.
- Filtrar histórico por semana, mês ou todo o período.
- Exportar os registros do filtro atual em CSV compatível com Excel.
- Consultar sessões totais, minutos acumulados, sessões na semana e último peso informado.
- Acompanhar minutos de treino por dia na semana atual.
- Preservar o nome histórico de uma ficha mesmo depois de ela ser excluída.

### Visão geral

Painel no shell com fichas disponíveis, sessões e minutos na semana, dias ativos, fichas programadas para hoje, atividade semanal e últimas sessões. Os dados vêm das APIs federadas dos dois módulos.

**O histórico começa vazio.** As três fichas iniciais são exemplos editáveis para demonstrar o funcionamento; os indicadores de progresso só crescem quando você registra sessões.

## Armazenamento e regras

A persistência é feita no **localStorage do navegador**. Cada domínio possui sua própria chave e seu próprio repositório:

| Domínio | Chave |
| --- | --- |
| Treinos | `fitforge.workouts.v1` |
| Sessões | `fitforge.sessions.v1` |

- Recarregar a página preserva os dados na mesma origem.
- Outro navegador, dispositivo, porta ou domínio possui outro armazenamento.
- Os dados de localhost não são transferidos automaticamente para o Azure.
- Limpar os dados do site remove os registros locais.
- Sem login, sincronização em nuvem ou banco de dados nesta versão.
- Duas abas da mesma origem recebem atualizações via evento `storage`.
- O shell recebe atualizações dos módulos via eventos de domínio.
- Dados inválidos não são apagados ou substituídos silenciosamente.
- Se o armazenamento estiver bloqueado ou cheio, a interface apresenta erro e não confirma o salvamento.
- As fichas de exemplo aparecem quando a chave ainda não existe. Excluir todas as fichas salva uma lista vazia e não recria os exemplos a cada recarga.

### Validação

| Campo | Regra |
| --- | --- |
| Nome da ficha/exercício | 2 a 80 caracteres; sem aceitar somente espaços |
| Dias | Pelo menos um; sem repetições |
| Exercícios | 1 a 30; identificadores únicos |
| Séries | Inteiro de 1 a 20 |
| Repetições | Inteiro de 1 a 100 |
| Carga | 0 a 500 kg, formulário em incrementos de 0,5 kg |
| Descanso | Inteiro de 0 a 600 segundos |
| Data da sessão | Data de calendário válida; não futura |
| Duração | Inteiro de 1 a 360 minutos |
| Esforço | Inteiro de 1 a 10 |
| Peso opcional | 20 a 400 kg, formulário em incrementos de 0,1 kg |
| Observações | Até 500 caracteres |

A semana vai de segunda a domingo. Datas são tratadas no calendário local, evitando o deslocamento de um dia causado pelo parsing UTC de strings `YYYY-MM-DD`. Volume planejado = soma de séries × repetições × carga cadastrada. Esse valor não representa carga efetivamente executada e não dobra automaticamente a carga dos halteres.

## Estrutura do código

| Caminho | Conteúdo |
| --- | --- |
| `apps/shell/src/App.jsx` | Navegação, dashboard e integração dos módulos |
| `apps/workouts/src/App.jsx` | Interface e formulário de fichas |
| `apps/workouts/src/api.js` | Repositório e exemplos do domínio de treino |
| `apps/progress/src/App.jsx` | Interface e formulário de sessões |
| `apps/progress/src/api.js` | Repositório do domínio de progresso |
| `apps/*/src/index.jsx` | Entrada assíncrona para inicializar a federação |
| `apps/*/src/bootstrap.jsx` | Montagem React de cada aplicativo |
| `apps/*/webpack.config.cjs` | Identidade e exposições de cada build |
| `packages/shared/src/domain.js` | Contratos, validação e calendário |
| `packages/shared/src/storage.js` | Infraestrutura de persistência |
| `packages/shared/src/ui.jsx` | Componentes de interface e limite de erros |
| `packages/shared/src/styles.css` | Paleta, layout e responsividade |
| `scripts/webpack.common.cjs` | Configuração Webpack e Module Federation |
| `scripts/assemble.mjs` | Montagem dos três builds no `dist/` final |
| `scripts/serve.mjs` | Servidor simples para conferir o build local |
| `tests/` | Testes de domínio, persistência e integração federada |
| `docs/ARQUITETURA.md` | Explicação dos módulos e relação com os PDFs |
| `docs/AZURE.md` | Publicação detalhada em Static Web Apps e Storage |
| `docs/TESTES.md` | Cobertura automatizada e roteiro manual |
| `docs/TROUBLESHOOTING.md` | Diagnóstico de tela vazia, portas, chunks e armazenamento |
| `GRUPO.md` | Nome dos integrantes |

## Module Federation implementado

Os módulos não são apenas pastas de um único bundle. Há **três compilações distintas**, cada uma com runtime e identidade próprios. Os remotes expõem:

| Container | Exposições | Uso pelo shell |
| --- | --- | --- |
| `fitforge_workouts` | `./App`, `./api` | `import('workouts/App')`, `import('workouts/api')` |
| `fitforge_progress` | `./App`, `./api` | `import('progress/App')`, `import('progress/api')` |

O shell não importa diretamente os arquivos internos de outro app. O pacote compartilhado contém contratos e design system; os repositórios e os dados continuam separados por domínio.

React e ReactDOM são configurados como **singletons**, com a mesma versão e verificação estrita. As entradas usam `import('./bootstrap')` para evitar o consumo síncrono das dependências antes da inicialização do compartilhamento.

Em desenvolvimento, o host busca `remoteEntry.js` nas portas 5001 e 5002. Em produção, busca `mfe-workouts/remoteEntry.js` e `mfe-progress/remoteEntry.js` relativos à base do site. `publicPath: 'auto'` permite que cada remote encontre seus próprios chunks. Os nomes `uniqueName` evitam colisões de runtimes.

O exemplo do PDF usa Vite e seu plugin de federação. Esta implementação usa o **plugin nativo do Webpack 5**, mantendo a arquitetura host/remotes e a integração em runtime exigidas pela atividade.

## Comandos

| Comando | Resultado |
| --- | --- |
| `npm ci` | Instala as versões registradas no lockfile |
| `npm run dev` | Inicia shell e dois remotes em desenvolvimento |
| `npm run build:remotes` | Compila os dois remotes |
| `npm run build:shell` | Compila somente o shell |
| `npm run build` | Compila os três apps e gera o `dist/` unificado |
| `npm run preview` | Serve `dist/` em http://localhost:4173 |
| `npm test` | Testes de domínio e armazenamento |
| `npm run test:integration` | Executa os bundles de `dist/` em DOM simulado; exige build prévio |
| `npm run check` | Testes, build e integração em sequência |

## Build para publicação

```bash
npm run build
npm run preview
```

Publique o **conteúdo de `dist/`**, mantendo as subpastas:

```text
index.html
main.<hash>.js
outros chunks do shell...
staticwebapp.config.json
mfe-workouts/remoteEntry.js
mfe-workouts/outros chunks...
mfe-progress/remoteEntry.js
mfe-progress/outros chunks...
```

Não abra `dist/index.html` por duplo clique: Module Federation precisa de HTTP/HTTPS. Não envie somente `index.html`, nem somente os arquivos `remoteEntry.js`. Todos os chunks dos remotes devem acompanhar o deploy.

## Publicação no Azure

O passo a passo está em [docs/AZURE.md](docs/AZURE.md), com duas alternativas:

1. **Azure Static Web Apps**, incluindo GitHub Actions manual já preparado.
2. **Azure Storage Account**, habilitando hospedagem de site estático e enviando `dist/` ao contêiner `$web`.

A navegação usa `#/overview`, `#/workouts` e `#/progress`, funcionando sem regras especiais de rewrite do Storage. No Static Web Apps, há configuração de MIME types, fallback sem reescrever remotes inexistentes e cache dos manifests.

## Conformidade acadêmica

| Requisito da Atividade Formativa 13 | Implementação |
| --- | --- |
| Frontend React | React 18.3.1 nos três aplicativos |
| Module Federation | Webpack 5, dois containers remotos reais |
| No mínimo duas funcionalidades | CRUD de fichas e CRUD de sessões |
| Arquivo GRUPO.md | Incluído com os quatro integrantes informados |
| Publicação no Azure | Workflow e build preparados; confira o status no início deste README |
| URL do Azure no README | Registrada após deploy por verificação automática |
| Link público do GitHub no AVA | Criar/subir o repositório e informar seu link após publicação |

O PDF ASC12 exige microserviços e dois CRUD de **backend** em outra atividade. Este projeto entrega o **frontend da Atividade 13**; os CRUD locais não são microserviços nem banco por serviço. Veja a distinção e o plano de evolução em `docs/ARQUITETURA.md`.

## Visual e acessibilidade

- Fundo `#141619`, painéis `#1e2025`, destaque laranja `#ff7b32`.
- Layout de desktop com navegação lateral; menu compacto no celular.
- Campos com rótulos, foco visível e botões de ícone com nomes acessíveis.
- Modais nativos `<dialog>`, fechamento por Escape, retorno de foco e confirmação de exclusão.
- Gráfico semanal com descrição textual para tecnologias assistivas.
- Respeito à preferência de movimento reduzido.
- Fontes do sistema, sem dependência de CDN de fontes ou imagens externas.

## Integrantes e entrega

Os quatro integrantes estão identificados em `GRUPO.md`. Antes de enviar ao AVA, publique no Azure, preencha a URL deste README e torne o repositório GitHub acessível conforme as instruções do professor.

## Referências

Materiais fornecidos: ASC10-MICROFRONTEND; ASC11-Microservices + Database per Service + API Gateway + BFF; ASC12-Microservices. A associação entre conceitos e implementação está em `docs/ARQUITETURA.md`.

Documentação técnica consultada:

- [Webpack — Module Federation](https://webpack.js.org/concepts/module-federation/)
- [Webpack — ModuleFederationPlugin](https://webpack.js.org/plugins/module-federation-plugin/)
- [Microsoft — configuração de build do Static Web Apps](https://learn.microsoft.com/en-us/azure/static-web-apps/build-configuration)
- [Microsoft — configuração do Static Web Apps](https://learn.microsoft.com/en-us/azure/static-web-apps/configuration)
- [Microsoft — hospedagem estática no Storage](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blob-static-website)

## Conferência final de entrega

Após publicar, execute:

```bash
npm run entrega:verificar
```

O comando retorna erro enquanto não houver URL publicada registrada ou os arquivos de build estiverem ausentes. Com a URL presente, verifica HTTP, MIME e os dois containers de federação. Ele não confirma visualmente o app, não verifica a propriedade do recurso Azure nem consegue descobrir os nomes de alunos não informados.

Para Azure Storage ou caso o workflow não possa escrever em uma branch protegida:

```bash
npm run site:registrar -- --url https://ENDERECO-REAL-DO-AZURE/
npm run entrega:verificar
```

Depois, envie o README atualizado ao GitHub. Não substitua a URL por um exemplo: use somente o endereço real de publicação. `README.md` é o arquivo README do repositório solicitado no enunciado como Readme.MD.

## Código-fonte para GitHub

Este repositório contém somente o código-fonte e as configurações. `node_modules/`, `dist/`, caches e logs ficam fora do versionamento. O `package-lock.json` é mantido para instalação reproduzível.

Na raiz do projeto, para criar o primeiro commit:

```bash
git init
git add .
git commit -m "feat: adicionar FitForge com React e Module Federation"
git branch -M main
```

Crie um repositório vazio no GitHub, copie sua URL e execute, substituindo a URL de exemplo:

```bash
git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
git push -u origin main
```

Para enviar pelo navegador, use **Add file → Upload files** e envie o conteúdo da pasta do projeto. Preserve também `.github/workflows/`, `.gitignore`, `.gitattributes` e `.nvmrc`; o envio por Git é preferível para manter esses arquivos. O `package.json` deve ficar na raiz do repositório, sem um nível extra de pasta.

Os arquivos para hospedar são gerados com `npm run build`. A pasta `dist/` é usada no deploy e não precisa ser enviada ao GitHub.
