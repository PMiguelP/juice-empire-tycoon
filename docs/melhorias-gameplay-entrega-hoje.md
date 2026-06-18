# Melhorias de gameplay para entrega hoje

Este documento junta as melhorias que dao mais sensacao de jogo acabado sem obrigar a refazer sistemas grandes.

## Prioridade 1 - Plantar com rato e preview

### Ideia

Quando o jogador tiver uma semente selecionada, pode apontar para o chao com o rato antes de plantar.

### Comportamento

- Ao passar o rato por cima do mapa, aparece uma preview da area da arvore.
- Tiles validos ficam verdes.
- Tiles bloqueados ou invalidos ficam vermelhos.
- Ao clicar num tile valido, a arvore e plantada nesse sitio.
- Ao clicar num tile invalido, aparece feedback visual de erro.

### Regra sugerida

Manter a mesma regra atual das arvores: cada arvore ocupa uma area `3x3`.

Isto e mais simples de explicar e evita inconsistencias entre plantar com tecla e plantar com rato.

### Ficheiros provaveis

- `src/game/scenes/game/TreePlantingSystem.ts`
- `src/game/scenes/game/TreeManager.ts`
- `src/game/scenes/Game.ts`
- `src/composables/useRadialActions.ts`

## Prioridade 2 - Transparencia das arvores quando tapam o player

### Ideia

Quando o jogador passa por tras ou por baixo de uma arvore, a arvore fica semi-transparente.

### Comportamento

- Se o player estiver perto da base/tronco da arvore, a arvore baixa alpha para cerca de `0.45`.
- Quando o player sai dessa zona, a arvore volta a alpha `1`.
- Fazer primeiro nas arvores plantadas pelo jogador.

### Nota

As arvores que estao numa tilemap layer chamada `trees` podem ser mais dificeis, porque mexer no alpha da layer inteira pode afetar muitas tiles ao mesmo tempo.

Para entrega hoje, o melhor e:

1. Implementar transparencia nas arvores geradas pelo jogo.
2. Se sobrar tempo, estudar a layer `trees`.

### Ficheiros provaveis

- `src/game/scenes/game/TreeRenderer.ts`
- `src/game/scenes/game/TreeManager.ts`
- `src/game/scenes/game/PlayerManager.ts`

## Prioridade 3 - Sulfatador carregado em vez de sulfato na mao

### Problema atual

A logica ainda mistura duas coisas diferentes:

- o sulfato como ingrediente comprado na loja;
- o sulfatador como ferramenta que aplica o produto na arvore.

Neste momento o jogador pode sentir que precisa de ter o sulfato na mao para tratar a arvore, mas isso nao e a regra mais natural.

### Logica correta

O fluxo ideal deve ser:

1. O jogador equipa um item de sulfato:
   - `sulfate-basic`
   - `sulfate-strong`
   - `sulfate-premium`
2. Ao usar/preparar, abre o minigame de mistura.
3. Se o minigame tiver sucesso, o sulfato e consumido.
4. O sulfatador fica carregado.
5. Para tratar uma arvore, o jogo verifica se o jogador tem o sulfatador carregado.
6. Ao sulfatar uma arvore, a carga do sulfatador e consumida.

### Estado sugerido

Usar um estado simples, por exemplo:

```ts
sprayerCharge: {
  quality: "perfect" | "good" | "poor";
  sulfateId: "sulfate-basic" | "sulfate-strong" | "sulfate-premium";
} | null;
```

### Regras de gameplay

- O sulfato e ingrediente.
- O sulfatador e ferramenta.
- O minigame carrega o sulfatador.
- A arvore so aceita sulfato se o sulfatador estiver carregado.
- A qualidade da mistura afeta a duracao/forca da protecao.

### UI sugerida

- Se o sulfatador estiver vazio, mostrar icon normal.
- Se estiver carregado, mostrar um pequeno brilho/indicador na quickbar.
- Toast apos minigame: `Sulfatador carregado. Equipa-o e trata uma árvore.`
- Erro ao tentar sulfatar sem carga: `O sulfatador está vazio. Prepara uma mistura primeiro.`

### Ficheiros provaveis

- `src/App.vue`
- `src/composables/useMinigameActions.ts`
- `src/composables/useRadialActions.ts`
- `src/composables/usePlayerData.ts`
- `src/composables/playerData/types.ts`
- `src/i18n/pt.ts`
- `src/i18n/en.ts`

## Prioridade 4 - Feedback visual de erro

### Ideia

Quando uma acao falha, o jogador deve perceber logo o motivo.

### Exemplos

- Sem agua para regar.
- Sem fertilizante.
- Sem sulfato preparado.
- Sem sulfatador.
- Inventario cheio.
- Tile invalido para plantar.
- Arvore ainda nao tem fruta.

### Comportamento

- Mostrar uma mensagem pequena no estilo do jogo.
- Tocar som de erro.
- Se for no mapa, mostrar um pequeno popup perto do jogador.

### Ficheiros provaveis

- `src/App.vue`
- `src/composables/useToast.ts`
- `src/composables/useRadialActions.ts`
- `src/game/scenes/game/TreeActions.ts`

## Prioridade 5 - Sons finais

### Sons a confirmar

- Comprar item.
- Vender item.
- Comprar terreno.
- Plantar.
- Colher.
- Regar.
- Encher agua.
- Fertilizar.
- Preparar sulfato.
- Sulfatar.
- Fazer sumo.
- Erro.
- Ambiente/menu.

### Regra

Todos os sons finais devem ser MP3.

### Ficheiros provaveis

- `public/assets/sounds/`
- `src/game/scenes/Preloader.ts`
- `src/composables/useGameAudio.ts`
- `src/composables/useMarket.ts`
- `src/composables/useRadialActions.ts`

## Prioridade 6 - Controlos e tutorial simples

### Ideia

Adicionar uma ajuda curta no menu ou numa primeira tela.

### Texto sugerido

- `WASD` mover
- `E` roda de acoes
- `F` interagir
- `G` inventario
- `N` minigame da agua
- `M` minigame do sulfato
- `J` receitas de sumo, apenas na centrifugadora
- `K` terrenos, apenas na camara municipal

## Prioridade 7 - Regras de menus por edificio

### Confirmar

- Loja de compra so abre no mercado de compra.
- Loja de venda so abre no mercado de venda.
- Compra de terrenos so abre na camara municipal.
- Receitas de sumo so abrem na centrifugadora.
- Bau so abre no barn.
- Sair das casas funciona em todos os interiores.

## Prioridade 8 - Save/load completo

### Confirmar que guarda

- Posicao do player.
- Mapa atual.
- Posicao de retorno ao sair de interiores.
- Arvores plantadas.
- Estado de crescimento das arvores.
- Arvores regadas.
- Arvores fertilizadas.
- Arvores com pragas.
- Protecao de sulfato.
- Campos desbloqueados.
- Inventario.
- Quickbar.
- Bau do barn.
- Slots de venda.
- Slots de sumo.
- Moedas.
- Nivel e XP.
- Dia/hora.
- Contrato atual.

## Ordem recomendada para implementar

1. Plantar com rato e preview verde/vermelho.
2. Transparencia das arvores geradas.
3. Corrigir logica do sulfatador carregado.
4. Feedback visual de erro no mapa.
5. Confirmar todos os sons MP3.
6. Adicionar ajuda simples de controlos.
7. Testar save/load completo.

## O que deixaria para depois da entrega

- Transparencia seletiva em tiles da layer `trees`.
- Animacoes mais complexas de pragas.
- Upgrade do bau.
- Animacoes especiais de compra/venda.
- Tutorial interativo completo.
