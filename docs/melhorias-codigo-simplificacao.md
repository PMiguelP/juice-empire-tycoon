# Melhorias de Codigo e Simplificacao

Este documento lista as melhorias de codigo que ainda fazem sentido depois da refatoracao atual. O objetivo e deixar o projeto facil de explicar, com ficheiros pequenos, funcoes simples e responsabilidades claras, sem perder nenhuma funcionalidade do jogo.

## Objetivo Principal

O codigo deve ficar organizado assim:

- Cada ficheiro deve ter uma responsabilidade clara.
- Cada funcao deve fazer uma coisa simples.
- A logica de jogo deve ficar separada da logica visual.
- O estado do jogador deve continuar centralizado e facil de guardar.
- Os overlays Vue devem ser componentes pequenos e previsiveis.
- Os managers Phaser devem ser simples de seguir durante a apresentacao.

## Estado Atual dos Maiores Ficheiros

Estes sao os ficheiros que ainda merecem atencao por tamanho ou complexidade:

| Ficheiro | Linhas atuais | Problema principal |
|---|---:|---|
| `src/App.vue` | 540 | Ainda liga demasiadas coisas ao mesmo tempo |
| `src/composables/usePlayerData.ts` | 358 | Estado global, save/load, progresso, contratos e inventario no mesmo sitio |
| `src/game/scenes/game/TreeManager.ts` | 306 | Ainda concentra varias acoes das arvores |
| `src/ui/ShopOverlay.vue` | 300 | UI da loja ainda tem muito layout e regras no mesmo ficheiro |
| `src/game/scenes/game/PlayerManager.ts` | 295 | Movimento, animacoes, estado e emissao de save juntos |
| `src/ui/SellOverlay.vue` | 288 | UI de venda ainda pode ser partida em componentes pequenos |
| `src/ui/minigames/WaterPipePuzzle.vue` | 269 | Puzzle visual e logica do puzzle no mesmo componente |
| `src/composables/useRadialActions.ts` | 253 | Muitas decisoes de gameplay num unico composable |
| `src/items.ts` | 241 | Agregador ainda tem demasiadas funcoes de items |
| `src/game/scenes/Game.ts` | 238 | Ja esta melhor, mas ainda pode ficar mais orquestrador puro |
| `src/game/scenes/game/TreePlantingSystem.ts` | 221 | Plantacao, preview e validacao ainda podem ser separados |
| `src/composables/useInventory.ts` | 218 | Esta aceitavel, mas ainda pode separar operacoes de stack |

## Prioridade 1 - Melhorias Mais Importantes

### 1. Reduzir mais o `App.vue`

O `App.vue` ja esta muito melhor, mas ainda faz demasiada ligacao direta entre composables, menus, eventos e UI.

Separar em:

- `src/composables/app/useAppBootstrap.ts`
- `src/composables/app/useAppMenus.ts`
- `src/composables/app/useAppActions.ts`
- `src/composables/app/useAppSave.ts`

Resultado esperado:

- `App.vue` ficaria idealmente entre 180 e 250 linhas.
- O template ficaria quase so com componentes principais.
- A parte de script ficaria mais facil de explicar.

Exemplo de objetivo:

```ts
const app = useAppBootstrap();
const menus = useAppMenus(app);
const actions = useAppActions(app, menus);
```

### 2. Separar melhor o `usePlayerData.ts`

Este ficheiro e importante porque guarda quase tudo. Nao convem espalhar estado sem cuidado, mas podemos separar acoes.

Criar:

- `src/composables/playerData/createInitialState.ts`
- `src/composables/playerData/saveLoad.ts`
- `src/composables/playerData/playerActions.ts`
- `src/composables/playerData/plotActions.ts`
- `src/composables/playerData/contractActions.ts`

O `usePlayerData.ts` ficaria apenas a montar o estado e devolver as funcoes.

Resultado esperado:

- Mais facil explicar o save.
- Mais facil provar que posicao, arvores, inventario, dinheiro, nivel e contratos sao guardados.
- Menos risco de uma alteracao em contratos afetar inventario.

### 3. Separar `TreeManager.ts`

O `TreeManager.ts` ainda pode ser dividido de forma mais clara.

Separar em:

- `TreeActionHandler.ts`
  - plantar
  - regar
  - fertilizar
  - sulfatar
  - colher

- `TreeStateEmitter.ts`
  - emitir alteracoes das arvores para Vue
  - serializar estado

- `TreeQueries.ts`
  - encontrar arvore perto do jogador
  - validar se pode interagir
  - procurar arvore por tile

Resultado esperado:

