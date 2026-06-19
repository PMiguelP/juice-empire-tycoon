import { onMounted, onUnmounted, ref } from "vue";
import type { SlotKind, useInventory } from "./useInventory";
import type { useMarket } from "./useMarket";
import { getItemQuantity } from "../items";

export type DragSource =
	| {
			kind: SlotKind;
			index: number;
			quantity: number | null;
	  }
	| {
			kind: "shop";
			itemId: string;
			quantity: number;
	  }
	| null;

type InventoryApi = ReturnType<typeof useInventory>;
type MarketApi = ReturnType<typeof useMarket>;

export const useDragAndDrop = (inventory: InventoryApi, market: MarketApi) => {
	const dragSource = ref<DragSource>(null);
	const splitModifierHeld = ref(false);

	const updateSplitModifier = (event: KeyboardEvent) => {
		splitModifierHeld.value = event.metaKey || event.ctrlKey;
	};

	const clearSplitModifier = () => {
		splitModifierHeld.value = false;
	};

	const handleDragStart = (
		kind: SlotKind,
		index: number,
		quantity: number | null = null,
	) => {
		if (!inventory.getSlots(kind)[index]) {
			return;
		}
		dragSource.value = { kind, index, quantity };
	};

	const handleShopDragStart = (itemId: string, quantity = 1) => {
		dragSource.value = {
			kind: "shop",
			itemId,
			quantity: Math.max(1, Math.floor(quantity)),
		};
	};

	const handleDragEnd = () => {
		dragSource.value = null;
		clearSplitModifier();
	};

	const getDropQuantity = (source: NonNullable<DragSource>, event?: DragEvent) => {
		const shouldSplit = Boolean(event?.metaKey || event?.ctrlKey || splitModifierHeld.value);
		if (!shouldSplit) {
			return source.kind === "shop" ? source.quantity : source.quantity;
		}

		if (source.kind === "shop") {
			return Math.max(1, Math.ceil(source.quantity / 2));
		}

		if (source.quantity !== null) {
			return Math.max(1, Math.ceil(source.quantity / 2));
		}

		const sourceEntry = inventory.getSlots(source.kind)[source.index];
		return Math.max(1, Math.ceil(getItemQuantity(sourceEntry) / 2));
	};

	const handleDrop = (kind: SlotKind, index: number, event?: DragEvent) => {
		event?.preventDefault();
		const source = dragSource.value;
		if (!source) {
			return;
		}
		const quantity = getDropQuantity(source, event);

		if (source.kind === "shop") {
			market.buyIntoSlot(kind, index, source.itemId, quantity ?? 1);
		} else {
			inventory.moveStack(
				source.kind,
				source.index,
				kind,
				index,
				quantity,
			);
		}

		dragSource.value = null;
		clearSplitModifier();
	};

	onMounted(() => {
		window.addEventListener("keydown", updateSplitModifier);
		window.addEventListener("keyup", updateSplitModifier);
		window.addEventListener("blur", clearSplitModifier);
	});

	onUnmounted(() => {
		window.removeEventListener("keydown", updateSplitModifier);
		window.removeEventListener("keyup", updateSplitModifier);
		window.removeEventListener("blur", clearSplitModifier);
	});

	return {
		dragSource,
		handleDragStart,
		handleShopDragStart,
		handleDragEnd,
		handleDrop,
	};
};
