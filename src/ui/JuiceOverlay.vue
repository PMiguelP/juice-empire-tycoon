<script setup>
import InventoryGrid from "./InventoryGrid.vue";
import InventorySlot from "./InventorySlot.vue";
import ItemIcon from "./ItemIcon.vue";

defineProps({
	open: { type: Boolean, required: true },
	labels: { type: Object, required: true },
	recipes: { type: Array, required: true },
	selectedRecipeIndex: { type: Number, required: true },
	backpack: { type: Array, required: true },
	inventory: { type: Array, required: true },
	juiceSlots: { type: Array, required: true },
	inventoryIndex: { type: Number, required: true },
	selectedBackpackIndex: { type: Number, default: null },
	itemLabel: { type: Function, required: true },
	itemVisual: { type: Function, required: true },
	itemQuantity: { type: Function, required: true },
	itemMax: { type: Function, required: true },
});

const emit = defineEmits([
	"close",
	"select-recipe",
	"select-backpack",
	"assign-quickbar",
	"drag-start",
	"drag-end",
	"drop",
	"craft",
]);

const slotLabel = (index, labels, recipe) => {
	if (index === 0) {
		return `${labels.fruit}: ${recipe.fruit}`;
	}
	if (index === 1) {
		return labels.water;
	}
	return labels.bottle;
};
</script>

<template>
	<div class="juice-overlay" :class="{ 'is-open': open }">
		<div class="juice-scrim"></div>
		<div class="juice-panel" role="dialog" :aria-label="labels.title">
			<div class="juice-header">
				<div>
					<div class="juice-title">{{ labels.title }}</div>
					<div class="juice-subtitle">{{ labels.subtitle }}</div>
				</div>
				<button
					class="juice-close"
					type="button"
					@click="emit('close')"
					aria-label="Close juice recipes"
				>
					✕
				</button>
			</div>

			<div class="juice-body">
				<div class="juice-recipes">
					<div class="juice-section-title">{{ labels.recipes }}</div>
					<button
						v-for="(recipe, index) in recipes"
						:key="recipe.id"
						class="juice-recipe"
						:class="{ 'is-active': selectedRecipeIndex === index }"
						type="button"
						@click="emit('select-recipe', index)"
					>
						<span class="juice-recipe-name">{{ recipe.name }}</span>
						<span class="juice-recipe-description">{{ recipe.description }}</span>
					</button>
				</div>

				<div class="juice-crafting">
					<div class="juice-section-title">{{ labels.ingredients }}</div>
					<div class="juice-requirements">
						<div class="juice-requirement">
							<span>{{ recipes[selectedRecipeIndex].fruitCount ?? 3 }}x {{ labels.fruit }}</span>
							<strong>{{ recipes[selectedRecipeIndex].fruit }}</strong>
						</div>
						<div class="juice-requirement">
							<span>{{ recipes[selectedRecipeIndex].waterCount ?? 1 }}x {{ labels.water }}</span>
							<strong>{{ itemLabel("filled-water-jug") }}</strong>
						</div>
						<div class="juice-requirement">
							<span>{{ recipes[selectedRecipeIndex].bottleCount ?? 1 }}x {{ labels.bottle }}</span>
							<strong>{{ itemLabel("empty-bottle") }}</strong>
						</div>
					</div>

					<div class="juice-section-title">{{ labels.slots }}</div>
					<div class="juice-slots">
						<InventorySlot
							v-for="(item, index) in juiceSlots"
							:key="`juice-slot-${index}`"
							class="juice-slot"
							:item="item"
							:index="index"
							:show-index="false"
							:empty-label="slotLabel(index, labels, recipes[selectedRecipeIndex])"
							:item-label="itemLabel"
							:item-visual="itemVisual"
							:item-quantity="itemQuantity"
							:item-max="itemMax"
							@drag-start="emit('drag-start', 'juice', index)"
							@drag-end="emit('drag-end')"
							@drop="emit('drop', 'juice', index, $event)"
						>
							<template #content>
								<span v-if="item" class="item-stack">
									<ItemIcon :visual="itemVisual(item)" />
									<span class="juice-slot-item">{{ itemLabel(item) }}</span>
									<span class="item-quantity">
										{{ itemQuantity(item) }}/{{ itemMax(item) }}
									</span>
								</span>
								<span v-else class="inventory-cell-empty-label">
									{{ slotLabel(index, labels, recipes[selectedRecipeIndex]) }}
								</span>
							</template>
							<template #footer>
								<span class="juice-slot-label">
									{{ slotLabel(index, labels, recipes[selectedRecipeIndex]) }}
								</span>
							</template>
						</InventorySlot>
					</div>

					<button class="juice-action" type="button" @click="emit('craft')">
						{{ labels.action }}
					</button>
					<div class="juice-note">{{ labels.closeHint }}</div>
				</div>

				<div class="juice-inventory">
					<div class="inventory-backpack">
						<div class="inventory-section-title">{{ labels.backpack }}</div>
						<InventoryGrid>
							<InventorySlot
								v-for="(item, index) in backpack"
								:key="`juice-backpack-${index}`"
								:item="item"
								:index="index"
								:selected="selectedBackpackIndex === index"
								:item-label="itemLabel"
								:item-visual="itemVisual"
								:item-quantity="itemQuantity"
								:item-max="itemMax"
								@activate="emit('select-backpack', index)"
								@drag-start="emit('drag-start', 'backpack', index)"
								@drag-end="emit('drag-end')"
								@drop="emit('drop', 'backpack', index, $event)"
							/>
						</InventoryGrid>
					</div>

					<div class="inventory-quickbar">
						<div class="inventory-section-title">{{ labels.quickbar }}</div>
						<InventoryGrid variant="quickbar">
							<InventorySlot
								v-for="(item, index) in inventory"
								:key="`juice-quickbar-${index}`"
								:item="item"
								:index="index"
								:selected="inventoryIndex === index"
								:item-label="itemLabel"
								:item-visual="itemVisual"
								:item-quantity="itemQuantity"
								:item-max="itemMax"
								@activate="emit('assign-quickbar', index)"
								@drag-start="emit('drag-start', 'quickbar', index)"
								@drag-end="emit('drag-end')"
								@drop="emit('drop', 'quickbar', index, $event)"
							/>
						</InventoryGrid>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
