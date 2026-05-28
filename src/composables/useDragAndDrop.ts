import type { Ref } from "vue";
import { ref } from "vue";
import type { InventoryStack } from "../items";
import { addOneToEntry, getItemId, getItemQuantity, getMaxStack } from "../items";
import { ITEM_CATALOG } from "../items";

export type DragSource = {
	kind: "backpack" | "quickbar" | "sell" | "juice";
	index: number;
} | {
	kind: "shop";
	itemId: string;
	quantity: number;
} | null;

type SlotKind = "backpack" | "quickbar" | "sell" | "juice";

export const useDragAndDrop = (
	backpack: Ref<Array<InventoryStack | null>>,
	inventory: Ref<Array<InventoryStack | null>>,
	sellSlots: Ref<Array<InventoryStack | null>>,
	juiceSlots: Ref<Array<InventoryStack | null>>,
	coins: Ref<number>,
	saveState: () => void,
) => {
	const dragSource = ref<DragSource>(null);

	const getItemsByKind = (kind: SlotKind) => {
		if (kind === "backpack") {
			return backpack.value;
		}
		if (kind === "quickbar") {
			return inventory.value;
		}
		if (kind === "juice") {
			return juiceSlots.value;
		}
		return sellSlots.value;
	};

	const setItemsByKind = (
		kind: SlotKind,
		items: Array<InventoryStack | null>,
	) => {
		if (kind === "backpack") {
			backpack.value = items;
			return;
		}
		if (kind === "quickbar") {
			inventory.value = items;
			return;
		}
		if (kind === "juice") {
			juiceSlots.value = items;
			return;
		}
		sellSlots.value = items;
	};

	const handleDragStart = (
		kind: SlotKind,
		index: number,
	) => {
		const sourceItems = getItemsByKind(kind);
		if (!sourceItems[index]) {
			return;
		}

		dragSource.value = { kind, index };
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
	};

	const purchaseIntoSlot = (
		kind: SlotKind,
		index: number,
		itemId: string,
		quantity: number,
	) => {
		const price = ITEM_CATALOG[itemId]?.price ?? 0;
		if (quantity < 1 || quantity > getMaxStack(itemId) || coins.value < price * quantity) {
			return;
		}

		const targetItems = getItemsByKind(kind).slice();
		for (let count = 0; count < quantity; count += 1) {
			const nextEntry = addOneToEntry(targetItems[index], itemId);
			if (!nextEntry) {
				return;
			}
			targetItems[index] = nextEntry;
		}

		coins.value -= price * quantity;
		setItemsByKind(kind, targetItems);
		saveState();
	};

	const moveOrMergeStack = (source: Exclude<DragSource, null | { kind: "shop"; itemId: string; quantity: number }>, kind: SlotKind, index: number) => {
		if (source.kind === kind && source.index === index) {
			return;
		}

		const sourceItems = getItemsByKind(source.kind).slice();
		const sourceEntry = sourceItems[source.index];
		if (!sourceEntry) {
			return;
		}

		if (source.kind === kind) {
			const itemId = getItemId(sourceEntry);
			const targetEntry = sourceItems[index];
			const targetId = getItemId(targetEntry);

			if (itemId && targetId === itemId) {
				const maxStack = getMaxStack(itemId);
				const total = getItemQuantity(sourceEntry) + getItemQuantity(targetEntry);
				const targetQuantity = Math.min(total, maxStack);
				const sourceQuantity = total - targetQuantity;

				sourceItems[index] = { id: itemId, quantity: targetQuantity };
				sourceItems[source.index] =
					sourceQuantity > 0 ? { id: itemId, quantity: sourceQuantity } : null;
			} else {
				sourceItems[source.index] = targetEntry;
				sourceItems[index] = sourceEntry;
			}

			setItemsByKind(kind, sourceItems);
			saveState();
			return;
		}

		const targetItems = getItemsByKind(kind).slice();
		const targetEntry = targetItems[index];
		const itemId = getItemId(sourceEntry);
		const targetId = getItemId(targetEntry);

		if (itemId && targetId === itemId) {
			const maxStack = getMaxStack(itemId);
			const total = getItemQuantity(sourceEntry) + getItemQuantity(targetEntry);
			const targetQuantity = Math.min(total, maxStack);
			const sourceQuantity = total - targetQuantity;

			targetItems[index] = { id: itemId, quantity: targetQuantity };
			sourceItems[source.index] =
				sourceQuantity > 0 ? { id: itemId, quantity: sourceQuantity } : null;
		} else {
			targetItems[index] = sourceEntry;
			sourceItems[source.index] = targetEntry;
		}

		setItemsByKind(source.kind, sourceItems);
		setItemsByKind(kind, targetItems);
		saveState();
	};

	const handleDrop = (kind: SlotKind, index: number) => {
		if (!dragSource.value) {
			return;
		}

		const source = dragSource.value;
		if (source.kind === "shop") {
			purchaseIntoSlot(kind, index, source.itemId, source.quantity);
		} else {
			moveOrMergeStack(source, kind, index);
		}

		dragSource.value = null;
	};

	return {
		dragSource,
		handleDragStart,
		handleShopDragStart,
		handleDragEnd,
		handleDrop,
	};
};