- `TreeManager.ts` fica so como coordenador.
- As regras de cada acao ficam isoladas.
- Mais simples explicar o ciclo: plantar -> crescer -> pragas -> tratar -> colher.

### 4. Separar `TreePlantingSystem.ts`

Este ficheiro agora trata a grelha 5x5 e validacao da plantacao. Deve ficar dividido porque mistura preview visual com regras.

Separar em:

- `PlantingPreview.ts`
  - desenhar quadrados verdes/vermelhos
  - esconder preview
  - atualizar posicao do rato

- `PlantingValidator.ts`
  - verificar se esta dentro de field1/field2/field3/field4
  - verificar se a area 5x5 esta livre
  - verificar se nao bate em arvores/obstaculos

- `PlantingInput.ts`
  - clique para plantar
  - Esc para cancelar

Resultado esperado:

- Se a grelha estiver vermelha, fica facil descobrir se e problema visual ou de regra.
- Fica mais facil mudar de 5x5 para outro tamanho no futuro.

## Prioridade 2 - UI Vue Mais Pequena

### 5. Separar `ShopOverlay.vue`

Criar componentes:

- `src/ui/shop/ShopGrid.vue`
- `src/ui/shop/ShopItemCard.vue`
- `src/ui/shop/ShopQuantityPanel.vue`
- `src/ui/shop/ShopBackpackPreview.vue`

O `ShopOverlay.vue` ficaria so:

```vue
<ShopGrid />
<ShopQuantityPanel />
<ShopBackpackPreview />
```

Resultado esperado:

- Fica facil explicar compra, item bloqueado por nivel e preview de quantidade.
- O problema de cards mudarem tamanho fica isolado no `ShopItemCard`.

### 6. Separar `SellOverlay.vue`

Criar:

- `src/ui/sell/SellSlots.vue`
- `src/ui/sell/SellSummary.vue`
- `src/ui/sell/SellBackpack.vue`

Resultado esperado:

- Venda fica simples de testar.
- Som de venda e pagamento ficam mais faceis de localizar.

### 7. Separar `JuiceOverlay.vue`

Criar:

- `src/ui/juice/RecipeList.vue`
- `src/ui/juice/IngredientSummary.vue`
- `src/ui/juice/JuicePreparationSlots.vue`
- `src/ui/juice/JuiceInventoryGrid.vue`

Resultado esperado:

- Mais facil explicar que uma receita aceita quantidades variaveis.
- Mais facil corrigir split com Cmd/Ctrl.
- Mais facil garantir que os quadrados nunca mudam de tamanho.

### 8. Separar overlays de slots reutilizaveis

Neste momento varias UI usam slots parecidos: mochila, quickbar, bau, loja, sumos.

Criar:

- `src/ui/shared/ItemSlot.vue`
- `src/ui/shared/SlotGrid.vue`
- `src/ui/shared/ItemStackView.vue`

Resultado esperado:

- Uma unica regra visual para centrar imagem.
- Uma unica regra para texto nao aumentar o quadrado.
- Menos bugs repetidos entre loja, bau, sumos e quickbar.

## Prioridade 3 - Gameplay Mais Facil de Manter

### 9. Melhorar `useRadialActions.ts`

Este composable decide demasiadas acoes diferentes.

Separar em:

- `src/composables/radial/radialActionGuards.ts`
  - verificar se tem item certo
  - verificar se esta no estado certo

- `src/composables/radial/radialActionHandlers.ts`
  - plantar
  - colher
  - regar
  - fertilizar
  - sulfatar

- `src/composables/radial/radialMessages.ts`
  - mensagens de erro

Resultado esperado:

- Mais facil explicar a wheel do `E`.
- Mais facil alterar uma acao sem tocar nas outras.

### 10. Simplificar `useInventory.ts`

O ficheiro esta aceitavel, mas ainda pode ficar mais didatico.

Separar em:

- `inventorySlots.ts`
  - obter slots
  - guardar slots

- `inventoryStacks.ts`
  - juntar stack
  - dividir stack
  - trocar stack

- `inventoryMove.ts`
  - mover item entre backpack/quickbar/bau/venda/sumos

Resultado esperado:

- A logica de split com Cmd/Ctrl fica mais facil de testar.
- Menos risco de bugs quando se move items entre menus.

### 11. Separar `PlayerManager.ts`

Criar:

- `PlayerMovement.ts`
  - velocidade
  - WASD
  - corpo fisico

- `PlayerAnimations.ts`
  - animacoes por direcao

- `PlayerPersistence.ts`
  - guardar posicao
  - emitir `farm:player-state-changed`

