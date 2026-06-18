<script setup lang="ts">
import FarmOverlay from "./FarmOverlay.vue";
import InventoryOverlay from "./InventoryOverlay.vue";
import BarnChestOverlay from "./BarnChestOverlay.vue";
import ContractsOverlay from "./ContractsOverlay.vue";
import ShopOverlay from "./ShopOverlay.vue";
import SellOverlay from "./SellOverlay.vue";
import JuiceOverlay from "./JuiceOverlay.vue";

defineProps({
	gameReady: { type: Boolean, required: true },
	farmMenuOpen: { type: Boolean, required: true },
	contractsMenuOpen: { type: Boolean, required: true },
	inventoryMenuOpen: { type: Boolean, required: true },
	barnChestOpen: { type: Boolean, required: true },
	shopMenuOpen: { type: Boolean, required: true },
	sellMenuOpen: { type: Boolean, required: true },
	juiceMenuOpen: { type: Boolean, required: true },
	farmPlots: { type: Array, required: true },
	selectedPlotIndex: { type: Number, required: true },
	coins: { type: Number, required: true },
	isPlotUnlocked: { type: Function, required: true },
	canUnlockPlot: { type: Function, required: true },
	contractOffers: { type: Array, required: true },
	activeContract: { type: Object, default: null },
	selectedContract: { type: Object, default: null },
	selectedContractId: { type: String, default: null },
	backpack: { type: Array, required: true },
	barnStorage: { type: Array, required: true },
	inventory: { type: Array, required: true },
	sellSlots: { type: Array, required: true },
	juiceSlots: { type: Array, required: true },
	selectedBackpackIndex: { type: Number, default: null },
	inventoryIndex: { type: Number, required: true },
	shopItems: { type: Array, required: true },
	juiceRecipes: { type: Array, required: true },
	selectedRecipeIndex: { type: Number, required: true },
	labels: { type: Object, required: true },
	itemLabel: { type: Function, required: true },
	itemVisual: { type: Function, required: true },
	itemQuantity: { type: Function, required: true },
	itemMax: { type: Function, required: true },
	getSellPrice: { type: Function, required: true },
});

const emit = defineEmits([
	"close-farm",
	"close-contracts",
	"close-inventory",
	"close-barn",
	"close-shop",
	"close-sell",
	"close-juice",
	"select-plot",
	"unlock-plot",
	"select-contract",
	"accept-contract",
	"select-backpack",
	"assign-quickbar",
	"drag-start",
	"drag-end",
	"drop",
	"buy",
	"shop-drag-start",
	"sell-items",
	"stage-sell",
	"clear-sell",
	"select-recipe",
	"craft",
]);
</script>

