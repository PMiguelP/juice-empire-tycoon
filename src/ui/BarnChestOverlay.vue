<script setup>
import InventoryGrid from "./InventoryGrid.vue";
import InventorySlot from "./InventorySlot.vue";

defineProps({
	open: { type: Boolean, required: true },
	backpack: { type: Array, required: true },
	storage: { type: Array, required: true },
	inventory: { type: Array, required: true },
	selectedBackpackIndex: { type: Number, default: null },
	inventoryIndex: { type: Number, required: true },
	itemLabel: { type: Function, required: true },
	itemVisual: { type: Function, required: true },
	itemQuantity: { type: Function, required: true },
	itemMax: { type: Function, required: true },
});

const emit = defineEmits([
	"close",
	"select-backpack",
	"assign-quickbar",
	"drag-start",
	"drag-end",
	"drop",
]);
</script>

<template>
	<div class="inventory-overlay" :class="{ 'is-open': open }">
		<div class="inventory-scrim"></div>
		<div class="inventory-panel barn-chest-panel" role="dialog" aria-label="Bau">
			<div class="inventory-header">
				<div>
					<div class="inventory-title">Bau do Celeiro</div>
					<div class="inventory-subtitle">
						Guarda ferramentas, sementes e colheitas para usar mais tarde.
					</div>
				</div>
				<button
					class="inventory-close"
					type="button"
					@click="emit('close')"
					aria-label="Fechar bau"
				>
					x
				</button>
			</div>

			<div class="inventory-body barn-chest-body">
				<div class="inventory-backpack">
					<div class="inventory-section-title">Mochila</div>
					<InventoryGrid>
						<InventorySlot
							v-for="(item, index) in backpack"
							:key="`chest-backpack-${index}`"
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

				<div class="inventory-backpack">
					<div class="inventory-section-title">Bau</div>
					<InventoryGrid class="barn-storage-grid">
						<InventorySlot
							v-for="(item, index) in storage"
							:key="`barn-storage-${index}`"
							:item="item"
							:index="index"
							:item-label="itemLabel"
							:item-visual="itemVisual"
							:item-quantity="itemQuantity"
							:item-max="itemMax"
							@drag-start="emit('drag-start', 'storage', index)"
							@drag-end="emit('drag-end')"
							@drop="emit('drop', 'storage', index, $event)"
						/>
					</InventoryGrid>
				</div>
			</div>

			<div class="inventory-quickbar barn-chest-quickbar">
				<div class="inventory-section-title">Barra Rapida</div>
				<InventoryGrid variant="quickbar">
					<InventorySlot
						v-for="(item, index) in inventory"
						:key="`chest-quickbar-${index}`"
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
</template>
