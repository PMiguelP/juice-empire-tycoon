import type { Ref } from "vue";
import type { InventoryStack } from "../items";
import {
	addQuantityToEntry,
	addQuantityToSlots,
	getItemId,
	getItemQuantity,
	getMaxStack,
	removeQuantityFromEntry,
} from "../items";

export type SlotKind = "backpack" | "quickbar" | "sell" | "juice" | "storage";
export type SlotEntry = InventoryStack | null;

export const useInventory = (
	backpack: Ref<SlotEntry[]>,
	inventory: Ref<SlotEntry[]>,
	storage: Ref<SlotEntry[]>,
	sellSlots: Ref<SlotEntry[]>,
	juiceSlots: Ref<SlotEntry[]>,
	saveState: () => void,
) => {
	const getSlots = (kind: SlotKind) => {
		if (kind === "backpack") {
			return backpack.value;
		}
		if (kind === "quickbar") {
			return inventory.value;
		}
		if (kind === "storage") {
			return storage.value;
		}
		if (kind === "juice") {
			return juiceSlots.value;
		}
		return sellSlots.value;
	};

	const setSlots = (kind: SlotKind, items: SlotEntry[]) => {
		if (kind === "backpack") {
			backpack.value = items;
			return;
		}
		if (kind === "quickbar") {
			inventory.value = items;
			return;
		}
		if (kind === "storage") {
			storage.value = items;
			return;
		}
		if (kind === "juice") {
			juiceSlots.value = items;
			return;
		}
		sellSlots.value = items;
	};

	const placeIntoSlot = (
		kind: SlotKind,
		index: number,
		itemId: string,
		quantity = 1,
		shouldSave = true,
	) => {
		const amount = Math.max(1, Math.floor(quantity));
		const slots = getSlots(kind).slice();
		const nextEntry = addQuantityToEntry(slots[index], itemId, amount);
		if (!nextEntry) {
			return false;
		}
		slots[index] = nextEntry;
		setSlots(kind, slots);
		if (shouldSave) {
			saveState();
		}
		return true;
	};

	const placeIntoFirstAvailable = (
		kind: SlotKind,
		itemId: string,
		quantity = 1,
		preferredIndex: number | null = null,
		shouldSave = true,
	) => {
		const amount = Math.max(1, Math.floor(quantity));
		const nextSlots = addQuantityToSlots(
			getSlots(kind),
			itemId,
			amount,
			preferredIndex,
		);
		if (!nextSlots) {
			return false;
		}
		setSlots(kind, nextSlots);
		if (shouldSave) {
			saveState();
		}
		return true;
	};

	const removeFromSlot = (
		kind: SlotKind,
		index: number,
		quantity = 1,
		shouldSave = true,
	) => {
		const slots = getSlots(kind).slice();
		const entry = slots[index];
		if (!entry) {
			return false;
		}
		slots[index] = removeQuantityFromEntry(entry, quantity);
		setSlots(kind, slots);
		if (shouldSave) {
			saveState();
		}
		return true;
	};

	const saveSlotChanges = (
		fromKind: SlotKind,
		sourceSlots: SlotEntry[],
		toKind: SlotKind,
		targetSlots: SlotEntry[],
	) => {
		setSlots(fromKind, sourceSlots);
		if (fromKind !== toKind) {
			setSlots(toKind, targetSlots);
		}
		saveState();
		return true;
	};

	const movePartialStack = (
		fromKind: SlotKind,
		fromIndex: number,
		toKind: SlotKind,
		toIndex: number,
		sourceEntry: SlotEntry,
		quantity: number,
	) => {
		const itemId = getItemId(sourceEntry);
		if (!itemId) {
			return false;
		}

		const sourceSlots = getSlots(fromKind).slice();
		const targetSlots =
			fromKind === toKind ? sourceSlots : getSlots(toKind).slice();
		const targetEntry = targetSlots[toIndex];
		const nextTargetEntry = addQuantityToEntry(targetEntry, itemId, quantity);
		if (!nextTargetEntry) {
			return false;
		}

		targetSlots[toIndex] = nextTargetEntry;
		sourceSlots[fromIndex] = removeQuantityFromEntry(sourceEntry, quantity);
		return saveSlotChanges(fromKind, sourceSlots, toKind, targetSlots);
	};

	const moveFullStack = (
		fromKind: SlotKind,
		fromIndex: number,
		toKind: SlotKind,
		toIndex: number,
		sourceEntry: SlotEntry,
	) => {
		const sourceSlots = getSlots(fromKind).slice();
		const targetSlots =
			fromKind === toKind ? sourceSlots : getSlots(toKind).slice();
		const targetEntry = targetSlots[toIndex];
		const itemId = getItemId(sourceEntry);
		const targetId = getItemId(targetEntry);

		if (itemId && targetId === itemId) {
			const total = getItemQuantity(sourceEntry) + getItemQuantity(targetEntry);
			const targetQuantity = Math.min(total, getMaxStack(itemId));
			const sourceQuantity = total - targetQuantity;
			targetSlots[toIndex] = { id: itemId, quantity: targetQuantity };
			sourceSlots[fromIndex] =
				sourceQuantity > 0 ? { id: itemId, quantity: sourceQuantity } : null;
		} else {
			targetSlots[toIndex] = sourceEntry;
			sourceSlots[fromIndex] = targetEntry;
		}

		return saveSlotChanges(fromKind, sourceSlots, toKind, targetSlots);
	};

	const moveStack = (
		fromKind: SlotKind,
		fromIndex: number,
		toKind: SlotKind,
		toIndex: number,
		quantity: number | null = null,
	) => {
		if (fromKind === toKind && fromIndex === toIndex) {
			return false;
		}

		const sourceSlots = getSlots(fromKind).slice();
		const sourceEntry = sourceSlots[fromIndex];
		if (!sourceEntry) {
			return false;
		}

		const requestedQuantity = quantity ?? getItemQuantity(sourceEntry);
		const moveQuantity = Math.min(requestedQuantity, getItemQuantity(sourceEntry));
		if (moveQuantity < 1) {
			return false;
		}

		if (moveQuantity !== getItemQuantity(sourceEntry)) {
			return movePartialStack(
				fromKind,
				fromIndex,
				toKind,
				toIndex,
				sourceEntry,
				moveQuantity,
			);
		}

		return moveFullStack(fromKind, fromIndex, toKind, toIndex, sourceEntry);
	};

	return {
		getSlots,
		setSlots,
		moveStack,
		placeIntoSlot,
		placeIntoFirstAvailable,
		removeFromSlot,
	};
};
