# Verificação

## Comandos

```bash
npm test
npm run build
npm run test:integration
```

Ou execute `npm run check` para o conjunto.

## Testes de domínio e armazenamento

`tests/domain.test.mjs` usa o test runner nativo do Node e cobre:

1. Campos e limites das fichas; dias/exercícios obrigatórios; volume planejado.
2. Campos e limites das sessões; datas futuras e valores inválidos.
3. Datas de calendário e anos bissextos.
4. Semana de segunda a domingo, sessões múltiplas e virada de ano.
5. CRUD persistido, leitura por nova instância do repositório e isolamento de chaves.
6. Preservação de JSON inválido sem sobrescrita.
7. Erros de quota e validação que não informam sucesso falso.

## Integração com bundles de produção

`tests/federation.integration.mjs` usa **JSDOM** e carrega os arquivos JavaScript reais gerados em `dist/`, com URLs virtuais mapeadas aos arquivos locais. Não troca os remotes por mocks de componentes.

A suíte verifica:

- Inicialização do shell e dos dois containers de federação.
- Renderização do componente de treinos carregado remotamente.
- Criação e edição de ficha pelo formulário.
- Passagem da ficha selecionada do shell ao MFE de progresso.
- Criação, edição e exclusão de sessão.
- Exclusão da ficha preservando a sessão e seu snapshot de nome.
- Carregamento de recursos quando o site está em uma subpasta.
- Ausência do remote de treinos sem derrubar o shell e o progresso.

O DOM simulado não substitui um navegador real: não faz layout visual, não valida comportamento nativo de `<dialog>` nem mede acessibilidade completa. Os métodos de diálogo são simulados nos testes. Confira visualmente em desktop e celular antes da entrega.

## Roteiro manual

### Inicialização e visão geral

1. Execute `npm ci` e `npm run dev`.
2. Abra a porta 5000, confirme as três fichas de exemplo e histórico vazio.
3. Confira a rota inicial, breadcrumb e navegação.
4. Verifique que o painel não exibe sessões fictícias.

### Fichas

1. Crie “Treino teste” com dois exercícios e dois dias.
2. Experimente os limites de números e campos obrigatórios.
3. Confira o detalhe dos exercícios.
4. Busque pelo nome e filtre pelo dia.
5. Edite nome, carga e dias.
6. Duplique e confira que alterar a cópia não altera a original.
7. Cancele uma exclusão e confirme que nada foi removido.
8. Exclua a cópia e confirme a atualização da lista.

### Sessões

1. Na ficha, clique em Registrar sessão e confirme sua seleção automática.
2. Salve data passada, duração, esforço e nota.
3. Confira histórico, indicadores e gráfico.
4. Edite duração, data e peso.
5. Confira filtros de semana e mês.
6. Exporte o filtro em CSV e abra em editor/Excel, conferindo acentos.
7. Exclua a ficha original e confirme que a sessão continua no histórico.
8. Edite a sessão sem a ficha e confirme a preservação do nome.
9. Exclua a sessão com confirmação.

### Persistência e falhas

1. Recarregue e confira fichas/sessões.
2. Abra uma segunda aba na mesma origem, altere uma ficha e confira a atualização da primeira.
3. Encerre o servidor de treinos (5001) e recarregue o shell.
4. Confira mensagem de erro e navegação/progresso disponíveis.
5. Reinicie o servidor e recarregue novamente.
6. Execute o build de produção, abra pelo preview e repita o fluxo.

### Responsividade e acessibilidade

1. Teste largura de celular de 360 px, tablet e desktop.
2. Confira ausência de rolagem horizontal e legibilidade dos formulários.
3. Abra/feche o menu móvel.
4. Navegue usando Tab e Shift+Tab; confira foco visível.
5. Abra o modal, teste Escape e retorno do foco ao botão anterior.
6. Confira títulos dos botões de ícone e rótulos dos campos.
7. Ative movimento reduzido e confira que as animações não ficam obrigatórias.

### Azure

1. Confira JavaScript dos dois manifests e chunks na aba Network.
2. Abra links com hash e recarregue.
3. Repita um CRUD de ficha e sessão.
4. Registre no README a URL real.

## Cobertura atual

11 testes unitários (7 de domínio/persistência e 4 de registro do site) e 3 testes de integração federada. Execute `npm run check` para validar o código, gerar o build e testar os módulos juntos.
