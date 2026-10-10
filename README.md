# FitForge

Aplicativo de treino de academia desenvolvido em **React**, utilizando **Module Federation** com Webpack 5, para a Atividade Formativa 13 de Arquitetura de Soluções Computacionais.

## Endereço publicado

**Site:** [Abrir FitForge](https://orange-glacier-0887de110.2.azurestaticapps.net/)

Hospedado no Azure Static Web Apps.

## Funcionalidades

- **Meus treinos:** criar, consultar, editar e excluir fichas com exercícios, séries, repetições e cargas.
- **Meu progresso:** registrar, consultar, editar e excluir sessões de treino, acompanhar indicadores e exportar o histórico em CSV.

## Arquitetura

O projeto possui três aplicações: um **shell**, responsável pela navegação e integração, e dois **microfrontends**, responsáveis por treinos e progresso. Os módulos são carregados em tempo de execução por Module Federation.

Os dados são armazenados no navegador com **localStorage**.

## Executar localmente

Requisito: Node.js 22 ou superior.

```bash
npm ci
npm run dev
```

Acesse http://localhost:5000. Para gerar os arquivos de publicação, execute `npm run build`.

## Integrantes

- Andryus Zolet
- Nicolas Medeiros
- Valentin Rojas
- Leonardo Henrique

Os integrantes também estão registrados no arquivo `GRUPO.md`.
