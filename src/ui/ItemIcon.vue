<script setup lang="ts">
import type { ItemVisual } from "../items";

defineProps<{
	visual: ItemVisual;
}>();
</script>

<template>
	<span
		class="item-token"
		:class="{ 'has-image': visual.image }"
		:style="{
			'--item-color': visual.color,
			'--item-accent': visual.accent,
		}"
	>
		<img
			v-if="visual.image"
			class="item-token-image"
			:src="visual.image"
			:alt="visual.symbol"
			draggable="false"
		/>
		<span v-else>{{ visual.symbol }}</span>
	</span>
</template>
