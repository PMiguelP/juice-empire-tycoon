# Plano de melhorias para entrega

Este documento junta as alteracoes que ainda devem ser feitas para o projeto ficar mais limpo, mais facil de manter e mais alinhado com o enunciado do TP2.

## Prioridade alta

1. Atualizar o README
   - Substituir o README do template pelo README real do jogo.
   - Incluir nome do jogo, autores, numero de aluno, versao do Phaser, descricao, controlos, instalacao, execucao e screenshots.
   - Explicar a escolha de Vue + TypeScript + Phaser.
   - Documentar origem/formato dos assets, incluindo imagens e sons MP3.

2. Atualizar package.json
   - Alterar nome, descricao, autor, repository e homepage.
   - Remover referencias ao template oficial.

3. Criar condicao formal de vitoria/derrota
   - Vitoria sugerida: completar um numero fixo de contratos ou atingir um nivel alvo.
   - Derrota sugerida: falhar demasiados contratos seguidos ou chegar ao fim de um ciclo sem dinheiro minimo.
   - Criar overlay final com estado, estatisticas e botao para recomecar.

4. Completar internacionalizacao
   - Remover textos hardcoded em Vue e managers Phaser.
   - Traduzir minigames, toasts, prompts de interacao e textos de contratos.
   - Garantir que todo texto visivel passa por i18n.

5. Preparar entrega
   - Desligar debug da fisica Arcade.
   - Remover ficheiros de lixo como `.DS_Store`.
   - Confirmar que `node_modules` e `dist` nao entram no repositorio.
   - Criar tag `1.0`.

## Refatoracao de App.vue

`App.vue` esta demasiado grande e mistura estado global, eventos, audio, overlays, save/load e tempo de jogo. Separar em composables:

- `useOverlayState`
  - Estado de menus e overlays.
  - Funcoes para abrir/fechar menus.
  - Regra de fechar menus concorrentes.

- `useGameEvents`
  - Registo e limpeza dos eventos do EventBus.
  - Sincronizacao entre Vue e Phaser.
  - Evitar `EventBus.on/off` espalhado pelo componente raiz.

- `useGameAudio`
  - Sons de UI, ambiente de menu e feedback geral.
  - Pequena API `playUiSound`, `syncMenuAmbience`.

- `useSaveImportExport`
  - Exportar save JSON.
  - Importar save JSON.
  - Estado do input de ficheiro.

- `useClockAndContracts`
  - Relogio do jogo.
  - Fase do dia.
  - Resumo do contrato atual.
  - Progresso visual do nivel/objetivo.

## Refatoracao de TreeManager.ts

`TreeManager.ts` concentra plantacao, crescimento, pragas, rega, fertilizante, sulfato, desenho e persistencia. Separar em sistemas menores:

- `TreeGrowthSystem`
  - Crescimento de arvore.
  - Timers de crescimento.
  - Regeneracao de fruta.
  - Normalizacao de tempos.

- `TreePestSystem`
  - Regras de pragas.
  - Protecao por sulfato.
  - Probabilidade diaria de insetos.
  - Efeito da qualidade do sulfato.

- `TreePersistence`
  - Serializacao das arvores.
  - Criacao a partir do save.
  - Compatibilidade com versoes antigas de save.

- `TreeActions`
  - Plantar.
  - Regar.
  - Fertilizar.
  - Sulfatar.
  - Colher.

## Refatoracao de items.ts

`items.ts` deve passar de ficheiro unico para catalogo por dominio:

- `items/seeds.ts`
  - Sementes e metadados das arvores.

- `items/tools.ts`
  - Tesoura, regador, sulfatador, garrafoes, frascos e ferramentas.

- `items/fruit.ts`
  - Frutas, sumos e colheitas.

- `items/consumables.ts`
  - Fertilizantes, sulfatos e outros consumiveis.

- `items/index.ts`
  - Exporta o catalogo final.
  - Mantem funcoes publicas como `getItemId`, `getItemVisual`, `getMaxStack`.

## Refatoracao de i18n

Separar o ficheiro grande de traducoes:

- `i18n/pt.ts`
  - Traducoes portuguesas.

- `i18n/en.ts`
  - Traducoes inglesas.

- `i18n/index.ts`
  - Estado da lingua.
  - `useLanguage`.
  - Helpers como `itemLabel`.

## Melhorias de UI

1. Barra de progresso no nivel
   - Mostrar progresso do contrato/objetivo atual junto ao nivel.
   - Usar cor verde/amarela consoante progresso.
   - Quando nao houver contrato ativo, mostrar barra completa.

2. Menus e overlays
   - Reutilizar componentes de grelha.
   - Criar `InventoryGrid.vue` e `InventorySlot.vue`.
   - Reduzir duplicacao entre loja, venda, inventario e bau.

3. Feedback visual
   - Mensagens de erro consistentes.
   - Feedback curto para sem agua, sem sulfato, arvore com pragas, item errado e inventario cheio.

## Melhorias de assets

- Verificar se `mapa.json` ainda e usado.
- Remover assets antigos que ja nao entram no jogo.
- Manter assets totais abaixo de 10 MB.
- Garantir que todos os sons finais sao MP3, como definido.

## Checklist final antes de entregar

- README real concluido.
- Package metadata atualizada.
- Build de producao sem erros.
- Fisica debug desligada.
- I18n completo em PT/EN.
- Condicao de vitoria/derrota implementada.
- Restart funcional.
- Assets limpos.
- Save/load testado.
- Tag `1.0` criada.
