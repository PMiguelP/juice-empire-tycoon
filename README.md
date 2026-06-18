# Juice Tycoon Farm

Juice Tycoon Farm e um jogo 2D feito em Phaser 3, Vue 3 e TypeScript. O jogador gere uma pequena quinta, planta arvores de fruta, rega, fertiliza, protege as arvores de pragas, vende produtos, prepara sumos e desbloqueia novas zonas.

## Identificacao

- Autor: Miguel
- Numero de aluno: preencher antes da submissao
- Versao: 1.0.0

## Tecnologias

- Phaser 3.90.0
- Vue 3.5.13
- TypeScript 5.7
- Vite 6.3

Phaser e usado como motor principal do jogo: mapas, sprites, fisica Arcade, input, camera, cenas e audio. Vue e usado para menus, HUD, inventario, loja, bau, minijogos e overlays.

## Como correr

```bash
npm install
npm run dev-nolog
```

Depois abre o endereco indicado pelo Vite no browser.

Para gerar build de producao:

```bash
npm run build-nolog
```

## Controlos

- `W A S D`: mover o jogador
- `F`: interagir com portas, lojas, bau e maquinas
- `E`: abrir a roda de acoes
- `1-5`: selecionar item da barra rapida
- `G`: inventario
- `K`: mapa da quinta/campos
- `L`: loja, apenas no mercado de compra
- `P`: venda, apenas no mercado de venda
- `J`: receitas de sumo, apenas na centrifugadora
- `N`: minijogo da agua
- `M`: minijogo do sulfato
- `Esc`: pausar ou fechar menus

## Objetivo

O objetivo e evoluir a quinta cumprindo contratos diarios. Ao completar contratos, o jogador recebe moedas e progride. A vitoria acontece quando o jogador completa contratos suficientes; a derrota acontece quando falha demasiados contratos.

## Funcionalidades principais

- Player controlado por teclado
- Mapas exteriores e interiores em Tiled
- Fisica Arcade com colisoes
- Sistema de arvores com crescimento, fruta, rega, fertilizante, sulfato e pragas
- Save/load em localStorage e exportacao/importacao JSON
- Loja, venda, receitas de sumo e bau
- Minijogo de canos para encher agua
- Minijogo de mistura de sulfato
- Audio em MP3 para passos, compra, agua, plantacao, colheita, sulfato, erro e ambiente de menu
- Interface bilingue em Portugues e Ingles

## Assets e multimedia

Os mapas usam ficheiros `.tmj` exportados do Tiled. Os tilesets, interiores, icones e sprites estao em `public/assets`. Os sons estao em `public/assets/sounds` e usam formato MP3, mantendo o tamanho total dos assets controlado.

## Screenshots

Adicionar aqui as capturas finais antes da submissao:

- Menu principal
- Quinta exterior
- Interior da centrifugadora
- Loja ou bau
- Minijogo da agua ou sulfato

## Estrutura

- `src/game`: configuracao Phaser, cenas e managers do jogo
- `src/game/scenes/game`: managers de mapa, jogador, arvores e interacoes
- `src/ui`: overlays Vue da HUD, loja, inventario, bau, menus e minijogos
- `src/composables`: estado partilhado, input, mercado, inventario e saves
- `public/assets`: mapas, sprites, tilesets, icones e sons

## Entrega

Antes da entrega final:

- confirmar build de producao
- preencher numero de aluno
- adicionar screenshots finais
- confirmar README completo
- confirmar que a fisica Arcade continua sem debug
- criar tag `1.0`
