import type { ComputedRef, Ref } from "vue";
import type { InventoryStack } from "../items";
import { getItemId, getItemQuantity, getMaxStack } from "../items";
import type { useInventory } from "./useInventory";

type InventoryApi = ReturnType<typeof useInventory>;
type SlotEntry = InventoryStack | null;

type JuiceRecipe = {
	id: string;
	fruitCount?: number;
	waterCount?: number;
	bottleCount?: number;
};

type JuiceToastLabels = {
	juiceCraftFailed: string;
	inventoryFull: string;
	juiceCrafted: (label: string, quantity?: number) => string;
	contractComplete: (reward: number) => string;
	levelUp: (level: number) => string;
	xpGained: (amount: number) => string;
};

type UseJuiceCraftOptions = {
	recipes: ComputedRef<JuiceRecipe[]>;
	selectedRecipeIndex: Ref<number>;
	juiceSlots: Ref<SlotEntry[]>;
	backpack: Ref<SlotEntry[]>;
	quickbar: Ref<SlotEntry[]>;
	inventory: InventoryApi;
	xpReward: number;
	addXp: (amount: number) => {
		leveledUp: boolean;
		level: number;
		amount: number;
	};
	itemLabel: (itemId: string) => string;
	onJuiceCrafted?: (
		itemId: string,
		quantity: number,
	) => { completed: boolean; reward: number };
	playSound: (key: string, volume?: number) => void;
	showToast: (message: string) => void;
	labels: ComputedRef<JuiceToastLabels>;
};

const JUICE_RECIPE_FRUIT_IDS: Record<string, string> = {
	"orange-juice": "orange",
	"pomegranate-juice": "pomegranate",
	"peach-juice": "peach",
	"lemon-juice": "lemon",
};

const DEFAULT_JUICE_REQUIREMENTS = {
	fruitCount: 3,
	waterCount: 1,
	bottleCount: 1,
};

export const useJuiceCraft = ({
	recipes,
	selectedRecipeIndex,
	juiceSlots,
	backpack,
	quickbar,
	inventory,
	xpReward,
	addXp,
	itemLabel,
	onJuiceCrafted,
	playSound,
	showToast,
	labels,
}: UseJuiceCraftOptions) => {
	const failCraft = (message = labels.value.juiceCraftFailed) => {
		playSound("error", 0.22);
		showToast(message);
	};

	const getInventoryCapacityForItem = (itemId: string) => {
		const maxStack = getMaxStack(itemId);
		return [...backpack.value, ...quickbar.value].reduce((total, entry) => {
			const entryId = getItemId(entry);
			if (!entryId) {
				return total + maxStack;
			}
			if (entryId === itemId) {
				return total + Math.max(0, maxStack - getItemQuantity(entry));
			}
			return total;
		}, 0);
	};

	const placeCraftedJuice = (itemId: string, quantity: number) => {
		let remaining = Math.max(0, Math.floor(quantity));
		const maxStack = getMaxStack(itemId);

		while (remaining > 0) {
			const amount = Math.min(maxStack, remaining);
			const placed =
				inventory.placeIntoFirstAvailable("backpack", itemId, amount) ||
				inventory.placeIntoFirstAvailable("quickbar", itemId, amount);
			if (!placed) {
				return false;
			}
			remaining -= amount;
		}

		return true;
	};

	const getCraftQuantity = (recipe: JuiceRecipe, fruitId: string) => {
		const slots = juiceSlots.value;
		const fruitSlot = slots[0];
		const waterSlot = slots[1];
		const bottleSlot = slots[2];
		const fruitCount =
			recipe.fruitCount ?? DEFAULT_JUICE_REQUIREMENTS.fruitCount;
		const waterCount =
			recipe.waterCount ?? DEFAULT_JUICE_REQUIREMENTS.waterCount;
		const bottleCount =
			recipe.bottleCount ?? DEFAULT_JUICE_REQUIREMENTS.bottleCount;

		if (
			getItemId(fruitSlot) !== fruitId ||
			getItemId(waterSlot) !== "filled-water-jug" ||
			getItemId(bottleSlot) !== "empty-bottle"
		) {
			return null;
		}

		return {
			quantity: Math.min(
				Math.floor(getItemQuantity(fruitSlot) / fruitCount),
				Math.floor(getItemQuantity(waterSlot) / waterCount),
				Math.floor(getItemQuantity(bottleSlot) / bottleCount),
			),
			fruitCount,
			waterCount,
			bottleCount,
		};
	};

	const showCraftSuccess = (
		recipeId: string,
		quantity: number,
		contractResult?: { completed: boolean; reward: number },
	) => {
		const xpResult = addXp(xpReward * quantity);
		const baseMessage = labels.value.juiceCrafted(itemLabel(recipeId), quantity);
		const xpMessage = xpResult.leveledUp
			? labels.value.levelUp(xpResult.level)
			: labels.value.xpGained(xpResult.amount);
		const contractMessage = contractResult?.completed
			? ` ${labels.value.contractComplete(contractResult.reward)}`
			: "";

		showToast(`${baseMessage} ${xpMessage}${contractMessage}`);
	};

	const handleJuiceCraft = () => {
		const recipe = recipes.value[selectedRecipeIndex.value];
		const fruitId = recipe ? JUICE_RECIPE_FRUIT_IDS[recipe.id] : null;
		if (!recipe || !fruitId) {
			failCraft();
			return;
		}

		const craft = getCraftQuantity(recipe, fruitId);
		if (!craft || craft.quantity < 1) {
			failCraft();
			return;
		}

		if (getInventoryCapacityForItem(recipe.id) < craft.quantity) {
			failCraft(labels.value.inventoryFull);
			return;
		}

		inventory.removeFromSlot("juice", 0, craft.fruitCount * craft.quantity);
		inventory.removeFromSlot("juice", 1, craft.waterCount * craft.quantity);
		inventory.removeFromSlot("juice", 2, craft.bottleCount * craft.quantity);
		if (!placeCraftedJuice(recipe.id, craft.quantity)) {
			failCraft(labels.value.inventoryFull);
			return;
		}

		playSound("juice", 0.42);
		const contractResult = onJuiceCrafted?.(recipe.id, craft.quantity);
		showCraftSuccess(recipe.id, craft.quantity, contractResult);
	};

	return {
		handleJuiceCraft,
	};
};
