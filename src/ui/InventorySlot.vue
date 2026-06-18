<script setup>
import ItemIcon from "./ItemIcon.vue";

defineProps({
	item: { type: [Object, String], default: null },
	index: { type: Number, required: true },
	selected: { type: Boolean, default: false },
	showIndex: { type: Boolean, default: true },
	emptyLabel: { type: String, default: "" },
	itemLabel: { type: Function, required: true },
	itemVisual: { type: Function, required: true },
	itemQuantity: { type: Function, required: true },
	itemMax: { type: Function, required: true },
});

const emit = defineEmits(["activate", "drag-start", "drag-end", "drop"]);
</script>

<template>
	<button
	class="inventory-cell"
		:class="{
			'is-selected': selected,
			'is-draggable': Boolean(item),
			'is-empty': !item,
		}"
		type="button"
		@click="emit('activate', $event)"
		draggable="true"
		@dragstart="emit('drag-start')"
		@dragend="emit('drag-end')"
		@dragover.prevent
		@drop="emit('drop', $event)"
	>
		<slot
			name="content"
			:item="item"
			:index="index"
			:item-label="itemLabel"
			:item-visual="itemVisual"
			:item-quantity="itemQuantity"
			:item-max="itemMax"
		>
			<span v-if="item" class="item-stack">
				<ItemIcon :visual="itemVisual(item)" />
				<span class="inventory-cell-label">
					{{ itemLabel(item) }}
				</span>
				<span class="item-quantity">
					{{ itemQuantity(item) }}/{{ itemMax(item) }}
				</span>
			</span>
			<span v-else-if="emptyLabel" class="inventory-cell-empty-label">
				{{ emptyLabel }}
			</span>
		</slot>
		<slot name="footer" :item="item" :index="index" />
		<span v-if="showIndex" class="inventory-cell-index">
			{{ index + 1 }}
		</span>
	</button>
</template>
