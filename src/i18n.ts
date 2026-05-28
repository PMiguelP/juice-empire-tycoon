import { computed, ref } from "vue";
import type { InventoryEntry } from "./items";
import { getItemId } from "./items";

export type Language = "pt" | "en";

const LANGUAGE_KEY = "juice-language";

export const translations = {
	pt: {
		languageName: "Português",
		mainMenu: {
			title: "Juice",
			subtitle: "Uma pequena aventura de quinta, loja e exploração.",
			language: "Idioma",
			start: "Começar",
			continue: "Continuar",
			guideTitle: "Guia rápido",
			guide: [
				{ key: "W A S D", text: "Mover a personagem" },
				{ key: "F", text: "Interagir quando aparecer o aviso" },
				{ key: "E", text: "Abrir roda de ações" },
				{ key: "K", text: "Abrir mapa da quinta" },
				{ key: "G", text: "Abrir inventário" },
				{ key: "L", text: "Abrir loja" },
				{ key: "P", text: "Abrir venda" },
				{ key: "J", text: "Abrir receitas de sumo" },
				{ key: "1-5", text: "Selecionar barra rápida" },
				{ key: "Esc", text: "Pausar ou fechar menus" },
			],
		},
		hud: {
			level: "Nível",
		},
		radial: {
			title: "Ações",
			hint: "Carrega E para fechar",
			items: [
				{ label: "Plantar", description: "Coloca sementes na terra preparada" },
				{ label: "Colher", description: "Recolhe culturas prontas" },
				{ label: "Regar", description: "Rega a terra perto de ti" },
				{ label: "Semente", description: "Escolhe o tipo de semente" },
				{ label: "Fertilizar", description: "Acelera o crescimento" },
				{ label: "Cavar", description: "Prepara a terra para plantar" },
				{ label: "Criar", description: "Constrói itens simples" },
				{ label: "Cozinhar", description: "Transforma colheitas em refeições" },
			],
		},
		farm: {
			title: "Mapa da Quinta",
			subtitle: "Gere os teus terrenos",
			myFarm: "A minha quinta",
			unlocked: "Desbloqueado",
			locked: "Bloqueado",
			plotSize: "Tamanho",
			status: "Estado",
			availableCoins: "Moedas disponíveis",
			ready: "Pronto",
			unlockFor: (cost: number) => `Desbloquear por ${cost} moedas`,
			closeHint: "Carrega K para fechar.",
			plots: [
				{ name: "Campo Sul", size: "15 blocos" },
				{ name: "Campo Este", size: "15 blocos" },
				{ name: "Campo Norte", size: "15 blocos" },
			],
		},
		inventory: {
			title: "Inventário",
			subtitle: "Seleciona uma mochila e atribui à barra rápida.",
			backpack: "Mochila",
			quickbar: "Barra rápida",
			closeHint: "Carrega G ou Esc para fechar.",
		},
		shop: {
			title: "Loja & Inventário",
			subtitle: "Compra itens e organiza o inventário.",
			shop: "Loja",
			backpack: "Mochila",
			quickbar: "Barra rápida",
			coins: "moedas",
			available: "Disponível",
			quantity: "Quantidade",
			buy: "Comprar",
			max: "Máx.",
			selectItem: "Escolhe um item",
			total: "Total",
			closeHint: "Carrega L ou Esc para fechar.",
		},
		sell: {
			title: "Venda",
			subtitle: "Arrasta itens para os espaços da direita para vender.",
			backpack: "Mochila",
			quickbar: "Barra rápida",
			slots: "Espaços de venda",
			action: "Vender itens",
			closeHint: "Carrega P ou Esc para fechar.",
		},
		juice: {
			title: "Receitas de Sumo",
			subtitle: "Escolhe uma receita e coloca os ingredientes nos espaços.",
			recipes: "Receitas",
			ingredients: "Ingredientes",
			slots: "Preparação",
			backpack: "Mochila",
			quickbar: "Barra rápida",
			fruit: "Fruta",
			water: "Água",
			bottle: "Frasco",
			fruitSlots: "3 frutas",
			waterSlots: "2 partes de água",
			bottleSlots: "2 frascos vazios",
			action: "Preparar sumo",
			closeHint: "Carrega J ou Esc para fechar.",
			recipesList: [
				{
					id: "orange-juice",
					name: "Sumo de laranja",
					description: "Leva 3 laranjas, 2 partes de água e 2 frascos vazios.",
					fruit: "Laranja",
				},
				{
					id: "pomegranate-juice",
					name: "Sumo de romã",
					description: "Leva 3 romãs, 2 partes de água e 2 frascos vazios.",
					fruit: "Romã",
				},
				{
					id: "peach-juice",
					name: "Sumo de pêssego",
					description: "Leva 3 pêssegos, 2 partes de água e 2 frascos vazios.",
					fruit: "Pêssego",
				},
				{
					id: "lemon-juice",
					name: "Sumo de limão",
					description: "Leva 3 limões, 2 partes de água e 2 frascos vazios.",
					fruit: "Limão",
				},
			],
		},
		pause: {
			title: "Menu do Jogo",
			subtitle: "Gere o save e volta ao jogo",
			language: "Idioma",
			resume: "Continuar",
			saveDownload: "Guardar & Descarregar",
			upload: "Carregar gravação",
			footnote: "As gravações ficam guardadas localmente no browser.",
		},
		items: {
			"seed-bag": "Saco de sementes",
			fertilizer: "Fertilizante",
			shovel: "Pá",
			potion: "Poção de vida",
			roasta: "Roasta",
			chappir: "Chappir",
			orange: "Laranja",
			pomegranate: "Romã",
			peach: "Pêssego",
			lemon: "Limão",
			water: "Água",
			"empty-bottle": "Frasco vazio",
			"orange-juice": "Sumo de laranja",
			"pomegranate-juice": "Sumo de romã",
			"peach-juice": "Sumo de pêssego",
			"lemon-juice": "Sumo de limão",
		},
	},
	en: {
		languageName: "English",
		mainMenu: {
			title: "Juice",
			subtitle: "A small farming, shop, and exploration adventure.",
			language: "Language",
			start: "Start",
			continue: "Continue",
			guideTitle: "Quick guide",
			guide: [
				{ key: "W A S D", text: "Move the character" },
				{ key: "F", text: "Interact when the prompt appears" },
				{ key: "E", text: "Open action wheel" },
				{ key: "K", text: "Open farm map" },
				{ key: "G", text: "Open inventory" },
				{ key: "L", text: "Open shop" },
				{ key: "P", text: "Open sell menu" },
				{ key: "J", text: "Open juice recipes" },
				{ key: "1-5", text: "Select quickbar slot" },
				{ key: "Esc", text: "Pause or close menus" },
			],
		},
		hud: {
			level: "Level",
		},
		radial: {
			title: "Actions",
			hint: "Press E to close",
			items: [
				{ label: "Plant", description: "Place seeds on tilled soil" },
				{ label: "Harvest", description: "Collect ready crops" },
				{ label: "Water", description: "Water nearby soil" },
				{ label: "Seed", description: "Select seed type" },
				{ label: "Fertilize", description: "Boost growth speed" },
				{ label: "Till", description: "Prepare soil for planting" },
				{ label: "Craft", description: "Build simple items" },
				{ label: "Cook", description: "Turn crops into meals" },
			],
		},
		farm: {
			title: "Farm Map",
			subtitle: "Manage your plots",
			myFarm: "My Farm",
			unlocked: "Unlocked",
			locked: "Locked",
			plotSize: "Plot size",
			status: "Status",
			availableCoins: "Available coins",
			ready: "Ready",
			unlockFor: (cost: number) => `Unlock for ${cost} coins`,
			closeHint: "Press K to close.",
			plots: [
				{ name: "South Field", size: "15 tiles" },
				{ name: "East Field", size: "15 tiles" },
				{ name: "North Field", size: "15 tiles" },
			],
		},
		inventory: {
			title: "Inventory",
			subtitle: "Select a backpack slot, then assign to quickbar.",
			backpack: "Backpack",
			quickbar: "Quickbar",
			closeHint: "Press G or Esc to close.",
		},
		shop: {
			title: "Merchant Shop & Inventory",
			subtitle: "Click items to buy, then manage in your inventory.",
			shop: "Shop",
			backpack: "Backpack",
			quickbar: "Quickbar",
			coins: "coins",
			available: "Available",
			quantity: "Quantity",
			buy: "Buy",
			max: "Max",
			selectItem: "Select an item",
			total: "Total",
			closeHint: "Press L or Esc to close.",
		},
		sell: {
			title: "Inventory Sell",
			subtitle: "Drag items to the right slots to put them on sale.",
			backpack: "Backpack",
			quickbar: "Quickbar",
			slots: "Sell Slots",
			action: "Sell Items",
			closeHint: "Press P or Esc to close.",
		},
		juice: {
			title: "Juice Recipes",
			subtitle: "Choose a recipe and place the ingredients into the slots.",
			recipes: "Recipes",
			ingredients: "Ingredients",
			slots: "Preparation",
			backpack: "Backpack",
			quickbar: "Quickbar",
			fruit: "Fruit",
			water: "Water",
			bottle: "Bottle",
			fruitSlots: "3 fruits",
			waterSlots: "2 parts water",
			bottleSlots: "2 empty bottles",
			action: "Prepare juice",
			closeHint: "Press J or Esc to close.",
			recipesList: [
				{
					id: "orange-juice",
					name: "Orange juice",
					description: "Needs 3 oranges, 2 parts water, and 2 empty bottles.",
					fruit: "Orange",
				},
				{
					id: "pomegranate-juice",
					name: "Pomegranate juice",
					description: "Needs 3 pomegranates, 2 parts water, and 2 empty bottles.",
					fruit: "Pomegranate",
				},
				{
					id: "peach-juice",
					name: "Peach juice",
					description: "Needs 3 peaches, 2 parts water, and 2 empty bottles.",
					fruit: "Peach",
				},
				{
					id: "lemon-juice",
					name: "Lemon juice",
					description: "Needs 3 lemons, 2 parts water, and 2 empty bottles.",
					fruit: "Lemon",
				},
			],
		},
		pause: {
			title: "Game Menu",
			subtitle: "Manage your save and resume",
			language: "Language",
			resume: "Resume",
			saveDownload: "Save & Download",
			upload: "Upload Save",
			footnote: "Saves are stored locally in your browser.",
		},
		items: {
			"seed-bag": "Seed Bag",
			fertilizer: "Fertilizer",
			shovel: "Shovel",
			potion: "HP Potion",
			roasta: "Roasta",
			chappir: "Chappir",
			orange: "Orange",
			pomegranate: "Pomegranate",
			peach: "Peach",
			lemon: "Lemon",
			water: "Water",
			"empty-bottle": "Empty Bottle",
			"orange-juice": "Orange Juice",
			"pomegranate-juice": "Pomegranate Juice",
			"peach-juice": "Peach Juice",
			"lemon-juice": "Lemon Juice",
		},
	},
} as const;

export type Translation = (typeof translations)[Language];

const getInitialLanguage = (): Language => {
	const saved = localStorage.getItem(LANGUAGE_KEY);
	return saved === "en" || saved === "pt" ? saved : "pt";
};

export const useLanguage = () => {
	const language = ref<Language>(getInitialLanguage());
	const text = computed(() => translations[language.value]);

	const setLanguage = (nextLanguage: Language) => {
		language.value = nextLanguage;
		localStorage.setItem(LANGUAGE_KEY, nextLanguage);
	};

	const itemLabel = (entry: InventoryEntry) => {
		const itemId = getItemId(entry);
		if (!itemId) {
			return "";
		}
		const labels = text.value.items as Record<string, string>;
		return labels[itemId] ?? itemId;
	};

	return {
		language,
		text,
		setLanguage,
		itemLabel,
	};
};
