# Juice Empire Tycoon

Juice Empire Tycoon é um jogo 2D feito em Phaser 3, Vue 3 e TypeScript. O jogador gere uma pequena quinta, planta árvores de fruta, rega, fertiliza, protege as árvores de pragas, vende produtos, prepara sumos e desbloqueia novas zonas cumprindo contratos diários.

## Identificação

| Campo           | Valor                          |
|-----------------|--------------------------------|
| Autor           | Tiago Pereira Barros           |
| Número de aluno | 32169                          |
| Autor           | Pedro Miguel Fernandes Pereira |
| Número de aluno | 32168                          |
| Versão          | 1.0.0                          |
| Save version    | 15                             |

## Tecnologias

| Tecnologia | Versão |
|------------|--------|
| Phaser     | 3.90.0 |
| Vue        | 3.5.13 |
| TypeScript | 5.7    |
| Vite       | 6.3    |

Phaser é usado como motor principal do jogo: mapas Tiled, sprites, física Arcade, input, câmara, cenas e áudio. Vue é usado para menus, HUD, inventário, loja, baú, minijogos e overlays. A comunicação entre as duas camadas é feita exclusivamente através do EventBus — nunca por referência direta.

## Como correr

```bash
npm install
npm run dev-nolog
```

Abre o endereço indicado pelo Vite no browser. Para build de produção:

```bash
npm run build-nolog
```

## Controlos

### Movimento e interação

| Tecla  | Ação                                                          |
|--------|---------------------------------------------------------------|
| `WASD` | Mover o jogador                                               |
| `F`    | Interagir — entrar em edifícios, abrir loja, baú, água, etc.  |
| `E`    | Abrir a roda de ações (semear, colher, regar, fertilizar…)    |
| `1–5`  | Selecionar item da barra rápida                               |

### Menus e atalhos

| Tecla | Ação                                                               |
|-------|--------------------------------------------------------------------|
| `G`   | Abrir / fechar a mochila                                           |
| `M`   | Abrir o misturador de sulfato                                      |
| `Esc` | Fechar o overlay aberto — ou abrir o menu de pausa se nenhum aberto|

> A loja, bancada de venda, centrifugadora, baú e minijogo da água abrem-se com `F` ao chegar ao local. Não há atalhos de teclado adicionais para esses ecrãs.

---

## Tutorial rápido

### Primeiro dia

1. **Começa na quinta exterior.** O jogador aparece junto ao celeiro com **280 moedas** iniciais.
2. **Vai ao mercado de compra** e prime `F` para entrar. Compra sementes (laranjeira = 28 moedas) e uma regadora.
3. **Volta à quinta** e equipa as sementes na barra rápida (`1–5`).
4. **Prime `E` → Semear.** Clica no chão da quinta para plantar. A árvore cresce em ~25 s (sprout) e ~50 s (adulta).
5. **Enche a regadora:** vai ao **poço de água** no mapa exterior, prime `F` e completa o minijogo de canos.
6. **Rega as árvores** com `E` → Regar. A fruta regrow em ~15 s (9.75 s com fertilizante).

### Crescimento das árvores

| Fase       | Tempo          | Descrição                            |
|------------|----------------|--------------------------------------|
| **Sprout** | 0 → 25 s       | Recém-plantada                       |
| **Small**  | 25 → 50 s      | Arbusto a crescer                    |
| **Full**   | após 50 s      | Adulta — pronta a dar frutos         |

- Cada árvore tem **3 ciclos de colheita**. Após o 3.º ciclo precisa de ser replantada.
- Para iniciar um novo ciclo basta **regar** (fertilizante é opcional — apenas acelera o regrowth).
- Com `E` → **Colher**. Usar a **tesoura** equipada dá +1 fruto por colheita.

### Pragas

- Árvores adultas com frutos têm **10% de probabilidade de praga por dia** (4% se fertilizadas).
- Pragas bloqueiam a colheita — elimina-as com `E` → **Sulfatar** (requer sulfatador carregado).
- Usa `M` para preparar o misturador de sulfato. Qualidade **perfeita** protege a árvore por 4 dias.

