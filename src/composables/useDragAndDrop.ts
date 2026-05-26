import type { Ref } from "vue";
import { ref } from "vue";

export type DragSource = {
	kind: "backpack" | "quickbar" | "sell";
	index: number;
} | null;

export const useDragAndDrop = (
	backpack: Ref<Array<string | null>>,
	inventory: Ref<Array<string | null>>,
	sellSlots: Ref<Array<string | null>>,
	saveState: () => void,
) => {
	const dragSource = ref<DragSource>(null);

	const getItemsByKind = (kind: "backpack" | "quickbar" | "sell") => {
		if (kind === "backpack") {
			return backpack.value;
		}
		if (kind === "quickbar") {
			return inventory.value;
		}
		return sellSlots.value;
	};

	const setItemsByKind = (
		kind: "backpack" | "quickbar" | "sell",
		items: Array<string | null>,
	) => {
		if (kind === "backpack") {
			backpack.value = items;
			return;
		}
		if (kind === "quickbar") {
			inventory.value = items;
			return;
		}
		sellSlots.value = items;
	};

	const handleDragStart = (
		kind: "backpack" | "quickbar" | "sell",
		index: number,
	) => {
		const sourceItems = getItemsByKind(kind);
		if (!sourceItems[index]) {
			return;
		}

		dragSource.value = { kind, index };
	};

	const handleDragEnd = () => {
		dragSource.value = null;
	};

	const handleDrop = (
		kind: "backpack" | "quickbar" | "sell",
		index: number,
	) => {
		if (!dragSource.value) {
			return;
		}

		const source = dragSource.value;
		if (source.kind === kind && source.index === index) {
			dragSource.value = null;
			return;
		}

		const sourceItems = getItemsByKind(source.kind).slice();
		const targetItems = getItemsByKind(kind).slice();

		const temp = targetItems[index] ?? null;
		targetItems[index] = sourceItems[source.index] ?? null;
		sourceItems[source.index] = temp;

		setItemsByKind(source.kind, sourceItems);
		setItemsByKind(kind, targetItems);

		dragSource.value = null;
		saveState();
	};

	return {
		dragSource,
		handleDragStart,
		handleDragEnd,
		handleDrop,
	};
};
