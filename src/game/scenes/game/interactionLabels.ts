export type InteractionLanguage = "pt" | "en";

export type InteractionLabelKey =
	| "enter"
	| "exit"
	| "juice"
	| "shop"
	| "sell"
	| "farm"
	| "chest"
	| "contracts"
	| "water";

export const INTERACTION_LABELS: Record<
	InteractionLanguage,
	Record<InteractionLabelKey, string>
> = {
	pt: {
		enter: "ENTRAR",
		exit: "SAIR",
		juice: "SUMOS",
		shop: "LOJA",
		sell: "VENDER",
		farm: "TERRENOS",
		chest: "BAU",
		contracts: "CONTRATOS",
		water: "AGUA",
	},
	en: {
		enter: "ENTER",
		exit: "EXIT",
		juice: "JUICE",
		shop: "SHOP",
		sell: "SELL",
		farm: "PLOTS",
		chest: "CHEST",
		contracts: "TASKS",
		water: "WATER",
	},
};
