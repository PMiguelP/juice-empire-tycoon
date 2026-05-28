<script setup>
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
]);

const slotLabel = (index, labels, recipe) => {
	if (index < 3) {
		return `${labels.fruit}: ${recipe.fruit}`;
	}
	if (index < 5) {
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
							<span>{{ labels.fruitSlots }}</span>
							<strong>{{ recipes[selectedRecipeIndex].fruit }}</strong>
						</div>
						<div class="juice-requirement">
							<span>{{ labels.waterSlots }}</span>
							<strong>{{ itemLabel("water") }}</strong>
						</div>
						<div class="juice-requirement">
							<span>{{ labels.bottleSlots }}</span>
							<strong>{{ itemLabel("empty-bottle") }}</strong>
						</div>
					</div>

					<div class="juice-section-title">{{ labels.slots }}</div>
					<div class="juice-slots">
						<button
							v-for="(item, index) in juiceSlots"
							:key="`juice-slot-${index}`"
							class="juice-slot"
							:class="{ 'is-draggable': Boolean(item) }"
							type="button"
							draggable="true"
							@dragstart="emit('drag-start', 'juice', index)"
							@dragend="emit('drag-end')"
							@dragover.prevent
							@drop="emit('drop', 'juice', index)"
						>
							<span v-if="item" class="item-stack">
								<span
									class="item-token"
									:style="{
										'--item-color': itemVisual(item).color,
										'--item-accent': itemVisual(item).accent,
									}"
								>
									{{ itemVisual(item).symbol }}
								</span>
								<span class="juice-slot-item">{{ itemLabel(item) }}</span>
								<span class="item-quantity">
									{{ itemQuantity(item) }}/{{ itemMax(item) }}
								</span>
							</span>
							<span class="juice-slot-label">
								{{ slotLabel(index, labels, recipes[selectedRecipeIndex]) }}
							</span>
						</button>
					</div>

					<button class="juice-action" type="button">
						{{ labels.action }}
					</button>
					<div class="juice-note">{{ labels.closeHint }}</div>
				</div>

				<div class="juice-inventory">
					<div class="inventory-backpack">
						<div class="inventory-section-title">{{ labels.backpack }}</div>
						<div class="inventory-grid">
							<button
								v-for="(item, index) in backpack"
								:key="`juice-backpack-${index}`"
								class="inventory-cell"
								:class="{
									'is-selected': selectedBackpackIndex === index,
									'is-draggable': Boolean(item),
								}"
								type="button"
								@click="emit('select-backpack', index)"
								draggable="true"
								@dragstart="emit('drag-start', 'backpack', index)"
								@dragend="emit('drag-end')"
								@dragover.prevent
								@drop="emit('drop', 'backpack', index)"
							>
								<span v-if="item" class="item-stack">
									<span
										class="item-token"
										:style="{
											'--item-color': itemVisual(item).color,
											'--item-accent': itemVisual(item).accent,
										}"
									>
										{{ itemVisual(item).symbol }}
									</span>
									<span class="inventory-cell-label">{{ itemLabel(item) }}</span>
									<span class="item-quantity">
										{{ itemQuantity(item) }}/{{ itemMax(item) }}
									</span>
								</span>
								<span class="inventory-cell-index">{{ index + 1 }}</span>
							</button>
						</div>
					</div>

					<div class="inventory-quickbar">
						<div class="inventory-section-title">{{ labels.quickbar }}</div>
						<div class="inventory-quickbar-grid">
							<button
								v-for="(item, index) in inventory"
								:key="`juice-quickbar-${index}`"
								class="inventory-cell"
								:class="{
									'is-selected': inventoryIndex === index,
									'is-draggable': Boolean(item),
								}"
								type="button"
								@click="emit('assign-quickbar', index)"
								draggable="true"
								@dragstart="emit('drag-start', 'quickbar', index)"
								@dragend="emit('drag-end')"
								@dragover.prevent
								@drop="emit('drop', 'quickbar', index)"
							>
								<span v-if="item" class="item-stack">
									<span
										class="item-token"
										:style="{
											'--item-color': itemVisual(item).color,
											'--item-accent': itemVisual(item).accent,
										}"
									>
										{{ itemVisual(item).symbol }}
									</span>
									<span class="inventory-cell-label">{{ itemLabel(item) }}</span>
									<span class="item-quantity">
										{{ itemQuantity(item) }}/{{ itemMax(item) }}
									</span>
								</span>
								<span class="inventory-cell-index">{{ index + 1 }}</span>
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