Resultado esperado:

- Se a posicao do player voltar ao spawn, fica claro onde procurar.
- Movimento e save deixam de estar misturados.

## Prioridade 4 - Dados e Textos

### 12. Reduzir `items.ts`

O ficheiro ja foi parcialmente separado por dominio, mas ainda agrega muita coisa.

Separar mais:

- `src/items/index.ts`
- `src/items/catalog.ts`
- `src/items/stacking.ts`
- `src/items/visuals.ts`
- `src/items/labels.ts`

Resultado esperado:

- Items ficam mais faceis de explicar.
- Stack max, icon, nome e preco deixam de parecer uma unica logica gigante.

### 13. Textos i18n por dominio

Os ficheiros `pt.ts` e `en.ts` ainda sao grandes.

Separar:

- `src/i18n/pt/hud.ts`
- `src/i18n/pt/shop.ts`
- `src/i18n/pt/contracts.ts`
- `src/i18n/pt/minigames.ts`
- `src/i18n/pt/radial.ts`

E o mesmo para `en`.

Resultado esperado:

- Alterar texto de loja nao exige abrir um ficheiro enorme.
- Mais facil demonstrar suporte multi-idioma.

## Prioridade 5 - Validacoes e Bugs Faceis de Evitar

### 14. Criar validadores pequenos para save

Adicionar funcoes simples:

- `isValidSaveData(data)`
- `isValidInventorySlot(slot)`
- `isValidPlayerState(state)`
- `isValidTreeSave(tree)`

Resultado esperado:

- Importar JSON errado nao parte o jogo.
- Save antigo e save novo ficam mais seguros.

### 15. Criar testes simples para funcoes puras

Mesmo sem framework pesada, dava para testar funcoes puras com um script pequeno.

Prioridade de testes:

- stacks de inventario
- receitas de sumo
- contratos
- XP e nivel
- normalizacao de save
- validacao de plantacao 5x5

Resultado esperado:

- Menos medo de alterar inventario.
- Mais seguranca antes da entrega.

## Regras de Simplificacao Para Seguir

Estas regras devem guiar qualquer refatoracao futura:

1. Se uma funcao tiver mais de 40 linhas, tentar dividir.
2. Se um ficheiro passar 250 linhas, perguntar se tem mais de uma responsabilidade.
3. Se uma funcao tem `if` para 4 casos diferentes, considerar um mapa/config.
4. Se dois overlays desenham slots parecidos, usar componente partilhado.
5. Se uma regra de gameplay usa strings soltas, mover para constante.
6. Se um componente Vue tem muita regra de jogo, mover para composable.
7. Se um manager Phaser faz visual e regra ao mesmo tempo, separar em renderer + system.
8. Se uma alteracao exige mexer em 4 ficheiros, provavelmente falta uma abstracao pequena.

## O Que Eu Nao Refatoraria Antes da Entrega

Estas partes podem ficar como estao se o objetivo for entregar hoje:

- `Game.ts`, porque ja esta como orquestrador razoavel.
- `MapManager.ts`, porque mexer nele pode afetar interiores/cameras.
- `Preloader.ts`, a menos que haja assets a falhar.
- `WaterPipePuzzle.vue`, se o minigame estiver funcional.
- `SulfateMixer.vue`, se o fluxo do sulfatador estiver correto.

## Plano Recomendado em 3 Passos

### Passo 1 - Mais seguro

- Criar `ItemSlot.vue` e `SlotGrid.vue`.
- Usar nos overlays principais.
- Validar visualmente loja, bau, sumos e quickbar.

### Passo 2 - Melhor para explicar

- Separar `usePlayerData.ts` em save/load, plots, contratos e progresso.
- Separar `PlayerManager.ts` em movimento, animacoes e persistencia.
- Separar `TreePlantingSystem.ts` em preview e validacao.

### Passo 3 - Polimento

- Separar i18n por dominio.
- Criar testes simples para inventario, save e receitas.
- Limpar strings soltas e constantes duplicadas.

## Estado Ideal Para Apresentacao

O projeto ficaria muito facil de defender se conseguissemos dizer:

- `App.vue` so liga os sistemas.
- `usePlayerData` so guarda estado.
- `useInventory` so move items.
- `useMarket` so compra/vende.
- `TreeManager` so coordena arvores.
- `TreePlantingSystem` so trata plantacao.
- Cada overlay Vue so mostra uma janela.
- Cada minigame e independente.

Isto deixa o codigo com uma narrativa simples: Phaser gere o mundo, Vue gere menus, composables gerem regras, e o save guarda tudo.
