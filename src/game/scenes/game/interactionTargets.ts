import type { InteractionTarget } from "./types";
import type { InteractionLabelKey } from "./interactionLabels";

type InteriorServiceTarget = {
	layerName: string;
	action: NonNullable<InteractionTarget["action"]>;
	label: InteractionLabelKey;
	fallbackOffsetX?: number;
	fallbackOffsetY?: number;
};

export const INTERIOR_SERVICE_TARGETS: Record<string, InteriorServiceTarget[]> = {
	centrifugadora: [{ layerName: "bau", action: "juice", label: "juice" }],
	mercadocompra: [{ layerName: "bau", action: "shop", label: "shop" }],
	mercadovenda: [{ layerName: "bau", action: "sell", label: "sell" }],
	camera: [
		{ layerName: "bau", action: "farm", label: "farm", fallbackOffsetX: -78 },
		{
			layerName: "contratos",
			action: "contracts",
			label: "contracts",
			fallbackOffsetX: 150,
			fallbackOffsetY: 128,
		},
	],
	barn: [{ layerName: "bau", action: "chest", label: "chest" }],
};

export const INTERIOR_ACTION_EVENTS: Partial<
	Record<NonNullable<InteractionTarget["action"]>, string>
> = {
	farm: "ui:open-farm",
	shop: "ui:open-shop",
	sell: "ui:open-sell",
	juice: "ui:open-juice",
	chest: "ui:open-barn-chest",
	contracts: "ui:open-contracts",
};