<template>
	<FarmOverlay
		v-if="gameReady"
		:open="farmMenuOpen"
		:farm-plots="farmPlots"
		:selected-plot-index="selectedPlotIndex"
		:coins="coins"
		:is-plot-unlocked="isPlotUnlocked"
		:can-unlock-plot="canUnlockPlot"
		:labels="labels.farm"
		@close="emit('close-farm')"
		@select-plot="emit('select-plot', $event)"
		@unlock-plot="emit('unlock-plot', $event)"
	/>
	<ContractsOverlay
		v-if="gameReady"
		:open="contractsMenuOpen"
		:offers="contractOffers"
		:active-contract="activeContract"
		:selected-contract="selectedContract"
		:selected-contract-id="selectedContractId"
		:labels="labels.contracts"
		:item-label="itemLabel"
		@close="emit('close-contracts')"
		@select="emit('select-contract', $event)"
		@accept="emit('accept-contract', $event)"
	/>
	<InventoryOverlay
		v-if="gameReady"
		:open="inventoryMenuOpen"
		:backpack="backpack"
		:inventory="inventory"
		:selected-backpack-index="selectedBackpackIndex"
		:inventory-index="inventoryIndex"
		:labels="labels.inventory"
		:item-label="itemLabel"
		:item-visual="itemVisual"
		:item-quantity="itemQuantity"
		:item-max="itemMax"
		@close="emit('close-inventory')"
		@select-backpack="emit('select-backpack', $event)"
		@assign-quickbar="emit('assign-quickbar', $event)"
		@drag-start="(kind, index) => emit('drag-start', kind, index)"
		@drag-end="emit('drag-end')"
		@drop="(kind, index, event) => emit('drop', kind, index, event)"
	/>
	<BarnChestOverlay
		v-if="gameReady"
		:open="barnChestOpen"
		:backpack="backpack"
		:storage="barnStorage"
		:inventory="inventory"
		:selected-backpack-index="selectedBackpackIndex"
		:inventory-index="inventoryIndex"
		:item-label="itemLabel"
		:item-visual="itemVisual"
		:item-quantity="itemQuantity"
		:item-max="itemMax"
		@close="emit('close-barn')"
		@select-backpack="emit('select-backpack', $event)"
		@assign-quickbar="emit('assign-quickbar', $event)"
		@drag-start="(kind, index) => emit('drag-start', kind, index)"
		@drag-end="emit('drag-end')"
		@drop="(kind, index, event) => emit('drop', kind, index, event)"
	/>
	<ShopOverlay
		v-if="gameReady"
		:open="shopMenuOpen"
		:shop-items="shopItems"
		:coins="coins"
		:backpack="backpack"
		:inventory="inventory"
		:selected-backpack-index="selectedBackpackIndex"
		:inventory-index="inventoryIndex"
		:labels="labels.shop"
		:item-label="itemLabel"
		:item-visual="itemVisual"
		:item-quantity="itemQuantity"
		:item-max="itemMax"
		@close="emit('close-shop')"
		@buy="(itemId, price, quantity) => emit('buy', itemId, price, quantity)"
		@shop-drag-start="(itemId, quantity) => emit('shop-drag-start', itemId, quantity)"
		@select-backpack="emit('select-backpack', $event)"
		@assign-quickbar="emit('assign-quickbar', $event)"
		@drag-start="(kind, index) => emit('drag-start', kind, index)"
		@drag-end="emit('drag-end')"
		@drop="(kind, index, event) => emit('drop', kind, index, event)"
	/>
	<SellOverlay
		v-if="gameReady"
		:open="sellMenuOpen"
		:backpack="backpack"
		:inventory="inventory"
		:sell-slots="sellSlots"
		:coins="coins"
		:selected-backpack-index="selectedBackpackIndex"
		:inventory-index="inventoryIndex"
		:get-sell-price="getSellPrice"
		:labels="labels.sell"
		:item-label="itemLabel"
		:item-visual="itemVisual"
		:item-quantity="itemQuantity"
		:item-max="itemMax"
		@close="emit('close-sell')"
		@sell-items="emit('sell-items')"
		@stage-sell="(kind, index, quantity) => emit('stage-sell', kind, index, quantity)"
		@clear-sell="emit('clear-sell')"
		@select-backpack="emit('select-backpack', $event)"
		@assign-quickbar="emit('assign-quickbar', $event)"
		@drag-start="(kind, index) => emit('drag-start', kind, index)"
		@drag-end="emit('drag-end')"
		@drop="(kind, index, event) => emit('drop', kind, index, event)"
	/>
	<JuiceOverlay
		v-if="gameReady"
		:open="juiceMenuOpen"
		:labels="labels.juice"
		:recipes="juiceRecipes"
		:selected-recipe-index="selectedRecipeIndex"
		:backpack="backpack"
		:inventory="inventory"
		:juice-slots="juiceSlots"
		:selected-backpack-index="selectedBackpackIndex"
		:inventory-index="inventoryIndex"
		:item-label="itemLabel"
		:item-visual="itemVisual"
		:item-quantity="itemQuantity"
		:item-max="itemMax"
		@close="emit('close-juice')"
		@select-recipe="emit('select-recipe', $event)"
		@select-backpack="emit('select-backpack', $event)"
		@assign-quickbar="emit('assign-quickbar', $event)"
		@drag-start="(kind, index) => emit('drag-start', kind, index)"
		@drag-end="emit('drag-end')"
		@drop="(kind, index, event) => emit('drop', kind, index, event)"
		@craft="emit('craft')"
	/>
</template>