### Contratos diários

- Interage com o **quadro de contratos** (`F`) para aceitar uma encomenda.
- Cada contrato pede fruta ou sumo num prazo de **12 horas de jogo** (~4 minutos reais).
- A dificuldade aumenta +1 unidade a cada 3 dias (máximo +5).
- Completar contratos dá **moedas + XP**. Acumular XP desbloqueia níveis e novos campos.
- Falhar demasiados contratos termina o jogo.

### Sumos

1. Vai à **centrifugadora** e prime `F`.
2. Coloca **fruta** no slot 0, **água** no slot 1 e um **frasco vazio** no slot 2.
3. Escolhe a receita e prime Produzir. Sumos valem significativamente mais do que a fruta crua.

| Sumo               | Venda  |
|--------------------|--------|
| Sumo de laranja    | 42 💰  |
| Sumo de limão      | 38 💰  |
| Sumo de pêssego    | 52 💰  |
| Sumo de romã       | 58 💰  |

### Guardar e carregar

O jogo guarda automaticamente ao sair de edifícios e ao realizar ações. Podes exportar/importar o save como JSON no menu de pausa (`Esc` → Guardar & Descarregar).

---

## Balanço do jogo

| Parâmetro                 | Valor               |
|---------------------------|---------------------|
| Moedas iniciais           | 280                 |
| Tempo de contrato         | 12 h jogo (~4 min)  |
| Requisito base (laranja)  | 4 unidades          |
| Probabilidade de praga    | 10% / dia           |
| Crescimento (sprout→full) | ~50 s               |
| Regrowth de fruta         | ~15 s (9.75 c/ fert)|
| Colheitas por árvore      | 3 ciclos            |

---

## Funcionalidades principais

- Jogador controlado por teclado com animações por direção (4 direções)
- Mapas exteriores e interiores criados no Tiled (tilemap 78×78)
- Física Arcade com colisões por layer
- Sistema de árvores com crescimento em fases, rega, fertilizante, sulfato e pragas diárias
- Sistema de contratos diários determinísticos — o mesmo dia gera sempre as mesmas ofertas
- Save/load em localStorage; exportação e importação de ficheiro JSON
- Loja, bancada de venda, receitas de sumo e baú do celeiro
- Minijogo de canos para encher água
- Minijogo de mistura de sulfato com 3 níveis de qualidade
- Áudio MP3 desbloqueado no primeiro gesto do utilizador (política autoplay do browser)
- Menu de pausa com aba **Como jogar** e aba **Locais** (hover mostra interior dos edifícios)
- Interface bilingue Português / Inglês

## Estrutura do projeto

```text
src/
  game/              configuração Phaser, cenas e EventBus
  game/scenes/       Boot, Preloader, Game (cena principal)
  game/scenes/game/  managers: mapa, jogador, árvores, interações
  composables/       estado central, input, mercado, inventário, saves
  ui/                overlays Vue: HUD, loja, inventário, baú, minijogos
  items/             catálogo de itens e helpers de slot
public/assets/       mapas JSON, sprites, tilesets, ícones e sons MP3
```

## Assets e multimédia

Mapas exportados do Tiled (`.tmj`). Tilesets, sprites e ícones em `public/assets`. Sons em `public/assets/sounds` (MP3). Imagens dos locais (edifícios exterior + interior) usadas no menu de pausa.

## Screenshots

Adicionar antes da submissão:

- Menu principal / aba Locais
- Quinta exterior com árvores
- Interior da centrifugadora
- Loja ou baú
- Minijogo da água ou sulfato

## Checklist de entrega

- [ ] Build de produção sem erros (`npm run build-nolog`)
- [ ] Physics Arcade sem debug (`debug: false` em `main.ts`)
- [ ] Screenshots finais adicionados
- [ ] Tag `1.0` criada no repositório
